import { FileText, Gavel, ScrollText, X } from "lucide-react";
import { GraphNode } from "../types";

interface SidePanelProps {
  node: GraphNode | null;
  open: boolean;
  onClose: () => void;
}

export default function SidePanel({ node, open, onClose }: SidePanelProps) {
  const isPlenario = node?.tipo === "Acuerdo Plenario";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-base-700 bg-base-900 shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {node && (
          <>
            <div className="flex items-start justify-between border-b border-base-700 px-6 py-5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-label ${
                  isPlenario
                    ? "border-gold-600/40 text-gold-400"
                    : "border-steel-600/40 text-steel-300"
                }`}
              >
                {isPlenario ? <Gavel size={12} /> : <ScrollText size={12} />}
                {node.tipo}
              </span>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-base-800 hover:text-slate-100"
                aria-label="Cerrar panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
              <p className="text-label text-slate-500">{node.numero}</p>
              <h2 className="text-title mt-2 text-xl leading-snug">
                {node.titulo}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
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
                <h3 className="text-label text-slate-400">
                  Resumen de la Ratio Decidendi
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {node.resumenRatioDecidendi}
                </p>
              </div>

              <div className="mt-7">
                <h3 className="text-label text-slate-400">
                  Artículos Aplicados
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {node.articulosAplicados.map((articulo) => (
                    <li
                      key={articulo}
                      className="rounded-lg border border-base-700 bg-base-850 px-3 py-2 text-sm text-slate-300"
                    >
                      {articulo}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-base-700 px-6 py-5">
              <a
                href={node.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-base-950 transition-colors hover:bg-gold-400"
              >
                <FileText size={16} />
                Ver PDF Completo
              </a>
              <p className="mt-2 text-center text-[11px] text-slate-600">
                Servido desde nuestro repositorio de documentos
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
