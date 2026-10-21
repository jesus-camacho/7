import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { GraphData, GraphNode } from "../types";
import { contornos } from "../data/mapa";

interface GraphVisualizerProps {
  data: GraphData;
  selectedId: string | null;
  /** Resolución recorrida en el buscador: se centra y resalta sin abrir el panel. */
  previewId?: string | null;
  onSelectNode: (node: GraphNode) => void;
}

export interface GraphVisualizerHandle {
  focusNode: (id: string) => void;
  resetView: () => void;
}

/** Punto en la esfera unitaria. */
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const TWO_PI = Math.PI * 2;
const GRADOS = Math.PI / 180;

/** Coordenada geográfica a punto sobre la esfera unitaria. */
const vectorDe = (lat: number, lon: number): Vec3 => {
  const la = lat * GRADOS;
  // La longitud se mide en sentido contrario al de la parametrización
  // directa: así el este queda a la derecha en pantalla y el mapa no sale
  // reflejado (comprobado con Lima, Chiclayo, Río, Bogotá y Santiago).
  const lo = -lon * GRADOS;
  return {
    x: Math.cos(la) * Math.cos(lo),
    y: Math.sin(la),
    z: Math.cos(la) * Math.sin(lo),
  };
};

/** Rotación que deja un punto mirando al frente del globo. */
const camaraHacia = (v: Vec3) => ({
  yaw: Math.atan2(-v.x, v.z),
  pitch: Math.atan2(v.y, Math.hypot(v.x, v.z)),
});

// El acervo es jurisprudencia peruana, así que la vista abre sobre el Perú
// en lugar de sobre un punto arbitrario del globo.
const VISTA_PERU = camaraHacia(vectorDe(-9.2, -75));
const ZOOM_INICIAL = 4.2;

/** Rota un punto alrededor de Y (yaw) y luego de X (pitch). */
const rotate = (v: Vec3, yaw: number, pitch: number): Vec3 => {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v.x * cy + v.z * sy;
  const z1 = -v.x * sy + v.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x: x1, y: v.y * cp - z1 * sp, z: v.y * sp + z1 * cp };
};

/** Interpolación sobre el arco de círculo máximo entre dos puntos. */
const slerp = (a: Vec3, b: Vec3, t: number): Vec3 => {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z;
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const so = Math.sin(omega);
  const k0 = Math.sin((1 - t) * omega) / so;
  const k1 = Math.sin(t * omega) / so;
  return {
    x: a.x * k0 + b.x * k1,
    y: a.y * k0 + b.y * k1,
    z: a.z * k0 + b.z * k1,
  };
};

