import { FileText, Gavel, Scale, ScrollText, X } from "lucide-react";
import { GraphNode, TipoResolucion } from "../types";

interface SidePanelProps {
  node: GraphNode | null;
  open: boolean;
  onClose: () => void;
}

const BADGE_STYLE: Record<TipoResolucion, string> = {
  "Acuerdo Plenario": "bg-gold-100 text-gold-400",
  Casacion: "bg-violet-100 text-violet-400",
  "Recurso de Nulidad": "bg-teal-100 text-teal-400",
};

const BADGE_ICON: Record<TipoResolucion, typeof Gavel> = {
  "Acuerdo Plenario": Gavel,
  Casacion: ScrollText,
  "Recurso de Nulidad": Scale,
};

export default function SidePanel({ node, open, onClose }: SidePanelProps) {
  const BadgeIcon = node ? BADGE_ICON[node.tipo] : null;

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
              <h2 className="text-title mt-2 text-xl leading-snug">
                {node.titulo}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                <span>{node.sala}</span>
                <span>·</span>
                <span>{new Date(node.fecha).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
                <span>·</span>
                <span>{node.citas} citas</span>
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">
                  Resumen de la Ratio Decidendi
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-700">
                  {node.resumenRatioDecidendi}
                </p>
              </div>

              <div className="mt-7">
                <h3 className="text-label text-ink-500">
                  Artículos Aplicados
                </h3>
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
                Servido desde nuestro repositorio de documentos
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
