import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import GraphVisualizer, {
  GraphVisualizerHandle,
} from "./components/GraphVisualizer";
import SidePanel from "./components/SidePanel";
import { graphData } from "./data/resoluciones";
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
    return graphData.nodes.filter(
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
        data={graphData}
        selectedId={panelOpen ? selectedNode?.id ?? null : null}
        onSelectNode={selectNode}
      />

      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-6">
        <div className="pointer-events-auto relative w-full max-w-xl">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.14] via-white/[0.03] to-transparent" />
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/55"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
              placeholder="Buscar por número de resolución o materia..."
              className="relative w-full rounded-full border border-white/15 bg-white/[0.07] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.15),0_8px_30px_-8px_rgba(0,0,0,0.65)] focus:border-white/30 focus:bg-white/[0.11] focus:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.08),0_10px_36px_-8px_rgba(0,0,0,0.7)]"
            />
          </div>

          {searchFocused && results.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-2xl border border-white/15 bg-white/[0.09] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_20px_50px_-12px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={() => selectNode(r)}
                    className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-white/10"
                  >
                    <span className="text-title text-sm text-white">{r.titulo}</span>
                    <span className="text-label text-[10px] normal-case tracking-normal text-white/45">
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
