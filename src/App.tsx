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

  const closePanel = () => {
    setPanelOpen(false);
    graphRef.current?.resetView();
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-paper-50">
      <header className="z-20 border-b border-paper-200 bg-paper-0/95 px-6 py-4 backdrop-blur-sm">
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              placeholder="Buscar por número de resolución o materia..."
              className="w-full rounded-full border border-paper-300 bg-paper-50 py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-gold-500 focus:bg-paper-0"
            />
          </div>

          {searchFocused && results.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-paper-200 bg-paper-0 shadow-panel">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={() => selectNode(r)}
                    className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-paper-100"
                  >
                    <span className="text-title text-sm">{r.titulo}</span>
                    <span className="text-label text-[10px] normal-case tracking-normal text-ink-400">
                      {r.numero}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <GraphVisualizer
          ref={graphRef}
          data={graphDataMock}
          selectedId={panelOpen ? selectedNode?.id ?? null : null}
          onSelectNode={selectNode}
        />
      </main>

      <footer className="z-20 flex items-center gap-2.5 border-t border-paper-200 bg-paper-0/95 px-6 py-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gold-100 text-gold-600">
          <Scale size={13} />
        </div>
        <p className="text-label text-ink-400">
          Agencia Peruana de Investigación y Desarrollo e Inteligencia Artificial
          <span className="mx-2 text-paper-300">·</span>
          Portal de Jurisprudencia Penal
        </p>
      </footer>

      <SidePanel node={selectedNode} open={panelOpen} onClose={closePanel} />
    </div>
  );
}
