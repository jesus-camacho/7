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

const nodeRadius = (val: number) => 2 + Math.sqrt(val) * 1.9;

const shortLabel = (n: GraphNode) => n.id.toUpperCase().replace(/-/g, " ");

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

    // Dense, tightly-packed layout to match the reference: short link
    // distance and mild repulsion so the graph reads as a compact web
    // rather than spread-out balloons.
    useEffect(() => {
      if (!fgRef.current) return;
      fgRef.current.d3Force("charge")?.strength(-90);
      fgRef.current.d3Force("link")?.distance(45);
      fgRef.current.d3ReheatSimulation();
    }, []);

    // onEngineStop can fire more than once as the simulation settles in
    // bursts; only auto-fit the very first time, otherwise each firing
    // restarts a 600ms zoom transition and the view never truly settles.
    const hasAutoFitted = useRef(false);
    const handleEngineStop = useCallback(() => {
      if (hasAutoFitted.current) return;
      hasAutoFitted.current = true;
      resetView();
    }, [resetView]);

    return (
      <div ref={containerRef} className="relative h-full w-full bg-surface-0">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data as any}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeVal={(n) => (n as GraphNode).val}
          linkColor={() => "rgba(255, 255, 255, 0.14)"}
          linkWidth={0.6}
          onNodeClick={(n) => onSelectNode(n as GraphNode)}
          onNodeHover={(n) => setHoverId((n as NodeObject | null)?.id?.toString() ?? null)}
          onEngineStop={handleEngineStop}
          nodeCanvasObjectMode={() => "replace"}
          nodeCanvasObject={(n, ctx, globalScale) => {
            const node = n as GraphNode;
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const r = nodeRadius(node.val);
            const isActive = node.id === selectedId || node.id === hoverId;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();

            if (isActive) {
              ctx.lineWidth = 1.6 / globalScale;
              ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
              ctx.stroke();
            }

            const showLabel = isActive || r > 8 || globalScale > 2.2;
            if (showLabel) {
              const fontSize = 10.5 / globalScale;
              ctx.font = `500 ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
              ctx.fillText(shortLabel(node), x, y + r + 5 / globalScale);
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
          autoPauseRedraw={true}
        />

        <div className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-1.5 rounded-xl bg-black/70 px-4 py-3 text-xs text-white/70 shadow-float backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/85" />
            Resolución
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8bc34a" }} />
            Doctrina vinculante (Acuerdo Plenario)
          </div>
          <div className="mt-1 text-label text-[10px] text-white/40">
            Tamaño del nodo = número de citas
          </div>
        </div>
      </div>
    );
  }
);

GraphVisualizer.displayName = "GraphVisualizer";

export default GraphVisualizer;
