#!/usr/bin/env python3
"""
Reconocimiento de texto (OCR) para jurisprudencia escaneada.

Muchas resoluciones antiguas se publican como imagen: el PDF no tiene capa
de texto, así que no se puede buscar, citar ni indexar. Este script detecta
cuáles están en esa situación y les añade la capa de texto en español,
dejando el documento visualmente idéntico.

    python scripts/ocr.py CARPETA --salida CARPETA_OCR

Qué necesita (una sola vez):

    Windows : winget install tesseract-ocr.tesseract ; pip install ocrmypdf
              (instalar también Ghostscript desde ghostscript.com/releases)
    macOS   : brew install tesseract tesseract-lang ghostscript && pip install ocrmypdf
    Linux   : sudo apt install tesseract-ocr tesseract-ocr-spa ghostscript && pip install ocrmypdf

Sin instalar nada: el workflow "OCR de jurisprudencia" de este repositorio
hace lo mismo en la nube (pestaña Actions en GitHub).

Opciones:
    --salida DIR   dónde dejar los PDF con texto (por defecto, junto al original)
    --umbral N     caracteres por página debajo de los cuales se considera
                   escaneado (por defecto 100)
    --solo-revisar no hace OCR, solo informa qué documentos lo necesitan
    --idioma spa   idioma del OCR (spa = español)
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

try:
    import pypdf
except ImportError:
    sys.exit("Falta pypdf. Instálalo con: pip install pypdf")


def caracteres_por_pagina(pdf: Path) -> tuple[float, int]:
    """Promedio de caracteres por página y número de páginas."""
    try:
        lector = pypdf.PdfReader(str(pdf))
    except Exception:
        return 0.0, 0
    paginas = len(lector.pages)
    if not paginas:
        return 0.0, 0
    total = 0
    for pagina in lector.pages[:12]:  # muestra suficiente para decidir
        try:
            total += len(pagina.extract_text() or "")
        except Exception:
            pass
    return total / min(paginas, 12), paginas


def hay_herramientas() -> tuple[bool, str]:
    if shutil.which("ocrmypdf") is None:
        return False, "no se encontró 'ocrmypdf'"
    if shutil.which("tesseract") is None:
        return False, "no se encontró 'tesseract'"
    return True, ""


def aplicar_ocr(origen: Path, destino: Path, idioma: str) -> tuple[bool, str]:
    destino.parent.mkdir(parents=True, exist_ok=True)
    orden = [
        "ocrmypdf",
        "-l", idioma,
        # --force-ocr y no --skip-text: estos escaneos traen restos de texto
        # (sellos, marcas de agua) y --skip-text salta la página entera en
        # cuanto encuentra alguno, dejando el documento sin reconocer.
        "--force-ocr",
        "--rotate-pages",     # endereza las escaneadas de lado
        "--deskew",
        "--optimize", "1",
        "--quiet",
        str(origen), str(destino),
    ]
    try:
        r = subprocess.run(orden, capture_output=True, text=True, timeout=1800)
    except subprocess.TimeoutExpired:
        return False, "excedió el tiempo límite"
    if r.returncode != 0:
        return False, (r.stderr or r.stdout).strip().splitlines()[-1][:160] if (r.stderr or r.stdout) else f"código {r.returncode}"
    return True, ""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta", help="carpeta con los PDF")
    ap.add_argument("--salida", default="", help="carpeta de salida (por defecto, junto al original con sufijo -ocr)")
    ap.add_argument("--umbral", type=int, default=100, help="caracteres por página para considerarlo escaneado")
    ap.add_argument("--solo-revisar", action="store_true", help="solo informar, sin hacer OCR")
    ap.add_argument("--idioma", default="spa")
    args = ap.parse_args()

    pdfs = sorted(Path(args.carpeta).rglob("*.pdf"))
    if not pdfs:
        sys.exit(f"No se encontraron PDF en {args.carpeta}")

    print(f"Revisando {len(pdfs)} documentos (umbral: {args.umbral} caracteres por página)...\n")
    escaneados, con_texto = [], 0
    for pdf in pdfs:
        media, paginas = caracteres_por_pagina(pdf)
        if media < args.umbral:
            escaneados.append(pdf)
            print(f"  ESCANEADO  {pdf.name}  ({media:.0f} car./pág., {paginas} pág.)")
        else:
            con_texto += 1

    print(f"\nCon texto: {con_texto}   |   Escaneados: {len(escaneados)}")
    if not escaneados:
        print("\nNada que procesar: todos tienen capa de texto.")
        return
    if args.solo_revisar:
        print("\n(--solo-revisar: no se hizo OCR)")
        return

    listo, motivo = hay_herramientas()
    if not listo:
        print(f"\nNo se puede hacer OCR aquí: {motivo}.")
        print("Instala las herramientas (ver cabecera de este archivo) o usa el")
        print("workflow 'OCR de jurisprudencia' en la pestaña Actions de GitHub.")
        sys.exit(1)

    salida = Path(args.salida) if args.salida else None
    print(f"\nAplicando OCR en español a {len(escaneados)} documentos...\n")
    ok, fallos = 0, []
    for i, pdf in enumerate(escaneados, 1):
        destino = (salida / pdf.name) if salida else pdf.with_name(f"{pdf.stem}-ocr.pdf")
        exito, error = aplicar_ocr(pdf, destino, args.idioma)
        if exito:
            media, _ = caracteres_por_pagina(destino)
            ok += 1
            print(f"  [{i}/{len(escaneados)}] {pdf.name} -> {media:.0f} car./pág.")
        else:
            fallos.append((pdf.name, error))
            print(f"  [{i}/{len(escaneados)}] {pdf.name}: FALLÓ ({error})")

    print(f"\n{'='*60}\nCon texto reconocido: {ok}/{len(escaneados)}")
    if fallos:
        print("\nFallaron:")
        for nombre, error in fallos:
            print(f"  - {nombre}: {error}")
    print("\nAhora puedes correr scripts/ingesta.py sobre la carpeta de salida.")


if __name__ == "__main__":
    main()
