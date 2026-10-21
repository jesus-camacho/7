#!/usr/bin/env python3
"""
Scraper de jurisprudencia penal del Poder Judicial del Peru, pensado para
correr en un runner de GitHub Actions (internet sin restricciones).

    https://www.pj.gob.pe/wps/wcm/connect/cij-juris/s_jurisprudencia_sistematizada

Tiene dos modos:

  --mode recon
      Abre el portal, guarda el HTML, capturas de pantalla y un resumen de
      su estructura (formularios, selects, iframes, enlaces, contenedores
      que se repiten). No descarga nada ni toca el repositorio. Sirve para
      descubrir los selectores reales del sitio sin tener que abrirlo a mano.

  --mode scrape
      Usa los selectores de `pj_selectors.json` para recorrer los resultados,
      descargar los PDF y escribir un indice JSON con los metadatos.
      Es idempotente: no vuelve a descargar un PDF que ya existe.

Uso local:
    pip install playwright && playwright install chromium
    python scripts/pj_scraper.py --mode recon --out recon/
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import unicodedata
from dataclasses import asdict, dataclass, field
from pathlib import Path

from playwright.sync_api import sync_playwright, Page

BASE_URL = "https://www.pj.gob.pe/wps/wcm/connect/cij-juris/s_jurisprudencia_sistematizada"

# Pausa entre acciones (segundos). Es cortesia hacia un servidor publico del
# Estado: no hace falta ir mas rapido que esto.
REQUEST_DELAY = 1.5

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

SELECTORS_PATH = Path(__file__).parent / "pj_selectors.json"


# ---------------------------------------------------------------------------
# Modo recon: descubrir la estructura del sitio
# ---------------------------------------------------------------------------

STRUCTURE_JS = """
() => {
  const txt = (el) => (el.innerText || '').replace(/\\s+/g, ' ').trim();

  const signature = (el) => {
    let cls = '';
    if (el.className && typeof el.className === 'string') {
      cls = el.className.trim().split(/\\s+/).filter(Boolean).slice(0, 4).join('.');
    }
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  };

  // Contenedores que se repiten: candidatos a ser "una fila de resultado".
  const counts = {};
  document.querySelectorAll('div, li, tr, article, section').forEach((el) => {
    const s = signature(el);
    if (!counts[s]) counts[s] = { selector: s, count: 0, withLink: 0, sample: '' };
    counts[s].count++;
    if (el.querySelector('a')) counts[s].withLink++;
    if (!counts[s].sample) counts[s].sample = txt(el).slice(0, 200);
  });
  const repeated = Object.values(counts)
    .filter((c) => c.count >= 3 && c.withLink > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  const selects = [...document.querySelectorAll('select')].map((s) => ({
    id: s.id, name: s.name,
    options: [...s.options].slice(0, 60).map((o) => ({ value: o.value, label: o.textContent.trim() })),
  }));

  const inputs = [...document.querySelectorAll('input, textarea')].slice(0, 60).map((i) => ({
    tag: i.tagName.toLowerCase(), type: i.type || '', id: i.id, name: i.name,
    placeholder: i.placeholder || '', value: (i.value || '').slice(0, 60),
  }));

  const buttons = [...document.querySelectorAll('button, input[type=submit], input[type=button], a.btn')]
    .slice(0, 60).map((b) => ({
      tag: b.tagName.toLowerCase(), id: b.id,
      cls: typeof b.className === 'string' ? b.className : '',
      text: (txt(b) || b.value || '').slice(0, 80),
    }));

  const forms = [...document.querySelectorAll('form')].map((f) => ({
    id: f.id, name: f.name, action: f.action, method: f.method,
  }));

  const iframes = [...document.querySelectorAll('iframe, frame')].map((f) => ({
    id: f.id, name: f.name, src: f.src,
  }));

  const interesting = /juris|pdf|busca|consulta|penal|acuerdo|casaci|plenario|resoluc/i;
  const links = [...document.querySelectorAll('a[href]')]
    .map((a) => ({ href: a.href, text: txt(a).slice(0, 120) }))
    .filter((l) => interesting.test(l.href) || interesting.test(l.text))
    .slice(0, 200);

  const pdfLinks = [...document.querySelectorAll('a[href]')]
    .map((a) => a.href)
    .filter((h) => /\\.pdf(\\?|$)/i.test(h))
    .slice(0, 100);

  return {
    url: location.href,
    title: document.title,
    repeatedContainers: repeated,
    selects, inputs, buttons, forms, iframes, links, pdfLinks,
    bodyTextSample: txt(document.body).slice(0, 3000),
  };
}
"""


def _dump_frame(page: Page, out_dir: Path, label: str) -> dict:
    """Guarda HTML + estructura de la pagina principal y de cada iframe."""
    report: dict = {"label": label, "frames": []}

    (out_dir / f"{label}.html").write_text(page.content(), encoding="utf-8")
    try:
        page.screenshot(path=str(out_dir / f"{label}.png"), full_page=True)
    except Exception as exc:  # pragma: no cover - captura best effort
        print(f"  [!] no se pudo capturar pantalla: {exc}")

    for i, frame in enumerate(page.frames):
        entry: dict = {"index": i, "url": frame.url, "name": frame.name}
        try:
            entry["structure"] = frame.evaluate(STRUCTURE_JS)
            if i > 0:
                (out_dir / f"{label}_frame{i}.html").write_text(
                    frame.content(), encoding="utf-8"
                )
        except Exception as exc:
            entry["error"] = str(exc)
        report["frames"].append(entry)

    return report


def _resumen_markdown(reports: list[dict]) -> str:
    lines = ["# Reconocimiento del portal de jurisprudencia del PJ", ""]
    for rep in reports:
        lines.append(f"## Paso: {rep['label']}")
        for fr in rep["frames"]:
            st = fr.get("structure")
            lines.append("")
            lines.append(f"### Frame {fr['index']} — {fr['url']}")
            if not st:
                lines.append(f"- (sin datos: {fr.get('error', 'desconocido')})")
                continue
            lines.append(f"- Titulo: {st['title']}")
            if st["iframes"]:
                lines.append(f"- iframes: {json.dumps(st['iframes'], ensure_ascii=False)}")
            if st["selects"]:
                lines.append("- Selects:")
                for s in st["selects"]:
                    opts = ", ".join(o["label"] for o in s["options"][:12])
                    lines.append(f"  - #{s['id']} name={s['name']} -> {opts}")
            if st["inputs"]:
                lines.append("- Inputs:")
                for i in st["inputs"][:20]:
                    lines.append(
                        f"  - {i['tag']}[type={i['type']}] id={i['id']} name={i['name']} ph={i['placeholder']!r}"
                    )
            if st["buttons"]:
                lines.append("- Botones:")
                for b in st["buttons"][:20]:
                    lines.append(f"  - {b['tag']} id={b['id']} cls={b['cls'][:50]!r} text={b['text']!r}")
            if st["repeatedContainers"]:
                lines.append("- Contenedores repetidos (candidatos a fila de resultado):")
                for c in st["repeatedContainers"][:15]:
                    lines.append(
                        f"  - `{c['selector']}` x{c['count']} (con enlace: {c['withLink']}) — {c['sample'][:120]!r}"
                    )
            if st["pdfLinks"]:
                lines.append(f"- Enlaces .pdf detectados: {len(st['pdfLinks'])}")
                for h in st["pdfLinks"][:10]:
                    lines.append(f"  - {h}")
            if st["links"]:
                lines.append("- Enlaces relevantes:")
                for l in st["links"][:40]:
                    lines.append(f"  - [{l['text'][:70]}]({l['href']})")
        lines.append("")
    return "\n".join(lines)


def recon(url: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    reports: list[dict] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=USER_AGENT, viewport={"width": 1440, "height": 1000})
        page = context.new_page()

        print(f"Abriendo {url} ...")
        page.goto(url, wait_until="domcontentloaded", timeout=90_000)
        try:
            page.wait_for_load_state("networkidle", timeout=30_000)
        except Exception:
            print("  [i] networkidle no se alcanzo; sigo igual")
        time.sleep(REQUEST_DELAY)

        reports.append(_dump_frame(page, out_dir, "01_landing"))

        # Si la portada enlaza a un buscador, seguir el primer enlace que
        # parezca el formulario real de consulta y volver a documentarlo.
        candidatos = page.evaluate(
            """() => [...document.querySelectorAll('a[href]')]
                 .map(a => ({ href: a.href, text: (a.innerText||'').trim() }))
                 .filter(l => /busca|consulta|sistematiz|juris/i.test(l.text + ' ' + l.href))
                 .slice(0, 5)"""
        )
        print(f"Enlaces candidatos a buscador: {json.dumps(candidatos, ensure_ascii=False)}")

        for i, cand in enumerate(candidatos[:2], start=2):
            try:
                print(f"Siguiendo candidato: {cand['href']}")
                page.goto(cand["href"], wait_until="domcontentloaded", timeout=90_000)
                try:
                    page.wait_for_load_state("networkidle", timeout=20_000)
                except Exception:
                    pass
                time.sleep(REQUEST_DELAY)
                reports.append(_dump_frame(page, out_dir, f"{i:02d}_candidato"))
            except Exception as exc:
                print(f"  [!] fallo al abrir {cand['href']}: {exc}")

        browser.close()

    (out_dir / "estructura.json").write_text(
        json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "RESUMEN.md").write_text(_resumen_markdown(reports), encoding="utf-8")
    print(f"\nRecon listo -> {out_dir}")


# ---------------------------------------------------------------------------
# Modo scrape: descargar resoluciones
# ---------------------------------------------------------------------------


@dataclass
class Resolucion:
    id: str
    tipo: str
    numero: str
    titulo: str
    sala: str
    fecha: str
    citas: int = 0
    resumenRatioDecidendi: str = ""
    articulosAplicados: list[str] = field(default_factory=list)
    pdfUrl: str = ""


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:60]


def clasificar_tipo(numero: str) -> str:
    n = numero.lower()
    if "acuerdo plenario" in n:
        return "Acuerdo Plenario"
    if "casacion" in n or "casación" in n:
        return "Casacion"
    if "nulidad" in n:
        return "Recurso de Nulidad"
    return "Otro"


def cargar_selectores() -> dict:
    if not SELECTORS_PATH.exists():
        sys.exit(
            f"Falta {SELECTORS_PATH}. Corre primero el modo recon y completa "
            "ese archivo con los selectores reales del sitio."
        )
    cfg = json.loads(SELECTORS_PATH.read_text(encoding="utf-8"))
    pendientes = [k for k, v in cfg.items() if isinstance(v, str) and v.startswith("TODO")]
    if pendientes:
        sys.exit(
            "Estos selectores siguen sin completarse en pj_selectors.json: "
            + ", ".join(pendientes)
            + ". Corre el modo recon y rellenalos antes de scrapear."
        )
    return cfg


def descargar_pdf(page: Page, pdf_url: str, destino: Path) -> bool:
    if destino.exists():
        return True
    destino.parent.mkdir(parents=True, exist_ok=True)
    resp = page.context.request.get(pdf_url, timeout=120_000)
    if resp.status != 200:
        print(f"  [!] fallo descarga ({resp.status}): {pdf_url}")
        return False
    destino.write_bytes(resp.body())
    return True


def scrape(url: str, out_dir: Path, max_docs: int) -> None:
    cfg = cargar_selectores()
    pdf_dir = out_dir / "documentos"
    pdf_dir.mkdir(parents=True, exist_ok=True)

    resoluciones: list[Resolucion] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=USER_AGENT)
        page = context.new_page()

        print(f"Abriendo {url} ...")
        page.goto(url, wait_until="domcontentloaded", timeout=90_000)
        try:
            page.wait_for_load_state("networkidle", timeout=30_000)
        except Exception:
            pass
        time.sleep(REQUEST_DELAY)

        if cfg.get("pasos_busqueda"):
            for paso in cfg["pasos_busqueda"]:
                accion = paso["accion"]
                if accion == "select":
                    page.select_option(paso["selector"], label=paso["valor"])
                elif accion == "fill":
                    page.fill(paso["selector"], paso["valor"])
                elif accion == "click":
                    page.click(paso["selector"])
                try:
                    page.wait_for_load_state("networkidle", timeout=30_000)
                except Exception:
                    pass
                time.sleep(REQUEST_DELAY)

        pagina = 1
        while True:
            print(f"Procesando pagina {pagina} ...")
            page.wait_for_selector(cfg["fila_resultado"], timeout=30_000)
            filas = page.query_selector_all(cfg["fila_resultado"])
            print(f"  {len(filas)} resultados en esta pagina")

            for fila in filas:
                def _texto(clave: str) -> str:
                    sel = cfg.get(clave)
                    if not sel:
                        return ""
                    el = fila.query_selector(sel)
                    return el.inner_text().strip() if el else ""

                numero = _texto("numero")
                titulo = _texto("titulo")
                fecha = _texto("fecha")
                sala = _texto("sala")

                pdf_el = fila.query_selector(cfg.get("enlace_pdf", "a[href$='.pdf']"))
                pdf_href = pdf_el.get_attribute("href") if pdf_el else None
                if not pdf_href or not (numero or titulo):
                    continue
                if pdf_href.startswith("/"):
                    pdf_href = "https://www.pj.gob.pe" + pdf_href

                rid = slugify(numero) or slugify(titulo)
                destino = pdf_dir / f"{rid}.pdf"
                ok = descargar_pdf(page, pdf_href, destino)
                print(f"  - {rid} {'ok' if ok else 'FALLO'}")
                time.sleep(REQUEST_DELAY)

                resoluciones.append(
                    Resolucion(
                        id=rid,
                        tipo=clasificar_tipo(numero),
                        numero=numero,
                        titulo=titulo,
                        sala=sala,
                        fecha=fecha,
                        pdfUrl=f"/documentos/{rid}.pdf" if ok else pdf_href,
                    )
                )

                if max_docs and len(resoluciones) >= max_docs:
                    print(f"  [i] alcanzado el tope de {max_docs} documentos")
                    break

            if max_docs and len(resoluciones) >= max_docs:
                break

            siguiente = page.query_selector(cfg.get("boton_siguiente", ""))
            if not siguiente:
                break
            deshabilitado = siguiente.get_attribute("disabled") or siguiente.get_attribute("aria-disabled")
            if deshabilitado in ("true", "disabled", ""):
                break
            siguiente.click()
            try:
                page.wait_for_load_state("networkidle", timeout=30_000)
            except Exception:
                pass
            time.sleep(REQUEST_DELAY)
            pagina += 1

        browser.close()

    indice = out_dir / "resoluciones.json"
    indice.write_text(
        json.dumps([asdict(r) for r in resoluciones], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nListo: {len(resoluciones)} resoluciones -> {indice}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--mode", choices=["recon", "scrape"], default="recon")
    ap.add_argument("--url", default=BASE_URL)
    ap.add_argument("--out", default="recon")
    ap.add_argument("--max-docs", type=int, default=0, help="0 = sin tope")
    args = ap.parse_args()

    out_dir = Path(args.out)
    if args.mode == "recon":
        recon(args.url, out_dir)
    else:
        scrape(args.url, out_dir, args.max_docs)


if __name__ == "__main__":
    main()
