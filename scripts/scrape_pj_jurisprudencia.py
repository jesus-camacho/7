"""
Descarga e indexa jurisprudencia penal desde el portal de Jurisprudencia
Sistematizada del Poder Judicial del Peru.

    https://www.pj.gob.pe/wps/wcm/connect/cij-juris/s_jurisprudencia_sistematizada

QUE HACE
--------
1. Abre el buscador de jurisprudencia sistematizada con un navegador real
   (Playwright), filtra por materia penal, y recorre los resultados
   pagina por pagina.
2. Por cada resultado extrae: numero, titulo, sala/organo, fecha, y el
   enlace al PDF.
3. Descarga cada PDF a `descargas/documentos/<id>.pdf`.
4. Escribe un `descargas/resoluciones.json` con los metadatos, en el
   mismo formato que usa el portal (ver `src/types.ts` del proyecto).

ANTES DE CORRERLO: hay que rellenar los selectores marcados con "TODO"
mas abajo. Ver instrucciones al final de este archivo.

COMO CORRERLO
-------------
    pip install playwright
    playwright install chromium
    python scrape_pj_jurisprudencia.py

Es idempotente: si un PDF ya existe en disco, no lo vuelve a descargar,
asi que si se corta a la mitad puedes volver a correrlo sin problema.
"""

from __future__ import annotations

import json
import re
import time
import unicodedata
from dataclasses import asdict, dataclass, field
from pathlib import Path

from playwright.sync_api import sync_playwright, Page

# --------------------------------------------------------------------------
# Configuracion
# --------------------------------------------------------------------------

BASE_URL = "https://www.pj.gob.pe/wps/wcm/connect/cij-juris/s_jurisprudencia_sistematizada"
MATERIA = "penal"  # filtro de materia, ajustar segun las opciones reales del sitio

OUT_DIR = Path(__file__).parent / "descargas"
PDF_DIR = OUT_DIR / "documentos"
JSON_PATH = OUT_DIR / "resoluciones.json"

# Pausa entre acciones (segundos). Súbelo si el sitio empieza a responder
# lento o a bloquear peticiones; es una cortesía hacia un servidor publico
# del Estado, no hace falta ir mas rapido que esto.
REQUEST_DELAY = 1.5

USER_AGENT = (
    "Mozilla/5.0 (compatible; AgenciaPeruanaIA-JurisprudenciaBot/1.0; "
    "uso academico/publico, contacto: <tu-email-aqui>)"
)


@dataclass
class Resolucion:
    id: str
    tipo: str  # "Acuerdo Plenario" | "Casacion" | etc. segun corresponda
    numero: str
    titulo: str
    sala: str
    fecha: str  # formato YYYY-MM-DD si es posible
    citas: int = 0
    resumenRatioDecidendi: str = ""
    articulosAplicados: list[str] = field(default_factory=list)
    pdfUrl: str = ""


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:60]


def descargar_pdf(page: Page, pdf_url: str, destino: Path) -> bool:
    """Descarga un PDF usando el contexto autenticado/cookies del navegador."""
    if destino.exists():
        return True
    destino.parent.mkdir(parents=True, exist_ok=True)
    response = page.context.request.get(pdf_url)
    if response.status != 200:
        print(f"  [!] fallo descarga ({response.status}): {pdf_url}")
        return False
    destino.write_bytes(response.body())
    return True


def extraer_resultados_de_pagina(page: Page) -> list[dict]:
    """
    TODO 1: ajustar el selector de cada "tarjeta"/fila de resultado.
    Abre el sitio en Chrome, click derecho sobre un resultado individual
    de la lista -> "Inspeccionar", y busca el contenedor que se repite
    una vez por cada resolucion (usualmente un <div> o <li> con una clase
    tipo "resultado-item", "search-result", etc.).
    """
    items = page.query_selector_all("TODO-selector-de-cada-resultado")

    resultados = []
    for item in items:
        # TODO 2: ajustar estos selectores relativos a `item` segun el HTML real.
        numero_el = item.query_selector("TODO-selector-numero")
        titulo_el = item.query_selector("TODO-selector-titulo")
        fecha_el = item.query_selector("TODO-selector-fecha")
        sala_el = item.query_selector("TODO-selector-sala")
        pdf_el = item.query_selector("a[href$='.pdf']")

        numero = (numero_el.inner_text().strip() if numero_el else "").strip()
        titulo = (titulo_el.inner_text().strip() if titulo_el else "").strip()
        fecha = (fecha_el.inner_text().strip() if fecha_el else "").strip()
        sala = (sala_el.inner_text().strip() if sala_el else "").strip()
        pdf_href = pdf_el.get_attribute("href") if pdf_el else None

        if not numero or not pdf_href:
            continue

        # Normaliza URL relativa a absoluta si hace falta.
        if pdf_href.startswith("/"):
            pdf_href = "https://www.pj.gob.pe" + pdf_href

        resultados.append(
            {
                "numero": numero,
                "titulo": titulo,
                "fecha": fecha,
                "sala": sala,
                "pdf_url": pdf_href,
            }
        )

    return resultados


