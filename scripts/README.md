# Scripts de ingesta de jurisprudencia

## `pj_scraper.py`

Descarga jurisprudencia penal del portal de Jurisprudencia Sistematizada del
Poder Judicial del Perú. Corre en la nube (GitHub Actions), porque el entorno
de desarrollo tiene la salida a internet restringida y no alcanza pj.gob.pe.

Dos modos:

- `--mode recon`: abre el portal y guarda su HTML, capturas y un resumen de
  su estructura (formularios, selects, iframes, contenedores repetidos). Sirve
  para descubrir los selectores reales sin abrir el sitio a mano.
- `--mode scrape`: usa los selectores de `pj_selectors.json` para recorrer los
  resultados, descargar los PDF y escribir un índice JSON. Es idempotente.

## Cómo correrlo en la nube

En GitHub: pestaña **Actions** → workflow **Jurisprudencia PJ** → *Run workflow*.

1. Primera corrida en modo `recon`. Al terminar, descarga el artefacto
   `recon-pj` (HTML + `RESUMEN.md` con los selectores candidatos).
2. Con eso se completan los `TODO` de `pj_selectors.json`.
3. Segunda corrida en modo `scrape`: descarga los PDF y los commitea en
   `data/pj-ingesta/`.

Los documentos descargados quedan en `data/pj-ingesta/`, **no** en
`public/documentos/`: nada entra al portal sin revisión previa del contenido.

## Correrlo localmente

    pip install playwright && playwright install chromium
    python scripts/pj_scraper.py --mode recon --out recon/
