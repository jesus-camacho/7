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
  resetView: () => void;
}

const ROTATION_PERIOD_MS = 26000;

const hashPhase = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
};

const nodeRadius = (val: number) => 5 + Math.sqrt(val) * 3.2;

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

    const resetView = useCallback(() => {
      fgRef.current?.zoomToFit(600, 90);
    }, []);

    useImperativeHandle(ref, () => ({
      focusNode: (id: string) => {
        const node = data.nodes.find((n) => n.id === id);
        if (node && fgRef.current && node.x !== undefined && node.y !== undefined) {
          fgRef.current.centerAt(node.x, node.y, 700);
          fgRef.current.zoom(3, 700);
        }
      },
      resetView,
    }));

    // Spread nodes out for a clean, minimal diagram before the simulation
    // settles (must be applied before it cools down, not after).
    useEffect(() => {
      if (!fgRef.current) return;
      fgRef.current.d3Force("charge")?.strength(-220);
      fgRef.current.d3Force("link")?.distance(130);
      fgRef.current.d3ReheatSimulation();
    }, []);

    // Ambient rotation for the orbit ring drawn on each node is driven by
    // wall-clock time inside nodeCanvasObject, combined with a per-node
    // phase offset so nodes don't spin in lockstep. autoPauseRedraw={false}
    // (below) keeps the canvas redrawing continuously after the simulation
    // settles, which is what makes that motion visible.
    const reduceMotion = useRef(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ).current;

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
          linkColor={() => "rgba(148, 163, 184, 0.16)"}
          linkWidth={1}
          onNodeClick={(n) => onSelectNode(n as GraphNode)}
          onNodeHover={(n) => setHoverId((n as NodeObject | null)?.id?.toString() ?? null)}
          onEngineStop={resetView}
          nodeCanvasObjectMode={() => "replace"}
          nodeCanvasObject={(n, ctx, globalScale) => {
            const node = n as GraphNode;
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const r = nodeRadius(node.val);
            const isActive = node.id === selectedId || node.id === hoverId;

            // Flat, minimal disc.
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.lineWidth = 1 / globalScale;
            ctx.strokeStyle = "rgba(10, 12, 17, 0.65)";
            ctx.stroke();

            // Ambient orbit ring: a slow-rotating partial arc, subtle and
            // slightly more present on hover/selection.
            const phase = hashPhase(node.id) * Math.PI * 2;
            const t = reduceMotion ? 0 : Date.now() / ROTATION_PERIOD_MS;
            const angle = t * Math.PI * 2 + phase;
            ctx.beginPath();
            ctx.strokeStyle = withAlpha(node.color, isActive ? 0.85 : 0.4);
            ctx.lineWidth = (isActive ? 1.6 : 1) / globalScale;
            ctx.arc(x, y, r + 4.5 / globalScale, angle, angle + Math.PI * 0.55);
            ctx.stroke();

            if (isActive) {
              ctx.beginPath();
              ctx.strokeStyle = "rgba(231, 233, 238, 0.9)";
              ctx.lineWidth = 1.4 / globalScale;
              ctx.arc(x, y, r + 4.5 / globalScale, angle + Math.PI, angle + Math.PI * 1.55);
              ctx.stroke();
            }

            // Label
            if (globalScale > 1.1 || isActive) {
              const fontSize = 10.5 / globalScale;
              ctx.font = `500 ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = "rgba(203, 209, 222, 0.85)";
              ctx.fillText(node.numero, x, y + r + 8 / globalScale);
            }
          }}
          nodePointerAreaPaint={(n, color, ctx) => {
            const node = n as GraphNode;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, nodeRadius(node.val) + 4, 0, Math.PI * 2);
            ctx.fill();
          }}
          cooldownTicks={100}
          d3VelocityDecay={0.4}
          autoPauseRedraw={reduceMotion}
        />

        <div className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-1.5 rounded-lg border border-base-700 bg-base-900/80 px-4 py-3 text-xs text-slate-400 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Acuerdos Plenarios
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-steel-400" />
            Casaciones
          </div>
          <div className="mt-1 text-label text-[10px] text-slate-600">
            Tamaño del nodo = número de citas
          </div>
        </div>
      </div>
    );
  }
);

GraphVisualizer.displayName = "GraphVisualizer";

export default GraphVisualizer;
