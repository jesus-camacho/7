import { Resolucion, GraphData, GraphNode } from "../types";

/**
 * Resoluciones reales de la Corte Suprema de Justicia del Perú (Sala Penal
 * Permanente y Sala Penal Transitoria), tal como fueron publicadas por el
 * propio Poder Judicial. Los PDF de origen están en `public/documentos`.
 *
 * `citas` queda en 0 para todas: son resoluciones muy recientes y aún no
 * existe en este portal un sistema real de conteo de citas entre ellas.
 * No se inventan relaciones de cita entre estos documentos: ninguno de
 * los cinco cita a otro de este mismo conjunto, así que el grafo no
 * dibuja enlaces entre ellos hasta que se agreguen más resoluciones
 * relacionadas.
 */
export const resoluciones: Resolucion[] = [
  {
    id: "rn-845-2025",
    tipo: "Recurso de Nulidad",
    numero: "Recurso de Nulidad N.° 845-2025/Lima",
    titulo:
      "Improcedencia de la conversión de pena sin agotar la condena condicional o la reserva del fallo",
    sala: "Sala Penal Transitoria - Corte Suprema",
    fecha: "2026-06-23",
    citas: 0,
    resumenRatioDecidendi:
      "El artículo 52 del Código Penal, modificado por el Decreto Legislativo 1585, permite convertir la pena privativa de libertad no mayor de cinco años en prestación de servicios a la comunidad o limitación de días libres, pero opera de manera subsidiaria: solo procede cuando no sea posible aplicar la condena condicional o la reserva del fallo condenatorio. La Corte declaró no haber nulidad en la resolución que rechazó una conversión de pena solicitada directamente, sin que el órgano de instancia hubiera evaluado antes esa alternativa previa, y devolvió el caso para que se analice.",
    articulosAplicados: [
      "Art. 52 - Código Penal (Conversión de la pena, modificado por D. Leg. 1585)",
      "Art. 6 - Código Penal (Retroactividad benigna)",
      "Art. 103 - Constitución Política del Perú",
    ],
    pdfUrl: "/documentos/rn-845-2025.pdf",
  },
  {
    id: "rn-690-2025",
    tipo: "Recurso de Nulidad",
    numero: "Recurso de Nulidad N.° 690-2025/Lima Norte",
    titulo:
      "Homicidio calificado por ferocidad: prueba indiciaria y descarte de legítima defensa",
    sala: "Sala Penal Transitoria - Corte Suprema",
    fecha: "2026-05-27",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte confirmó la condena por homicidio calificado por ferocidad, sustentada en prueba indiciaria plural y concordante: presencia y oportunidad física del acusado en la escena, capacidad y acceso a un arma de fuego por su ocupación, fuga inmediata y permanencia en la clandestinidad durante dieciocho años, y un dictamen de absorción atómica que descartó que la víctima hubiera efectuado un disparo. Precisó que esa pericia es indicativa y no declarativa, y que la trayectoria descendente del proyectil es incompatible con la versión de un forcejeo o legítima defensa.",
    articulosAplicados: [
      "Art. 108 inciso 1 - Código Penal (Homicidio calificado - Asesinato, por ferocidad)",
      "Art. 139 inciso 5 - Constitución Política del Perú (Motivación de resoluciones judiciales)",
      "Art. 280 - Código de Procedimientos Penales (Unidad del expediente)",
    ],
    pdfUrl: "/documentos/rn-690-2025.pdf",
  },
  {
    id: "cas-2308-2022",
    tipo: "Casacion",
    numero: "Casación N.° 2308-2022/Lambayeque",
    titulo:
      "Abuso de firma en blanco: omitir una pericia grafotécnica no es, por sí solo, defensa pública ineficaz",
    sala: "Sala Penal Permanente - Corte Suprema",
    fecha: "2026-06-12",
    citas: 0,
    resumenRatioDecidendi:
      "Para que se configure una defensa pública ineficaz no basta con que el abogado no haya ofrecido prueba de descargo; debe evaluarse su actuación a lo largo de todo el proceso. La Corte declaró infundada la casación al verificar que el defensor público intervino activamente en cada etapa del juicio y que la omisión de proponer un peritaje grafotécnico correspondía a una estrategia de defensa válida, no a una negligencia inexcusable, más aún cuando la responsabilidad de la procesada quedó acreditada con prueba documental y testimonial sólida.",
    articulosAplicados: [
      "Art. 197 inciso 2 - Código Penal (Abuso de firma en blanco)",
      "Art. 196 - Código Penal (Defraudación)",
      "Art. 139 inciso 14 - Constitución Política del Perú (Derecho de defensa)",
      "Art. 429 inciso 1 - Código Procesal Penal",
    ],
    pdfUrl: "/documentos/cas-2308-2022.pdf",
  },
  {
    id: "cas-1885-2023",
    tipo: "Casacion",
    numero: "Casación N.° 1885-2023/Huaura",
    titulo:
      "Colusión agravada: el doble conforme impide la casación excepcional motivada solo en interés particular",
    sala: "Sala Penal Permanente - Corte Suprema",
    fecha: "2026-04-27",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró inadmisible una casación excepcional contra un auto que desestimó una excepción de improcedencia de acción por colusión agravada, al haber sido confirmado por el auto de vista (principio del doble conforme). Precisó que la discrepancia del recurrente con los criterios de las instancias, incluso ante un voto en minoría, no evidencia por sí sola la necesidad de desarrollar doctrina jurisprudencial, sino que responde a un interés particular del caso concreto.",
    articulosAplicados: [
      "Art. 384 - Código Penal (Colusión)",
      "Art. 25 - Código Penal (Complicidad)",
      "Art. 427 inciso 4 - Código Procesal Penal (Casación excepcional)",
      "Art. 428 inciso 1 literal d) - Código Procesal Penal (Doble conforme)",
    ],
    pdfUrl: "/documentos/cas-1885-2023.pdf",
  },
  {
    id: "rn-977-2025",
    tipo: "Recurso de Nulidad",
    numero: "Recurso de Nulidad N.° 977-2025/Ucayali",
    titulo:
      "Robo agravado: motivación insuficiente para negar la suspensión de la pena por falta de acreditación de peligrosidad",
    sala: "Sala Penal Transitoria - Corte Suprema",
    fecha: "2026-07-16",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró haber nulidad en el extremo que denegó la suspensión de la ejecución de la pena en un caso de robo agravado, al considerar que la Sala Superior no motivó adecuadamente la prognosis desfavorable: la violencia invocada era la misma que ya configuraba la agravante del delito, no hubo violencia física sino amenaza, y el conocimiento de armas de fuego atribuido al sentenciado por su servicio militar era cronológicamente imposible, pues lo realizó años después de los hechos. Reformó la sentencia y dispuso la suspensión de la pena de ocho años por un período de prueba de siete años.",
    articulosAplicados: [
      "Art. 57 - Código Penal (Suspensión de la ejecución de la pena, modificado por D. Leg. 1696)",
      "Art. 188 y 189 - Código Penal (Robo agravado)",
      "Art. 58 y 59 - Código Penal (Reglas de conducta)",
    ],
    pdfUrl: "/documentos/rn-977-2025.pdf",
  },
];

// Graph-view palette: nodes read mostly as neutral white/light-gray dots,
// with green reserved for Acuerdos Plenarios (binding doctrine) so it
// stands out sparingly, the way accent-colored notes do in a knowledge
// graph — not one color per document type.
const colorPorTipo = (tipo: Resolucion["tipo"]) => {
  switch (tipo) {
    case "Acuerdo Plenario":
      return "#8bc34a";
    case "Casacion":
      return "#e4e4e7";
    case "Recurso de Nulidad":
      return "#d4d4d8";
  }
};

const nodes: GraphNode[] = resoluciones.map((r) => ({
  ...r,
  color: colorPorTipo(r.tipo),
  val: Math.max(3, Math.round(r.citas / 22)),
}));

export const graphData: GraphData = {
  nodes,
  links: [],
};
