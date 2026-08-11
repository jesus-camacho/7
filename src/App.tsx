import { useMemo, useRef, useState } from "react";
import { Scale, Search } from "lucide-react";
import GraphVisualizer, {
  GraphVisualizerHandle,
} from "./components/GraphVisualizer";
import SidePanel from "./components/SidePanel";
import { graphDataMock } from "./data/mockData";
import { GraphNode } from "./types";

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const graphRef = useRef<GraphVisualizerHandle>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphDataMock.nodes.filter(
      (n) =>
        n.titulo.toLowerCase().includes(q) ||
        n.numero.toLowerCase().includes(q)
    );
  }, [query]);

  const selectNode = (node: GraphNode) => {
    setSelectedNode(node);
    setPanelOpen(true);
    setQuery("");
    setSearchFocused(false);
    graphRef.current?.focusNode(node.id);
  };

  const closePanel = () => setPanelOpen(false);

  return (
    <div className="flex h-screen w-screen flex-col bg-base-950">
      <header className="z-20 flex items-center gap-6 border-b border-base-700 bg-base-900/90 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
            <Scale size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-100">
              Agencia Peruana de Investigación y Desarrollo e IA
            </p>
            <p className="text-xs text-slate-500">
              Portal de Jurisprudencia Penal
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              placeholder="Buscar por número de resolución o materia..."
              className="w-full rounded-full border border-base-700 bg-base-850 py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-gold-500/60"
            />
          </div>

          {searchFocused && results.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-base-700 bg-base-900 shadow-panel">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={() => selectNode(r)}
                    className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-base-800"
                  >
                    <span className="text-sm text-slate-100">{r.titulo}</span>
                    <span className="text-xs text-slate-500">{r.numero}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-9" />
      </header>

      <main className="relative flex-1 overflow-hidden">
        <GraphVisualizer
          ref={graphRef}
          data={graphDataMock}
          selectedId={panelOpen ? selectedNode?.id ?? null : null}
          onSelectNode={selectNode}
        />
      </main>

      <SidePanel node={selectedNode} open={panelOpen} onClose={closePanel} />
    </div>
  );
}