const shortLabel = (n: GraphNode) =>
  n.id.replace(/^cidh-/, "").toUpperCase().replace(/-/g, " ");

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const GraphVisualizer = forwardRef<GraphVisualizerHandle, GraphVisualizerProps>(
  ({ data, selectedId, previewId = null, onSelectNode }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
    const [hoverId, setHoverId] = useState<string | null>(null);

    const reduceMotion = useRef(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ).current;

    // Cada resolución se ubica donde ocurrieron los hechos. Cuando varias
    // comparten lugar (Lima concentra buena parte del acervo) se abren en
    // abanico alrededor del punto real para que no se tapen entre sí; el
    // lugar exacto siempre se lee en el panel.
    const posiciones = useMemo(() => {
      const grupos = new Map<string, GraphNode[]>();
      for (const n of data.nodes) {
        const clave = `${n.lugar.lat.toFixed(2)},${n.lugar.lon.toFixed(2)}`;
        const lista = grupos.get(clave);
        if (lista) lista.push(n);
        else grupos.set(clave, [n]);
      }
      const mapa = new Map<string, Vec3>();
      grupos.forEach((nodos) => {
        nodos.forEach((n, i) => {
          let { lat, lon } = n.lugar;
          if (nodos.length > 1) {
            const radio = 0.5 + nodos.length * 0.12;
            const ang = (i / nodos.length) * TWO_PI;
            lat += Math.sin(ang) * radio;
            lon += (Math.cos(ang) * radio) / Math.cos(lat * GRADOS);
          }
          mapa.set(n.id, vectorDe(lat, lon));
        });
      });
      return mapa;
    }, [data.nodes]);

    // Los contornos del mapa se convierten una sola vez; por frame solo se
    // rotan y proyectan.
    const mapaVectores = useMemo(
      () =>
        contornos.map((linea) => {
          const pts: Vec3[] = [];
          for (let i = 0; i < linea.length; i += 2) {
            pts.push(vectorDe(linea[i + 1], linea[i]));
          }
          return pts;
        }),
      []
    );

    const grados = useMemo(() => {
      const m = new Map<string, number>();
      for (const l of data.links) {
        m.set(l.source, (m.get(l.source) ?? 0) + 1);
        m.set(l.target, (m.get(l.target) ?? 0) + 1);
      }
      return m;
    }, [data.links]);

    // Estado de cámara en refs: se anima por frame, fuera del ciclo de React.
    const cam = useRef({ ...VISTA_PERU, zoom: ZOOM_INICIAL });
    const objetivo = useRef<null | { yaw: number; pitch: number; zoom: number }>(null);
    const autoRotar = useRef(!reduceMotion);
    // Eje del vaivén. El balanceo se calcula como desvío absoluto respecto
    // de este valor: sumarlo frame a frame hacía que la vista derivara.
    const yawBase = useRef(VISTA_PERU.yaw);
    const arrastre = useRef<null | { x: number; y: number; movido: boolean }>(null);
    const proyectado = useRef(new Map<string, { sx: number; sy: number; z: number; r: number }>());
    const hoverRef = useRef<string | null>(null);
    const selectedRef = useRef<string | null>(null);
    const previewRef = useRef<string | null>(null);

    useEffect(() => {
      hoverRef.current = hoverId;
    }, [hoverId]);
    useEffect(() => {
      selectedRef.current = selectedId;
    }, [selectedId]);
    useEffect(() => {
      previewRef.current = previewId;
    }, [previewId]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver((entries) => {
        const e = entries[0];
        if (e) setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    const resetView = useCallback(() => {
      objetivo.current = { ...VISTA_PERU, zoom: ZOOM_INICIAL };
      autoRotar.current = !reduceMotion;
    }, [reduceMotion]);

    useImperativeHandle(ref, () => ({
      focusNode: (id: string) => {
        const v = posiciones.get(id);
        if (!v) return;
        // Rotación que deja ese punto mirando al frente.
        objetivo.current = { ...camaraHacia(v), zoom: 4.5 };
        autoRotar.current = false;
      },
      resetView,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = dimensions.width * dpr;
      canvas.height = dimensions.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let raf = 0;
      const inicio = performance.now();

      const dibujar = (ahora: number) => {
        const t = (ahora - inicio) / 1000;
        const w = dimensions.width;
        const h = dimensions.height;
        const cx = w / 2;
        const cy = h / 2;

        // Interpolación suave hacia la cámara objetivo.
        if (objetivo.current) {
          const o = objetivo.current;
          const c = cam.current;
          c.yaw += (o.yaw - c.yaw) * 0.08;
          c.pitch += (o.pitch - c.pitch) * 0.08;
          c.zoom += (o.zoom - c.zoom) * 0.08;
          yawBase.current = c.yaw;
          if (
            Math.abs(o.yaw - c.yaw) < 0.002 &&
            Math.abs(o.pitch - c.pitch) < 0.002 &&
            Math.abs(o.zoom - c.zoom) < 0.002
          ) {
            objetivo.current = null;
          }
        } else if (autoRotar.current && !arrastre.current) {
          // Vaivén suave en torno al eje: una rotación completa dejaría al
          // Perú fuera de vista la mitad del tiempo.
          cam.current.yaw = yawBase.current + Math.sin(t * 0.22) * 0.016;
        }

        const { yaw, pitch, zoom } = cam.current;
        const R = Math.min(w, h) * 0.36 * zoom;

        ctx.clearRect(0, 0, w, h);

        // --- Fondo vectorial: halo, retícula del globo y marcas ---
        const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.9);
        halo.addColorStop(0, "rgba(255, 255, 255, 0.035)");
        halo.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 1;
        // Paralelos
        for (let i = 1; i < 7; i++) {
          const lat = -Math.PI / 2 + (i * Math.PI) / 7;
          ctx.beginPath();
          let primero = true;
          for (let j = 0; j <= 72; j++) {
            const lon = (j / 72) * TWO_PI;
            const v = rotate(
              {
                x: Math.cos(lat) * Math.cos(lon),
                y: Math.sin(lat),
                z: Math.cos(lat) * Math.sin(lon),
              },
              yaw,
              pitch
            );
            if (v.z < -0.02) {
              primero = true;
              continue;
            }
            const sx = cx + v.x * R;
            const sy = cy - v.y * R;
            if (primero) {
              ctx.moveTo(sx, sy);
              primero = false;
            } else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
          ctx.stroke();
        }
        // Meridianos
        for (let i = 0; i < 12; i++) {
          const lon = (i / 12) * TWO_PI;
          ctx.beginPath();
          let primero = true;
          for (let j = 0; j <= 72; j++) {
            const lat = -Math.PI / 2 + (j / 72) * Math.PI;
            const v = rotate(
              {
                x: Math.cos(lat) * Math.cos(lon),
                y: Math.sin(lat),
                z: Math.cos(lat) * Math.sin(lon),
              },
              yaw,
              pitch
            );
            if (v.z < -0.02) {
              primero = true;
              continue;
            }
            const sx = cx + v.x * R;
            const sy = cy - v.y * R;
            if (primero) {
              ctx.moveTo(sx, sy);
              primero = false;
            } else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
          ctx.stroke();
        }
        // Delimitación geográfica: trazo mínimo, solo para situar los casos.
        ctx.beginPath();
        for (const linea of mapaVectores) {
          let primero = true;
          for (const punto of linea) {
            const v = rotate(punto, yaw, pitch);
            if (v.z < 0) {
              primero = true;
              continue;
            }
            const sx = cx + v.x * R;
            const sy = cy - v.y * R;
            if (primero) {
              ctx.moveTo(sx, sy);
              primero = false;
            } else ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Anillo exterior con marcas
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.06, 0, TWO_PI);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.stroke();
        for (let i = 0; i < 48; i++) {
          const a = (i / 48) * TWO_PI;
          const r0 = R * 1.09;
          const r1 = R * (i % 4 === 0 ? 1.14 : 1.115);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.stroke();
        }

        // --- Proyección de nodos ---
        const proj = proyectado.current;
        proj.clear();
        const activo = hoverRef.current ?? previewRef.current ?? selectedRef.current;
        const vecinos = new Set<string>();
        if (activo) {
          for (const l of data.links) {
            if (l.source === activo) vecinos.add(l.target);
            if (l.target === activo) vecinos.add(l.source);
          }
        }

        for (const n of data.nodes) {
          const base = posiciones.get(n.id);
          if (!base) continue;
          const v = rotate(base, yaw, pitch);
          const prof = (v.z + 1) / 2; // 0 = atrás, 1 = al frente
          proj.set(n.id, {
            sx: cx + v.x * R,
            sy: cy - v.y * R,
            z: v.z,
            r: (2.4 + Math.sqrt(n.val) * 1.8) * (0.55 + 0.45 * prof),
          });
        }

        // --- Enlaces (arcos sobre la superficie) ---
        data.links.forEach((l, idx) => {
          const a = posiciones.get(l.source);
          const b = posiciones.get(l.target);
          if (!a || !b) return;
          const resaltado =
            activo !== null && (l.source === activo || l.target === activo);

          const puntos: { sx: number; sy: number; z: number }[] = [];
          for (let s = 0; s <= 20; s++) {
            const p = slerp(a, b, s / 20);
            const v = rotate(p, yaw, pitch);
            puntos.push({ sx: cx + v.x * R * 1.01, sy: cy - v.y * R * 1.01, z: v.z });
          }

          ctx.beginPath();
          let primero = true;
          let zMedio = 0;
          for (const p of puntos) {
            zMedio += p.z;
            if (p.z < -0.05) {
              primero = true;
              continue;
            }
            if (primero) {
              ctx.moveTo(p.sx, p.sy);
              primero = false;
            } else ctx.lineTo(p.sx, p.sy);
          }
          zMedio /= puntos.length;
          const prof = (zMedio + 1) / 2;
          ctx.strokeStyle = resaltado
            ? `rgba(255, 255, 255, ${0.4 + 0.5 * prof})`
            : `rgba(255, 255, 255, ${0.12 + 0.26 * prof})`;
          ctx.lineWidth = resaltado ? 1.4 : 0.9;
          ctx.stroke();

          // Partícula que recorre el enlace: la mitad va de ida y la otra
          // de vuelta, para que el grafo se lea como tráfico entre casos.
          if (!reduceMotion) {
            const dir = idx % 2 === 0 ? 1 : -1;
            const fase = (idx * 0.37) % 1;
            let tt = (t * 0.22 + fase) % 1;
            if (dir < 0) tt = 1 - tt;
            const p = rotate(slerp(a, b, tt), yaw, pitch);
            if (p.z > -0.05) {
              const pr = (p.z + 1) / 2;
              ctx.beginPath();
              ctx.arc(cx + p.x * R * 1.01, cy - p.y * R * 1.01, resaltado ? 2.2 : 1.7, 0, TWO_PI);
              ctx.fillStyle = resaltado
                ? `rgba(255, 255, 255, ${0.8 * pr + 0.2})`
                : `rgba(200, 228, 178, ${0.6 * pr + 0.18})`;
              ctx.fill();
            }
          }
        });

        // --- Nodos (los de atrás primero) ---
        const ordenados = [...data.nodes].sort(
          (a, b) => (proj.get(a.id)?.z ?? 0) - (proj.get(b.id)?.z ?? 0)
        );

        for (const n of ordenados) {
          const p = proj.get(n.id);
          if (!p) continue;
          const prof = (p.z + 1) / 2;
          const esActivo =
            n.id === selectedRef.current ||
            n.id === hoverRef.current ||
            n.id === previewRef.current;
          const esVecino = vecinos.has(n.id);
          const alpha = esActivo ? 1 : (0.28 + 0.62 * prof) * (activo && !esVecino ? 0.55 : 1);

          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.r, 0, TWO_PI);
          ctx.fillStyle = withAlpha(n.color, alpha);
          ctx.fill();

          if (esActivo) {
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, p.r + 3.5, 0, TWO_PI);
            ctx.stroke();
          }

          // Etiquetas: solo en los nodos activos y en los más conectados
          // que estén de frente, para no saturar la vista.
          const esHub = (grados.get(n.id) ?? 0) >= 3;
          if (esActivo || (esHub && zoom >= 6 && p.z > 0.45)) {
            ctx.font = "500 11px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = esActivo
              ? "rgba(255, 255, 255, 0.95)"
              : `rgba(255, 255, 255, ${0.3 + 0.45 * prof})`;
            ctx.fillText(shortLabel(n), p.sx, p.sy + p.r + 6);
          }
        }

        raf = requestAnimationFrame(dibujar);
      };

      raf = requestAnimationFrame(dibujar);
      return () => cancelAnimationFrame(raf);
    }, [data, dimensions, posiciones, mapaVectores, grados, reduceMotion]);

    // ----------------------------- interacción -----------------------------

    const nodoEn = (x: number, y: number): GraphNode | null => {
      let mejor: { id: string; d: number } | null = null;
      proyectado.current.forEach((p, id) => {
        if (p.z < -0.1) return;
        const d = Math.hypot(p.sx - x, p.sy - y);
        if (d <= p.r + 7 && (!mejor || d < mejor.d)) mejor = { id, d };
      });
      if (!mejor) return null;
      const encontrado = mejor as { id: string; d: number };
      return data.nodes.find((n) => n.id === encontrado.id) ?? null;
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (arrastre.current) {
        const dx = x - arrastre.current.x;
        const dy = y - arrastre.current.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) arrastre.current.movido = true;
        cam.current.yaw += dx * 0.006;
        cam.current.pitch = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, cam.current.pitch + dy * 0.006)
        );
        arrastre.current.x = x;
        arrastre.current.y = y;
        yawBase.current = cam.current.yaw;
        objetivo.current = null;
        return;
      }

      const n = nodoEn(x, y);
      setHoverId(n?.id ?? null);
      e.currentTarget.style.cursor = n ? "pointer" : "grab";
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      arrastre.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        movido: false,
      };
      autoRotar.current = false;
    };

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const arrastrado = arrastre.current?.movido;
      arrastre.current = null;
      if (arrastrado) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const n = nodoEn(e.clientX - rect.left, e.clientY - rect.top);
      if (n) onSelectNode(n);
      else if (!reduceMotion) autoRotar.current = true;
    };

    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      const z = cam.current.zoom * (e.deltaY > 0 ? 0.92 : 1.08);
      cam.current.zoom = Math.max(0.6, Math.min(3, z));
      objetivo.current = null;
    };

    return (
      <div ref={containerRef} className="relative h-full w-full bg-surface-0">
        <canvas
          ref={canvasRef}
          style={{ width: dimensions.width, height: dimensions.height }}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={() => {
            arrastre.current = null;
            setHoverId(null);
          }}
          onWheel={onWheel}
        />

        <div className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-1.5 rounded-xl bg-black/70 px-4 py-3 text-xs text-white/70 shadow-float backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/85" />
            Corte Suprema del Perú
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8bc34a" }} />
            Corte Interamericana de DD. HH.
          </div>
          <div className="mt-1 text-label text-[10px] text-white/40">
            Tamaño = conexiones · arrastra para girar
          </div>
        </div>
      </div>
    );
  }
);

GraphVisualizer.displayName = "GraphVisualizer";

export default GraphVisualizer;
