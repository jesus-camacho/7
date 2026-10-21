import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Evita la pantalla en blanco: si algo falla al dibujar, muestra un aviso
 * con la opción de reintentar en lugar de dejar la app muerta.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Fallo al renderizar el portal:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center">
        <h1 className="text-title text-lg text-ink-900">
          El portal no pudo mostrarse
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink-500">
          Ocurrió un error inesperado al dibujar la vista. Puedes reintentar; si
          vuelve a pasar, cierra y abre la aplicación.
        </p>
        <button
          onClick={() => this.setState({ error: null })}
          className="rounded-xl bg-white/10 px-5 py-2.5 text-sm text-ink-900 transition-colors hover:bg-white/20"
        >
          Reintentar
        </button>
        <p className="max-w-sm text-[11px] text-ink-400">{error.message}</p>
      </div>
    );
  }
}
