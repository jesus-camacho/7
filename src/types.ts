export type TipoResolucion = "Acuerdo Plenario" | "Casacion";

export interface Resolucion {
  id: string;
  tipo: TipoResolucion;
  numero: string;
  titulo: string;
  sala: string;
  fecha: string;
  citas: number;
  resumenRatioDecidendi: string;
  articulosAplicados: string[];
  pdfUrl: string;
}

export interface GraphNode extends Resolucion {
  val: number;
  color: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
