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

const ROTATION_PERIOD_MS = 22000;

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

const lighten = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount);
  const b = Math.round((n & 255) + (255 - (n & 255)) * amount);
  return `rgb(${r}, ${g}, ${b})`;
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

    // Spread nodes out for a clean diagram before the simulation settles
    // (must be applied before it cools down, not after).
    useEffect(() => {
      if (!fgRef.current) return;
      fgRef.current.d3Force("charge")?.strength(-220);
      fgRef.current.d3Force("link")?.distance(130);
      fgRef.current.d3ReheatSimulation();
    }, []);

    // Ambient rotation for the orbit ring drawn on each node is driven by
    // wall-clock time inside nodeCanvasObject, combined with a per-node
    // phase offset so nodes don't spin in lockstep. autoPauseRedraw={false}
    // (below) keeps the canvas redrawing continuously, which is what makes
    // that motion (and the traveling link particles) visible at rest.
    const reduceMotion = useRef(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ).current;

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
          linkColor={() => "rgba(199, 197, 192, 0.16)"}
          linkWidth={1}
          linkDirectionalParticles={reduceMotion ? 0 : 2}
          linkDirectionalParticleWidth={2.4}
          linkDirectionalParticleSpeed={0.0035}
          linkDirectionalParticleColor={(l: any) => {
            const target = l.target as GraphNode;
            const color = typeof target === "object" ? target?.color : undefined;
            return color ? withAlpha(color, 0.95) : "rgba(242, 179, 68, 0.9)";
          }}
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

            // Soft ambient glow, restrained rather than a hard neon halo.
            ctx.save();
            ctx.shadowColor = withAlpha(node.color, isActive ? 0.55 : 0.3);
            ctx.shadowBlur = (isActive ? 22 : 12) / globalScale;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.restore();

            ctx.lineWidth = 1.2 / globalScale;
            ctx.strokeStyle = lighten(node.color, 0.25);
            ctx.stroke();

            // Ambient orbit ring: a slow-rotating partial arc, subtle and
            // slightly more present on hover/selection.
            const phase = hashPhase(node.id) * Math.PI * 2;
            const t = reduceMotion ? 0 : Date.now() / ROTATION_PERIOD_MS;
            const angle = t * Math.PI * 2 + phase;
            ctx.beginPath();
            ctx.strokeStyle = withAlpha(lighten(node.color, 0.2), isActive ? 0.9 : 0.45);
            ctx.lineWidth = (isActive ? 2 : 1.3) / globalScale;
            ctx.arc(x, y, r + 4.5 / globalScale, angle, angle + Math.PI * 0.55);
            ctx.stroke();

            if (isActive) {
              ctx.beginPath();
              ctx.strokeStyle = "rgba(238, 236, 231, 0.8)";
              ctx.lineWidth = 1.6 / globalScale;
              ctx.arc(x, y, r + 4.5 / globalScale, angle + Math.PI, angle + Math.PI * 1.55);
              ctx.stroke();
            }

            // Label
            if (globalScale > 1.1 || isActive) {
              const fontSize = 10.5 / globalScale;
              ctx.font = `600 ${fontSize}px Manrope, Inter, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = "rgba(199, 197, 192, 0.9)";
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

        <div className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-1.5 rounded-xl bg-surface-100/90 px-4 py-3 text-xs text-ink-500 shadow-float backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Acuerdos Plenarios
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Casaciones
          </div>
          <div className="mt-1 text-label text-[10px] text-ink-400">
            Tamaño del nodo = número de citas
          </div>
        </div>
      </div>
    );
  }
);

GraphVisualizer.displayName = "GraphVisualizer";

export default GraphVisualizer;
