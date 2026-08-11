# Portal LegalTech — Grafo de Jurisprudencia Penal (MVP)

MVP funcional del portal de acceso a jurisprudencia penal del Perú, construido con
React + Vite + TypeScript + Tailwind CSS + `react-force-graph-2d`.

## Estructura del proyecto

```
.
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                # Punto de entrada
    ├── App.tsx                 # Header + buscador + layout principal
    ├── index.css                # Tailwind + estilos base
    ├── types.ts                 # Tipos compartidos (Resolucion, GraphNode, ...)
    ├── data/
    │   └── mockData.ts          # Datos de prueba: 1 Acuerdo Plenario + 4 Casaciones
    └── components/
        ├── GraphVisualizer.tsx  # Grafo de conocimiento interactivo
        └── SidePanel.tsx        # Panel lateral deslizable de detalle
```

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

## Notas

- Los datos de las resoluciones en `src/data/mockData.ts` son **datos de prueba
  (mock)** para poblar la interfaz. Deben reemplazarse por datos reales antes de
  cualquier lanzamiento público.
- El tamaño de cada nodo del grafo es proporcional a su número de citas; el color
  distingue Acuerdos Plenarios (dorado) de Casaciones (azul).
- Al hacer clic en un nodo o en un resultado del buscador se abre el panel
  lateral con el resumen de la ratio decidendi, los artículos aplicados y un
  botón para ver el PDF completo.
