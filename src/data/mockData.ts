import { Resolucion, GraphData, GraphNode } from "../types";

/**
 * Datos de prueba (mock data).
 * Contenido ficticio generado únicamente para poblar la interfaz del MVP.
 * Debe reemplazarse por datos reales (API / base de datos de jurisprudencia)
 * antes de cualquier lanzamiento público.
 */
export const resolucionesMock: Resolucion[] = [
  {
    id: "ap-01-2026",
    tipo: "Acuerdo Plenario",
    numero: "Acuerdo Plenario N.° 1-2026/CJ-116",
    titulo: "Determinación judicial de la pena en el concurso real de delitos",
    sala: "Salas Penales Permanente y Transitorias - Corte Suprema",
    fecha: "2026-01-15",
    citas: 128,
    resumenRatioDecidendi:
      "El Pleno establece los criterios para la determinación de la pena concreta cuando concurren varios delitos independientes, fijando reglas de proporcionalidad y límites máximos, y precisando el rol del juez en la individualización de la pena conforme a los principios de legalidad y culpabilidad.",
    articulosAplicados: [
      "Art. 50° - Código Penal (Concurso real de delitos)",
      "Art. 45°-A - Código Penal (Individualización de la pena)",
      "Art. VIII - Título Preliminar del Código Penal",
    ],
    pdfUrl: "https://www.pj.gob.pe/",
  },
  {
    id: "cas-245-2019",
    tipo: "Casacion",
    numero: "Casación N.° 245-2019/Lima",
    titulo: "Valoración de la prueba indiciaria en delitos de organización criminal",
    sala: "Sala Penal Permanente - Corte Suprema",
    fecha: "2019-08-22",
    citas: 76,
    resumenRatioDecidendi:
      "La Sala fija los estándares mínimos para que la prueba indiciaria sustente una condena: pluralidad de indicios, interrelación entre ellos y motivación explícita del razonamiento inferencial, en armonía con los criterios sentados en el Acuerdo Plenario sobre determinación de la pena.",
    articulosAplicados: [
      "Art. 158° - Código Procesal Penal (Prueba indiciaria)",
      "Art. 317° - Código Penal (Organización criminal)",
    ],
    pdfUrl: "https://www.pj.gob.pe/",
  },
  {
    id: "cas-318-2020",
    tipo: "Casacion",
    numero: "Casación N.° 318-2020/Cusco",
    titulo: "Reincidencia y su incidencia en el concurso real de delitos",
    sala: "Sala Penal Transitoria - Corte Suprema",
    fecha: "2020-11-05",
    citas: 54,
    resumenRatioDecidendi:
      "Se precisa que la agravante de reincidencia debe evaluarse de forma independiente por cada delito antes de aplicar las reglas de concurso real, evitando una doble valoración que vulnere el principio de non bis in idem.",
    articulosAplicados: [
      "Art. 46°-B - Código Penal (Reincidencia)",
      "Art. 50° - Código Penal (Concurso real de delitos)",
    ],
    pdfUrl: "https://www.pj.gob.pe/",
  },
  {
    id: "cas-452-2021",
    tipo: "Casacion",
    numero: "Casación N.° 452-2021/Arequipa",
    titulo: "Estándar de motivación de sentencias condenatorias",
    sala: "Sala Penal Permanente - Corte Suprema",
    fecha: "2021-03-18",
    citas: 91,
    resumenRatioDecidendi:
      "La Corte desarrolla el contenido esencial del deber de motivación: exposición del método de valoración probatoria, respuesta a los argumentos de la defensa y coherencia interna entre los hechos probados y la calificación jurídica aplicada.",
    articulosAplicados: [
      "Art. 139° inciso 5 - Constitución Política del Perú",
      "Art. 394° - Código Procesal Penal (Requisitos de la sentencia)",
    ],
    pdfUrl: "https://www.pj.gob.pe/",
  },
  {
    id: "cas-587-2022",
    tipo: "Casacion",
    numero: "Casación N.° 587-2022/Piura",
    titulo: "Principio de proporcionalidad en la imposición de penas efectivas",
    sala: "Sala Penal Transitoria - Corte Suprema",
    fecha: "2022-06-30",
    citas: 63,
    resumenRatioDecidendi:
      "Se establece que la conversión o suspensión de la pena debe evaluarse a la luz del principio de proporcionalidad, ponderando la gravedad del injusto, la culpabilidad del agente y los fines preventivo-especiales de la sanción penal.",
    articulosAplicados: [
      "Art. VIII - Título Preliminar del Código Penal (Proporcionalidad)",
      "Art. 57° - Código Penal (Suspensión de la ejecución de la pena)",
    ],
    pdfUrl: "https://www.pj.gob.pe/",
  },
];

const colorPorTipo = (tipo: Resolucion["tipo"]) =>
  tipo === "Acuerdo Plenario" ? "#eab040" : "#3b82f6";

const nodes: GraphNode[] = resolucionesMock.map((r) => ({
  ...r,
  color: colorPorTipo(r.tipo),
  val: Math.max(4, Math.round(r.citas / 12)),
}));

export const graphDataMock: GraphData = {
  nodes,
  links: [
    { source: "ap-01-2026", target: "cas-245-2019" },
    { source: "ap-01-2026", target: "cas-318-2020" },
    { source: "ap-01-2026", target: "cas-452-2021" },
    { source: "ap-01-2026", target: "cas-587-2022" },
    { source: "cas-318-2020", target: "cas-245-2019" },
    { source: "cas-452-2021", target: "cas-587-2022" },
  ],
};