def hay_pagina_siguiente(page: Page) -> bool:
    """
    TODO 3: ajustar el selector del boton/enlace "Siguiente" del paginador.
    Debe devolver False cuando ya no hay mas paginas (botón deshabilitado
    o ausente).
    """
    boton = page.query_selector("TODO-selector-boton-siguiente")
    if not boton:
        return False
    disabled = boton.get_attribute("disabled") or boton.get_attribute("aria-disabled")
    return disabled not in ("true", "disabled", "")


def ir_a_pagina_siguiente(page: Page) -> None:
    page.click("TODO-selector-boton-siguiente")
    page.wait_for_load_state("networkidle")
    time.sleep(REQUEST_DELAY)


def clasificar_tipo(numero: str) -> str:
    numero_lower = numero.lower()
    if "acuerdo plenario" in numero_lower:
        return "Acuerdo Plenario"
    if "casacion" in numero_lower or "casación" in numero_lower:
        return "Casacion"
    return "Otro"


def main() -> None:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    resoluciones: list[Resolucion] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=USER_AGENT)
        page = context.new_page()

        print(f"Abriendo {BASE_URL} ...")
        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(REQUEST_DELAY)

        # TODO 4: automatizar el filtro por materia penal si el sitio lo
        # requiere (seleccionar un <select>, marcar un checkbox, o enviar
        # un formulario de busqueda). Ejemplo tipico:
        #
        #   page.select_option("select#materia", label="Penal")
        #   page.click("button#buscar")
        #   page.wait_for_load_state("networkidle")

        pagina = 1
        while True:
            print(f"Procesando pagina {pagina} ...")
            crudos = extraer_resultados_de_pagina(page)
            print(f"  {len(crudos)} resultados encontrados en esta pagina")

            for r in crudos:
                rid = slugify(r["numero"]) or slugify(r["titulo"])
                pdf_dest = PDF_DIR / f"{rid}.pdf"

                ok = descargar_pdf(page, r["pdf_url"], pdf_dest)
                time.sleep(REQUEST_DELAY)

                resoluciones.append(
                    Resolucion(
                        id=rid,
                        tipo=clasificar_tipo(r["numero"]),
                        numero=r["numero"],
                        titulo=r["titulo"],
                        sala=r["sala"],
                        fecha=r["fecha"],
                        pdfUrl=f"/documentos/{rid}.pdf" if ok else r["pdf_url"],
                    )
                )

            if not hay_pagina_siguiente(page):
                break
            ir_a_pagina_siguiente(page)
            pagina += 1

        browser.close()

    JSON_PATH.write_text(
        json.dumps([asdict(r) for r in resoluciones], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nListo: {len(resoluciones)} resoluciones -> {JSON_PATH}")
    print(f"PDFs descargados en: {PDF_DIR}")


if __name__ == "__main__":
    main()


# ---------------------------------------------------------------------------
# COMO RELLENAR LOS "TODO" (10-15 minutos, sin programar)
# ---------------------------------------------------------------------------
# 1. Abre https://www.pj.gob.pe/wps/wcm/connect/cij-juris/s_jurisprudencia_sistematizada
#    en Chrome y haz la busqueda de materia penal manualmente una vez.
# 2. Click derecho sobre UN resultado de la lista -> "Inspeccionar".
# 3. En el panel de DevTools, sube en el arbol HTML hasta encontrar el
#    contenedor que envuelve exactamente ESE resultado (numero + titulo +
#    fecha + enlace), y que se repite una vez por cada resultado de la
#    lista. Anota su selector (clase o tag), ese es TODO-1.
# 4. Dentro de ese contenedor, identifica los elementos hijos que tienen
#    el numero, titulo, fecha y sala/organo -> esos son TODO-2.
# 5. Baja hasta el paginador, inspecciona el boton "Siguiente" -> TODO-3.
# 6. Si la busqueda requiere elegir "materia penal" antes de ver resultados,
#    inspecciona ese control (select/checkbox/boton) -> TODO-4.
#
# Tip: en DevTools puedes click derecho sobre cualquier elemento ->
# "Copy" -> "Copy selector" para obtener un selector CSS listo para pegar.
# ---------------------------------------------------------------------------
