#!/usr/bin/env python3
"""
Ingesta masiva de jurisprudencia peruana en PDF.

Lee una carpeta de PDF y produce un índice JSON con lo que el propio
documento dice: número, tipo, sala, fecha, sumilla, fundamentos numerados
y las resoluciones que cita. No redacta resúmenes ni inventa relaciones:
todo lo que escribe sale literal del PDF, y lo que no logra identificar lo
deja vacío y lo reporta.

    pip install pypdf
    python scripts/ingesta.py ~/Descargas/JurisPenal --muestra 25 --salida muestra.json

Opciones:
    --muestra N   procesa solo los primeros N (0 = todos)
    --copiar DIR  copia los PDF reconocidos a DIR con su id como nombre
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    import pypdf
except ImportError:
    sys.exit("Falta pypdf. Instálalo con: pip install pypdf")


# --------------------------------------------------------------------------
# Utilidades de texto
# --------------------------------------------------------------------------

def sin_tildes(t: str) -> str:
    return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()


def texto_de(pdf: Path) -> str:
    """Extrae el texto. El modo 'layout' evita que se partan las palabras."""
    lector = pypdf.PdfReader(str(pdf))
    partes = []
    for pagina in lector.pages:
        try:
            partes.append(pagina.extract_text(extraction_mode="layout") or "")
        except Exception:
            partes.append(pagina.extract_text() or "")
    t = "\n".join(partes)
    return re.sub(r"[ \t]+", " ", t)


UNIDADES = {
    "cero": 0, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
    "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10, "once": 11,
    "doce": 12, "trece": 13, "catorce": 14, "quince": 15, "dieciseis": 16,
    "diecisiete": 17, "dieciocho": 18, "diecinueve": 19, "veinte": 20,
    "veintiuno": 21, "veintidos": 22, "veintitres": 23, "veinticuatro": 24,
    "veinticinco": 25, "veintiseis": 26, "veintisiete": 27, "veintiocho": 28,
    "veintinueve": 29, "treinta": 30, "treinta y uno": 31,
}
MESES = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "setiembre": 9, "octubre": 10,
    "noviembre": 11, "diciembre": 12,
}


def anio_en_letras(t: str) -> int | None:
    """'dos mil veintiséis' -> 2026."""
    t = sin_tildes(t).lower().strip()
    if not t.startswith("dos mil"):
        return None
    resto = t[len("dos mil"):].strip()
    if not resto:
        return 2000
    return 2000 + UNIDADES.get(resto, 0) if resto in UNIDADES else None


def extraer_fecha(t: str) -> str:
    """Devuelve YYYY-MM-DD, o '' si no la reconoce."""
    plano = sin_tildes(re.sub(r"\s+", " ", t)).lower()

    # "Lima, doce de junio de dos mil veintiseis"
    palabra = r"[a-z]+(?:\s+y\s+[a-z]+)?"
    m = re.search(
        r"lima,?\s+(" + palabra + r")\s+de\s+(" + "|".join(MESES) + r")"
        r"\s+de\s+dos mil(?:\s+(" + palabra + r"))?",
        plano,
    )
    if m:
        dia = UNIDADES.get(m.group(1).strip())
        anio = 2000 + UNIDADES.get((m.group(3) or "").strip(), 0)
        if dia:
            return f"{anio:04d}-{MESES[m.group(2)]:02d}-{dia:02d}"

    # "a los 2 dias del mes de julio de 2026"
    m = re.search(
        r"(\d{1,2})\s+dias?\s+del\s+mes\s+de\s+(" + "|".join(MESES) + r")\s+de\s+(\d{4})",
        plano,
    )
    if m:
        return f"{int(m.group(3)):04d}-{MESES[m.group(2)]:02d}-{int(m.group(1)):02d}"

    return ""


# --------------------------------------------------------------------------
# Identificación del documento
# --------------------------------------------------------------------------

# El membrete suele intercalar "DE LA REPUBLICA" entre el tipo y el número.
INTERMEDIO = r"(?:\s+de\s+la\s+rep[uú]blica)?"
TIPOS = [
    (r"acuerdo\s+plenario" + INTERMEDIO + r"\s*n[.\s°º]*\s*(\d+)\s*-\s*(\d{4})", "Acuerdo Plenario", "ap"),
    (r"casaci[oó]n" + INTERMEDIO + r"\s*n[.\s°º]*\s*(\d+)\s*-\s*(\d{4})", "Casacion", "cas"),
    (r"(?:recurso\s+(?:de\s+)?nulidad|r\.?\s*n\.?)" + INTERMEDIO + r"\s*n[.\s°º]*\s*(\d+)\s*-\s*(\d{4})", "Recurso de Nulidad", "rn"),
    (r"apelaci[oó]n" + INTERMEDIO + r"\s*n[.\s°º]*\s*(\d+)\s*-\s*(\d{4})", "Apelacion", "apl"),
]


MARCAS_DOCTRINA = re.compile(
    r"comentarios?\s+a(?:l|\s+la)\s+(acuerdo\s+plenario|casaci[oó]n|sentencia|ejecutoria)",
    re.I,
)


def es_doctrina(t: str) -> bool:
    """
    True si el PDF es un artículo o comentario académico y no la resolución.
    Importa: citar a un comentarista como si fuera el tribunal es un error
    grave, y estos textos vienen mezclados con la jurisprudencia.
    """
    return bool(MARCAS_DOCTRINA.search(re.sub(r"\s+", " ", t[:2500])))


def identificar(t: str) -> dict:
    cabecera = re.sub(r"\s+", " ", t[:2500])

    # Tribunal Constitucional: "Sala Primera. Sentencia 1129/2026" + "EXP. N.° 01742-2026-PHC/TC"
    m_tc = re.search(r"sentencia\s+(\d{3,4})\s*/\s*(\d{4})", cabecera, re.I)
    m_exp = re.search(r"exp\.?\s*n[.\s°º]*\s*([\d\-]+)-(\d{4})-(\w+)/tc", cabecera, re.I)
    if m_tc or m_exp:
        numero_tc = m_tc.group(1) if m_tc else (m_exp.group(1) if m_exp else "")
        anio_tc = m_tc.group(2) if m_tc else (m_exp.group(2) if m_exp else "")
        exp = f"{m_exp.group(1)}-{m_exp.group(2)}-{m_exp.group(3).upper()}/TC" if m_exp else ""
        es_hc = "PHC" in exp.upper()
        sala = re.search(r"sala\s+(primera|segunda|pleno)", cabecera, re.I)
        return {
            "id": f"stc-{numero_tc}-{anio_tc}" if numero_tc else "",
            "tipo": "Habeas Corpus" if es_hc else "Sentencia TC",
            "institucion": "Tribunal Constitucional",
            "numero": f"STC {numero_tc}/{anio_tc}" + (f" - Exp. N.° {exp}" if exp else ""),
            "sala": (f"Sala {sala.group(1).capitalize()} - " if sala else "") + "Tribunal Constitucional",
        }

    # Corte Interamericana: "Caso X Vs. Perú" + "Serie C No. NNN"
    m_cidh = re.search(r"caso\s+(.{3,60}?)\s+vs\.?\s+(per[uú]|\w+)", cabecera, re.I)
    m_serie = re.search(r"serie\s+c\s+n[o.\s°º]*\s*(\d{1,3})", t[:20000], re.I)
    if m_cidh and ("interamericana" in cabecera.lower() or m_serie):
        nombre = re.sub(r"\s+", " ", m_cidh.group(1)).strip(" .,")
        serie = m_serie.group(1) if m_serie else ""
        return {
            "id": "cidh-" + re.sub(r"[^a-z0-9]+", "-", sin_tildes(nombre).lower()).strip("-"),
            "tipo": "Sentencia CIDH",
            "institucion": "Corte IDH",
            "numero": f"Caso {nombre} Vs. {m_cidh.group(2).title()}"
                      + (f" (Serie C N.° {serie})" if serie else ""),
            "sala": "Corte Interamericana de Derechos Humanos",
        }

    # Corte Suprema, Sala Penal Especial: se numera por expediente.
    if re.search(r"sala\s+penal\s+especial", cabecera, re.I):
        m_exp = re.search(r"expediente\s*n[.\s°º]*\s*:?\s*([\d\-]+)", cabecera, re.I)
        if m_exp:
            exp = m_exp.group(1).strip("-")
            return {
                "id": "spe-" + exp.replace("-", "-"),
                "tipo": "Resolucion",
                "institucion": "Corte Suprema",
                "numero": f"Expediente N.° {exp}",
                "sala": "Sala Penal Especial - Corte Suprema",
            }

    # Corte Suprema de Justicia de Colombia: se cita por radicación.
    m_rad = re.search(r"radicaci[oó]n\s*n[.\s°º]*\s*(\d{4,6})", cabecera, re.I)
    if m_rad and re.search(r"bogot[aá]|sala\s+de\s+casaci[oó]n\s+penal", t[:6000], re.I):
        m_anio = re.search(r"\b(20\d{2})\b", cabecera)
        return {
            "id": f"col-{m_rad.group(1)}" + (f"-{m_anio.group(1)}" if m_anio else ""),
            "tipo": "Casacion",
            "institucion": "Corte Suprema de Colombia",
            "numero": f"Casación N.° {m_rad.group(1)} - Colombia",
            "sala": "Sala de Casación Penal - Corte Suprema de Justicia de Colombia",
        }

    # Salas nacionales (crimen organizado, corrupción): se numeran por expediente.
    if re.search(r"corte\s+superior\s+nacional|sala\s+penal\s+de\s+apelaciones\s+nacional",
                 cabecera, re.I):
        m_exp = re.search(r"expediente\s*n?[.\s°º]*\s*:?\s*([\d\-]+)", cabecera, re.I)
        exp = m_exp.group(1) if m_exp else ""
        sala = re.search(r"(\d|primera|segunda|tercera)\.?[ªa]?\s+sala\s+penal\s+de\s+apelaciones",
                         cabecera, re.I)
        return {
            "id": "csn-" + re.sub(r"[^0-9]+", "-", exp).strip("-") if exp else "",
            "tipo": "Resolucion",
            "institucion": "Corte Superior Nacional",
            "numero": f"Expediente N.° {exp}" if exp else "Corte Superior Nacional",
            "sala": (f"{sala.group(1).capitalize()} Sala Penal de Apelaciones - " if sala else "")
                    + "Corte Superior Nacional de Justicia Penal Especializada",
        }

    for patron, tipo, prefijo in TIPOS:
        m = re.search(patron, cabecera, re.I)
        if m:
            num, anio = m.group(1), m.group(2)
            sede = re.search(
                r"\b(lima norte|lima este|lima sur|lima|cusco|ucayali|huaura|lambayeque|"
                r"madre de dios|arequipa|piura|jun[ií]n|puno|ica|ancash|cajamarca|"
                r"la libertad|loreto|tacna|moquegua|ayacucho|hu[aá]nuco|apur[ií]mac|"
                r"amazonas|san mart[ií]n|tumbes|pasco|huancavelica|callao)\b",
                cabecera, re.I,
            )
            sala = re.search(r"sala\s+penal\s+(permanente|transitoria|especial)", cabecera, re.I)
            etiqueta = {"ap": "Acuerdo Plenario", "cas": "Casación",
                        "rn": "Recurso de Nulidad", "apl": "Apelación"}[prefijo]
            return {
                "id": f"{prefijo}-{num}-{anio}",
                "tipo": tipo,
                "institucion": "Corte Suprema",
                "numero": f"{etiqueta} N.° {num}-{anio}"
                          + (f"/{sede.group(1).title()}" if sede else ""),
                "sala": (f"Sala Penal {sala.group(1).capitalize()} - " if sala else "") + "Corte Suprema",
            }

    return {"id": "", "tipo": "", "institucion": "", "numero": "", "sala": ""}


# --------------------------------------------------------------------------
# Contenido citable
# --------------------------------------------------------------------------

def extraer_sumilla(t: str) -> str:
    """
    La sumilla es el resumen que redacta el propio tribunal, antes de
    'VISTOS'/'ASUNTO'. Se usa tal cual: es texto del documento, no una
    paráfrasis.
    """
    plano = re.sub(r"\s+", " ", t[:6000])
    m = re.search(r"(VISTOS|VISTA|ASUNTO|AUTOS Y VISTOS|SENTENCIA DEL TRIBUNAL)", plano)
    if not m:
        return ""
    cabeza = plano[:m.start()]
    # quitar membrete repetido del encabezado
    cabeza = re.sub(
        r"CORTE SUPREMA|SALA PENAL \w+|DE JUSTICIA|DE LA REP[UÚ]BLICA|"
        r"RECURSO DE (NULIDAD|APELACI[OÓ]N)|CASACI[OÓ]N|APELACI[OÓ]N|"
        r"N\.?[°º]? ?[\d\-]+|Sala (Primera|Segunda)\.?|Sentencia \d+/\d+|"
        r"EXP\.? N\.?[°º]?[\w\-/\.]+", " ", cabeza)
    cabeza = re.sub(r"\s+", " ", cabeza).strip(" .-–—")
    return cabeza if len(cabeza) > 120 else ""


PATRON_FUNDAMENTO = re.compile(
    r"(?:^|\n)\s*(?:"
    r"(\d{1,2}\.\d{1,2})\.\s|"                       # 2.9.
    r"(\d{1,3})\.\s(?=[A-ZÁÉÍÓÚ])|"                  # 21. Texto
    r"((?:Vig[eé]sim|Trig[eé]sim|D[eé]cim)?[a-zá-ú]*(?:primero|segundo|tercero|cuarto|quinto|sexto|s[eé]ptimo|octavo|noveno|d[eé]cimo))\.\s"
    r")",
    re.MULTILINE,
)


def extraer_fundamentos(t: str, maximo: int = 400) -> list[dict]:
    """Devuelve los fundamentos numerados con su texto literal."""
    marcas = list(PATRON_FUNDAMENTO.finditer(t))
    fundamentos = []
    for i, m in enumerate(marcas):
        ref = m.group(1) or m.group(2) or m.group(3)
        fin = marcas[i + 1].start() if i + 1 < len(marcas) else min(len(t), m.end() + 2500)
        cuerpo = re.sub(r"\s+", " ", t[m.end():fin]).strip()
        # descartar encabezados de página y fragmentos sin contenido
        cuerpo = re.sub(r"CORTE SUPREMA.{0,120}?(?=[A-ZÁÉÍÓÚ][a-zá-ú])", "", cuerpo)
        if len(cuerpo) < 120:
            continue
        fundamentos.append({"referencia": str(ref), "texto": cuerpo[:maximo * 4]})
    return fundamentos


PATRON_CITA = re.compile(
    r"(acuerdo\s+plenario|casaci[oó]n|recurso\s+de\s+nulidad|r\.?\s?n\.?|apelaci[oó]n|exp(?:ediente)?\.?)"
    r"\s*n?[.\s°º]*\s*(\d{1,5})\s*-\s*(\d{4})",
    re.I,
)
PREFIJOS = {"acuerdo plenario": "ap", "casacion": "cas", "casación": "cas",
            "recurso de nulidad": "rn", "r.n.": "rn", "rn": "rn", "r n": "rn",
            "apelacion": "apl", "apelación": "apl"}


def extraer_citas(t: str, propio_id: str) -> list[str]:
    """Resoluciones citadas expresamente en el texto, como ids."""
    encontrados = set()
    for m in PATRON_CITA.finditer(t):
        clase = sin_tildes(re.sub(r"\s+", " ", m.group(1).lower())).strip(". ")
        prefijo = PREFIJOS.get(clase)
        if not prefijo:
            continue
        ident = f"{prefijo}-{m.group(2)}-{m.group(3)}"
        if ident != propio_id:
            encontrados.add(ident)
    return sorted(encontrados)


PATRON_ARTICULO = re.compile(
    r"art[íi]culos?\s+(\d{1,3})(?:[^.]{0,40}?)\s+del\s+"
    r"(C[oó]digo Penal|CP|C[oó]digo Procesal Penal|CPP|C[oó]digo de Procedimientos Penales|Constituci[oó]n)",
    re.I,
)


def extraer_articulos(t: str) -> list[str]:
    vistos = {}
    for m in PATRON_ARTICULO.finditer(t):
        cuerpo = m.group(2)
        cuerpo = {"CP": "Código Penal", "CPP": "Código Procesal Penal"}.get(cuerpo, cuerpo)
        clave = f"Art. {m.group(1)} - {cuerpo}"
        vistos[clave] = vistos.get(clave, 0) + 1
    # los más repetidos son los realmente aplicados, no los citados de pasada
    return [k for k, _ in sorted(vistos.items(), key=lambda kv: -kv[1])[:8]]


# --------------------------------------------------------------------------

def procesar(pdf: Path) -> dict:
    t = texto_de(pdf)
    paginas = len(pypdf.PdfReader(str(pdf)).pages) or 1
    if len(t) / paginas < 100:
        return {"id": "", "clase": "escaneado", "archivo": pdf.name,
                "paginas": paginas, "caracteres": len(t)}
    if es_doctrina(t):
        return {"id": "", "clase": "doctrina", "archivo": pdf.name,
                "paginas": paginas, "caracteres": len(t)}
    datos = identificar(t)
    ident = datos["id"]
    return {
        **datos,
        "clase": "jurisprudencia",
        "archivo": pdf.name,
        "fecha": extraer_fecha(t),
        "sumilla": extraer_sumilla(t),
        "articulosAplicados": extraer_articulos(t),
        "fundamentos": extraer_fundamentos(t),
        "cita_a": extraer_citas(t, ident),
        "paginas": len(pypdf.PdfReader(str(pdf)).pages),
        "caracteres": len(t),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("carpeta", help="carpeta con los PDF")
    ap.add_argument("--muestra", type=int, default=0, help="procesar solo los primeros N (0 = todos)")
    ap.add_argument("--salida", default="indice.json")
    ap.add_argument("--copiar", default="", help="copiar los PDF reconocidos a esta carpeta")
    args = ap.parse_args()

    pdfs = sorted(Path(args.carpeta).rglob("*.pdf"))
    if args.muestra:
        pdfs = pdfs[: args.muestra]
    if not pdfs:
        sys.exit(f"No se encontraron PDF en {args.carpeta}")

    print(f"Procesando {len(pdfs)} documentos...\n")
    indice, sin_identificar, escaneados, doctrina = [], [], [], []
    for i, pdf in enumerate(pdfs, 1):
        try:
            d = procesar(pdf)
        except Exception as exc:
            print(f"  [{i}/{len(pdfs)}] {pdf.name}: ERROR {exc}")
            sin_identificar.append(pdf.name)
            continue
        estado = d["id"] or {"escaneado": "ESCANEADO (OCR)",
                             "doctrina": "DOCTRINA (no es fallo)"}.get(
                                 d.get("clase", ""), "SIN IDENTIFICAR")
        print(f"  [{i}/{len(pdfs)}] {estado:<24} fund:{len(d.get('fundamentos', [])):<3} "
              f"citas:{len(d.get('cita_a', [])):<3} "
              f"{'sumilla' if d.get('sumilla') else '—':<8} {d.get('fecha') or '—'}")
        if not d["id"]:
            clase = d.get("clase", "")
            (escaneados if clase == "escaneado" else
             doctrina if clase == "doctrina" else sin_identificar).append(pdf.name)
            continue
        indice.append(d)
        if args.copiar:
            destino = Path(args.copiar) / f"{d['id']}.pdf"
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_bytes(pdf.read_bytes())

    # enlaces por cita expresa, solo entre documentos presentes en el índice
    presentes = {d["id"] for d in indice}
    enlaces = []
    for d in indice:
        for destino in d["cita_a"]:
            if destino in presentes:
                enlaces.append({"source": d["id"], "target": destino,
                                "motivo": f"{d['numero']} cita expresamente esta resolución."})

    Path(args.salida).write_text(
        json.dumps({"resoluciones": indice, "enlaces": enlaces}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    con_sumilla = sum(1 for d in indice if d["sumilla"])
    con_fecha = sum(1 for d in indice if d["fecha"])
    con_fund = sum(1 for d in indice if d["fundamentos"])
    print(f"\n{'='*60}")
    print(f"Identificados      : {len(indice)}/{len(pdfs)}")
    print(f"Con sumilla        : {con_sumilla}")
    print(f"Con fecha          : {con_fecha}")
    print(f"Con fundamentos    : {con_fund}")
    print(f"Enlaces por cita   : {len(enlaces)}")
    if escaneados:
        print(f"\nEscaneados, requieren OCR ({len(escaneados)}): "
              f"{', '.join(escaneados[:8])}")
        print("  -> pásalos por scripts/ocr.py y vuelve a correr esta ingesta")
    if doctrina:
        print(f"\nDoctrina, no son resoluciones ({len(doctrina)}): "
              f"{', '.join(doctrina[:8])}")
    if sin_identificar:
        print(f"\nSin identificar ({len(sin_identificar)}): {', '.join(sin_identificar[:10])}")
    print(f"\nÍndice escrito en  : {args.salida}")


if __name__ == "__main__":
    main()
