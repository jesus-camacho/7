# Scripts de ingesta de datos

## `scrape_pj_jurisprudencia.py`

Descarga los PDFs de jurisprudencia penal desde el portal de
Jurisprudencia Sistematizada del Poder Judicial del Perú y genera un
`resoluciones.json` con los metadatos, listo para integrar al portal.

**Antes de correrlo hay que rellenar 4 selectores** (ver instrucciones
al final del propio archivo) inspeccionando la página real con las
DevTools del navegador — el script no puede escribirse a ciegas sin
ver la estructura HTML del sitio.

```bash
pip install playwright
playwright install chromium
python scrape_pj_jurisprudencia.py
```

Genera:

```
scripts/descargas/
├── documentos/
│   ├── acuerdo-plenario-n-1-2026-cj-116.pdf
│   ├── casacion-n-245-2019-lima.pdf
│   └── ...
└── resoluciones.json
```

### Siguiente paso: integrarlo al portal

1. Copia los PDFs de `descargas/documentos/` a `public/documentos/`.
2. Envíame (o pega en el chat) el `resoluciones.json` resultante — lo
   reviso, lo normalizo al formato de `src/types.ts` y reemplazo los
   datos de prueba en `src/data/mockData.ts` por los reales.

### Nota sobre "Resumen de la Ratio Decidendi" y "Artículos Aplicados"

El portal del Poder Judicial no publica esos dos campos como metadatos
sueltos — hay que extraerlos del propio texto del PDF. Una vez que
tengamos los PDFs reales descargados, puedo armar un segundo script que
lea cada documento y genere ese resumen automáticamente (con revisión
humana antes de publicarlo, dado que es contenido legal sensible).
