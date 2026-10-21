import { useState } from "react";
import { Check, Copy, FileText, Gavel, Globe2, Scale, ScrollText, ShieldCheck, Undo2, X } from "lucide-react";
import { Fundamento, GraphNode, TipoResolucion } from "../types";

export interface Conexion {
  nodo: GraphNode;
  motivo: string;
}

interface SidePanelProps {
  node: GraphNode | null;
  open: boolean;
  onClose: () => void;
  conexiones: Conexion[];
  onSelectNode: (node: GraphNode) => void;
}

const BADGE_STYLE: Record<TipoResolucion, string> = {
  "Acuerdo Plenario": "bg-gold-100 text-gold-400",
  Casacion: "bg-violet-100 text-violet-400",
  "Recurso de Nulidad": "bg-teal-100 text-teal-400",
  Apelacion: "bg-[rgba(244,164,96,0.16)] text-[#e8b07a]",
  "Habeas Corpus": "bg-[rgba(147,197,253,0.16)] text-[#93c5fd]",
  "Sentencia CIDH": "bg-[rgba(139,195,74,0.16)] text-[#a5d16a]",
  Resolucion: "bg-[rgba(159,180,199,0.16)] text-[#b9c9d6]",
};

const BADGE_ICON: Record<TipoResolucion, typeof Gavel> = {
  "Acuerdo Plenario": Gavel,
  Casacion: ScrollText,
  "Recurso de Nulidad": Scale,
  Apelacion: Undo2,
  "Habeas Corpus": ShieldCheck,
  "Sentencia CIDH": Globe2,
  Resolucion: FileText,
};

export default function SidePanel({
  node,
  open,
  onClose,
  conexiones,
  onSelectNode,
}: SidePanelProps) {
  const BadgeIcon = node ? BADGE_ICON[node.tipo] : null;
  const esExterno = node ? node.pdfUrl.startsWith("http") : false;
  const [copiado, setCopiado] = useState<number | null>(null);

  /** Cita lista para pegar en un escrito o leer en audiencia. */
  const armarCita = (f: Fundamento) =>
    `\u00ab${f.texto}\u00bb (${node?.numero ?? ""}, ${f.referencia}).`;

  const copiarCita = async (f: Fundamento, i: number) => {
    try {
      await navigator.clipboard.writeText(armarCita(f));
      setCopiado(i);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Si el navegador niega el portapapeles, se selecciona el texto
      // para que el usuario lo copie a mano.
      const el = document.getElementById(`cita-${i}`);
      if (el) {
        const rango = document.createRange();
        rango.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(rango);
      }
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col bg-surface-100 shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {node && (
          <>
            <div className="flex items-start justify-between px-6 py-5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-label ${BADGE_STYLE[node.tipo]}`}
              >
                {BadgeIcon && <BadgeIcon size={12} />}
                {node.tipo}
              </span>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-surface-200 hover:text-ink-900"
                aria-label="Cerrar panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-2">
              <p className="text-label text-ink-500">{node.numero}</p>
              <h2 className="text-title mt-2 text-xl leading-snug">{node.titulo}</h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                <span>{node.sala}</span>
                <span>·</span>
                {node.fecha && !isNaN(new Date(node.fecha).getTime()) && (
                  <span>
                    {new Date(node.fecha).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">Resumen de la Ratio Decidendi</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-700">
                  {node.resumenRatioDecidendi}
                </p>
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">Fundamentos para citar</h3>
                {node.fundamentos && node.fundamentos.length > 0 ? (
                  <ul className="mt-2.5 space-y-3">
                    {node.fundamentos.map((f, i) => (
                      <li
                        key={f.referencia}
                        className="rounded-lg border border-surface-300/60 bg-surface-0/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm text-ink-900">{f.tema}</span>
                          <span className="shrink-0 rounded bg-surface-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-500">
                            {f.referencia}
                          </span>
                        </div>
                        <blockquote
                          id={`cita-${i}`}
                          className="mt-2 border-l-2 border-gold-500/50 pl-3 text-sm italic leading-relaxed text-ink-700"
                        >
                          {f.texto}
                        </blockquote>
                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <button
                            onClick={() => copiarCita(f, i)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-surface-200 px-2.5 py-1.5 text-xs text-ink-700 transition-colors hover:bg-surface-300 hover:text-ink-900"
                          >
                            {copiado === i ? <Check size={12} /> : <Copy size={12} />}
                            {copiado === i ? "Cita copiada" : "Copiar cita"}
                          </button>
                          <span className="text-[10px] text-ink-400">
                            {f.verificado
                              ? "Cotejado con el PDF"
                              : "Texto reconocido por OCR: coteja antes de citar"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
                    Todavía no hay citas literales cargadas para esta sentencia.
                    Se agregan solo después de cotejarlas contra el PDF oficial,
                    nunca de memoria.
                  </p>
                )}
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">Artículos Aplicados</h3>
                <ul className="mt-2.5 space-y-2">
                  {node.articulosAplicados.map((articulo) => (
                    <li
                      key={articulo}
                      className="rounded-lg bg-surface-0/60 px-3 py-2 text-sm text-ink-700"
                    >
                      {articulo}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">
                  Resoluciones conectadas ({conexiones.length})
                </h3>
                {conexiones.length === 0 ? (
                  <p className="mt-2.5 text-sm text-ink-500">
                    Todavía no se ha verificado ninguna conexión con otra
                    resolución del portal.
                  </p>
                ) : (
                  <ul className="mt-2.5 space-y-2">
                    {conexiones.map(({ nodo, motivo }) => (
                      <li key={nodo.id}>
                        <button
                          onClick={() => onSelectNode(nodo)}
                          className="w-full rounded-lg bg-surface-0/60 px-3 py-2.5 text-left transition-colors hover:bg-surface-200"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: nodo.color }}
                            />
                            <span className="text-sm text-ink-900">{nodo.numero}</span>
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                            {motivo}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              <a
                href={node.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-surface-0 shadow-card transition-colors hover:bg-gold-400"
              >
                <FileText size={16} />
                Ver PDF Completo
              </a>
              <p className="mt-2 text-center text-[11px] text-ink-400">
                {esExterno
                  ? "Documento oficial de la Corte Interamericana de DD. HH."
                  : "Servido desde nuestro repositorio de documentos"}
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
