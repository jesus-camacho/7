import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
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
    <div className="relative h-screen w-screen overflow-hidden bg-surface-0">
      <GraphVisualizer
        ref={graphRef}
        data={graphDataMock}
        selectedId={panelOpen ? selectedNode?.id ?? null : null}
        onSelectNode={selectNode}
      />

      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-6">
        <div className="pointer-events-auto relative w-full max-w-xl">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              placeholder="Buscar por número de resolución o materia..."
              className="w-full rounded-full border border-surface-300/60 bg-surface-100/90 py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 shadow-float outline-none backdrop-blur-md transition-colors focus:border-gold-500/60"
            />
          </div>

          {searchFocused && results.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-2xl border border-surface-300/60 bg-surface-100/95 shadow-float backdrop-blur-md">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={() => selectNode(r)}
                    className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-surface-200"
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
      </div>

      <SidePanel node={selectedNode} open={panelOpen} onClose={closePanel} />
    </div>
  );
}
