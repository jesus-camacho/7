import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ForceGraph2D, { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { GraphData, GraphNode } from "../types";

interface GraphVisualizerProps {
  data: GraphData;
  selectedId: string | null;
  onSelectNode: (node: GraphNode) => void;
}

export interface GraphVisualizerHandle {
  focusNode: (id: string) => void;
}

const GraphVisualizer = forwardRef<GraphVisualizerHandle, GraphVisualizerProps>(
  ({ data, selectedId, onSelectNode }, ref) => {
    const fgRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoverId, setHoverId] = useState<string | null>(null);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
      focusNode: (id: string) => {
        const node = data.nodes.find((n) => n.id === id);
        if (node && fgRef.current && node.x !== undefined && node.y !== undefined) {
          fgRef.current.centerAt(node.x, node.y, 700);
          fgRef.current.zoom(3.2, 700);
        }
      },
    }));

    const handleEngineStop = useCallback(() => {
      fgRef.current?.zoomToFit(600, 80);
    }, []);

    return (
      <div ref={containerRef} className="relative h-full w-full">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data as any}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeVal={(n) => (n as GraphNode).val}
          nodeColor={(n) => {
            const node = n as GraphNode;
            if (node.id === selectedId) return "#ffffff";
            if (node.id === hoverId) return node.color;
            return node.color;
          }}
          nodeLabel={(n) => {
            const node = n as GraphNode;
            return `${node.tipo === "Acuerdo Plenario" ? "⚖️" : "📘"} ${node.numero}\n${node.titulo}`;
          }}
          linkColor={() => "rgba(148, 163, 184, 0.25)"}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => "rgba(234, 176, 64, 0.55)"}
          onNodeClick={(n) => onSelectNode(n as GraphNode)}
          onNodeHover={(n) => setHoverId((n as NodeObject | null)?.id?.toString() ?? null)}
          onEngineStop={handleEngineStop}
          nodeCanvasObjectMode={() => "after"}
          nodeCanvasObject={(n, ctx, globalScale) => {
            const node = n as GraphNode;
            if (globalScale < 1.4 && node.id !== selectedId && node.id !== hoverId) return;
            const label = node.tipo === "Acuerdo Plenario" ? node.numero : node.numero;
            const fontSize = 11 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
            ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + (node.val ?? 4) + 2);
          }}
          cooldownTicks={100}
          d3VelocityDecay={0.35}
        />

        {hoverId === null && (
          <div className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-1.5 rounded-xl border border-base-700/80 bg-base-900/70 px-4 py-3 text-xs text-slate-300 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold-500 shadow-glow" />
              Acuerdos Plenarios
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-azure-500" />
              Casaciones
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              El tamaño del nodo refleja su número de citas
            </div>
          </div>
        )}
      </div>
    );
  }
);

GraphVisualizer.displayName = "GraphVisualizer";

export default GraphVisualizer;
