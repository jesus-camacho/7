export type TipoResolucion =
  | "Acuerdo Plenario"
  | "Casacion"
  | "Recurso de Nulidad"
  | "Habeas Corpus"
  | "Sentencia CIDH";

/** Tribunal del que proviene la resolución. */
export type Institucion =
  | "Corte Suprema"
  | "Tribunal Constitucional"
  | "Corte IDH";

export interface Resolucion {
  id: string;
  tipo: TipoResolucion;
  institucion: Institucion;
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

/**
 * Un enlace existe solo cuando hay una relación verificable entre las dos
 * resoluciones: una cita a la otra, o ambas resuelven la misma cuestión
 * sustantiva. `motivo` deja constancia de cuál es esa relación, para que
 * ningún enlace quede sin justificación a la vista.
 */
export interface GraphLink {
  source: string;
  target: string;
  motivo: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
