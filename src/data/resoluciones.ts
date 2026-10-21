import { Resolucion, GraphData, GraphNode, GraphLink } from "../types";

/**
 * Resoluciones reales, tomadas de sus fuentes oficiales:
 *
 * - Corte Suprema de Justicia del Perú: los PDF publicados por el propio
 *   Poder Judicial, guardados en `public/documentos`.
 * - Corte Interamericana de Derechos Humanos: las sentencias publicadas en
 *   corteidh.or.cr. Cada URL fue verificada antes de incluirse; cuando no se
 *   pudo verificar el PDF de la sentencia se enlaza la ficha oficial del caso.
 *
 * `citas` queda en 0: no existe todavía un conteo real de citas, y no se
 * inventa uno.
 */
export const resoluciones: Resolucion[] = [
  // ---------------------------------------------------------------------
  // Corte Suprema de Justicia del Perú
  // ---------------------------------------------------------------------
  {
    id: "rn-845-2025",
    tipo: "Recurso de Nulidad",
    institucion: "Corte Suprema",
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
    fundamentos: [
      {
        referencia: "Fundamento 2.9",
        tema: "La conversión de pena es subsidiaria",
        texto:
          "En ese sentido, la conversión de pena responde a un esquema subsidiario, dado que procede en los casos donde no resulta procedente la condena condicional o la reserva del fallo condenatorio.",
        verificado: true,
      },
      {
        referencia: "Fundamento 2.8",
        tema: "Requisitos para que proceda la conversión",
        texto:
          "De conformidad con lo establecido en el artículo 52 del CP, para que proceda la conversión de la pena se requiere: (i) Que la pena impuesta en la sentencia no sea superior a 2 o 5 años de privación de libertad; y, (ii) como requisito especial, que en el caso concreto no sea posible aplicar la condena condicional o la reserva del fallo condenatorio. Dicho criterio constituye doctrina jurisprudencial vinculante.",
        verificado: true,
      },
    ],
  },
  {
    id: "rn-690-2025",
    tipo: "Recurso de Nulidad",
    institucion: "Corte Suprema",
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
    fundamentos: [
      {
        referencia: "Fundamento 8.12",
        tema: "La pericia de absorción atómica es indicativa, no declarativa",
        texto:
          "[E]s necesario precisar que la prueba de absorción atómica no es \u201cdeclarativa\u201d sino \u201cindicativa\u201d (ver Apelación 374-2024/Cajamarca, fundamento 6.23). La presencia de estos metales en la mano de una víctima puede obedecer a tres escenarios: i) que haya disparado, ii) que haya intentado cubrirse frente al disparo (defensa) o iii) que se haya encontrado en un radio de acción cercano (zona de contaminación) al momento de la deflagración del arma accionada por un tercero.",
        verificado: true,
      },
    ],
  },
  {
    id: "cas-2308-2022",
    tipo: "Casacion",
    institucion: "Corte Suprema",
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
    fundamentos: [
      {
        referencia: "Sumilla, numeral I",
        tema: "Cuándo hay defensa pública ineficaz",
        texto:
          "Para configurar una afectación del derecho de defensa y, en estricto, para que se materialice una defensa ineficaz por parte de la defensa pública, no basta meramente que no se haya propuesto prueba de descargo alguno a favor de la procesada, sino que, para la materialización de una vulneración de ese nivel, se debe mirar u observar integralmente la actuación del letrado a lo largo de todo el curso procesal, en particular en el plenario de juzgamiento.",
        verificado: true,
      },
      {
        referencia: "Fundamento vigesimoprimero",
        tema: "La inocencia no requiere probanza",
        texto:
          "Hemos de estar atentos a que el imputado de un delito no está en la obligación de presentar prueba alguna, porque la inocencia no tiene que acreditarse, se presume en un Estado constitucional de derecho; a menos que, en uso de su derecho de tutela jurisdiccional efectiva, en su dimensión del derecho al contradictorio, postule una tesis de alegación, por supuesto, en línea con la inocencia constitucional.",
        verificado: true,
      },
    ],
  },
  {
    id: "cas-1885-2023",
    tipo: "Casacion",
    institucion: "Corte Suprema",
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
    fundamentos: [
      {
        referencia: "Fundamento 3.3",
        tema: "El doble conforme impide la casación",
        texto:
          "[L]a decisión desestimatoria de la excepción deducida fue confirmada por el auto de vista que es objeto del recurso de casación; por lo tanto, bajo el principio del doble conforme, nos encontramos ante una causal de inadmisibilidad liminar prescrita en el literal d) del numeral 1 del artículo 428 del CPP, por lo que el recurso resulta desestimable.",
        verificado: true,
      },
    ],
  },
  {
    id: "rn-977-2025",
    tipo: "Recurso de Nulidad",
    institucion: "Corte Suprema",
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
    fundamentos: [
      {
        referencia: "Fundamento 10",
        tema: "Motivación cualificada del pronóstico de conducta futura",
        texto:
          "El citado dispositivo exige una motivación cualificada, respecto al pronóstico favorable de la conducta futura del sentenciado, que deberá ser consecuencia del análisis de la naturaleza y modalidad del hecho punible, así como del comportamiento procesal y la personalidad del agente, todo lo cual deberá llevar a inferir al juzgador que el condenado no volverá a cometer un nuevo delito.",
        verificado: true,
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Corte Interamericana de Derechos Humanos - casos peruanos
  // ---------------------------------------------------------------------
  {
    id: "cidh-neira-alegria-1995",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Neira Alegría y otros Vs. Perú (Serie C N.° 20)",
    titulo:
      "El Frontón: uso desproporcionado de la fuerza en un penal y suspensión indebida del hábeas corpus",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "1995-01-19",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró al Perú responsable por la muerte de Víctor Neira Alegría, Edgar Zenteno Escobar y William Zenteno Escobar durante el operativo militar de debelación del motín en el penal El Frontón (1986). Estableció que el Estado violó el derecho a la vida en relación con la obligación general de respetar los derechos, y que el hábeas corpus no podía considerarse suspendido durante el estado de emergencia, por tratarse de una garantía judicial indispensable.",
    articulosAplicados: [
      "Art. 4 - Convención Americana sobre Derechos Humanos (Derecho a la vida)",
      "Art. 7.6 - CADH (Hábeas corpus)",
      "Art. 27.2 - CADH (Garantías no suspendibles)",
      "Art. 1.1 - CADH (Obligación de respetar los derechos)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_20_esp.pdf",
    fundamentos: [
      {
        referencia: "P\u00e1rr. 82 (cita la OC-8/87)",
        tema: "El h\u00e1beas corpus no se suspende en estado de emergencia",
        texto:
          "[L]os procedimientos de h\u00e1beas corpus y de amparo son de aquellas garant\u00edas judiciales indispensables para la protecci\u00f3n de varios derechos cuya suspensi\u00f3n est\u00e1 vedada por el art\u00edculo 27.2 y sirven, adem\u00e1s, para preservar la legalidad de una sociedad democr\u00e1tica.",
        verificado: true,
      },
    ],
  },
  {
    id: "cidh-loayza-tamayo-1997",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Loayza Tamayo Vs. Perú (Serie C N.° 33)",
    titulo:
      "Juzgamiento por tribunales militares bajo la legislación antiterrorista y ne bis in idem",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "1997-09-17",
    citas: 0,
    resumenRatioDecidendi:
      "El caso se originó en la detención de María Elena Loayza Tamayo, profesora universitaria arrestada por la DINCOTE en febrero de 1993 y procesada bajo la legislación antiterrorista. La Corte declaró la responsabilidad internacional del Estado por las violaciones a su integridad y libertad personales y a las garantías judiciales, derivadas del juzgamiento por tribunales militares y del nuevo procesamiento en el fuero común por los mismos hechos.",
    articulosAplicados: [
      "Art. 5 - CADH (Integridad personal)",
      "Art. 7 - CADH (Libertad personal)",
      "Art. 8 - CADH (Garantías judiciales)",
      "Art. 8.4 - CADH (Ne bis in idem)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_33_esp.pdf",
  },
  {
    id: "cidh-castillo-petruzzi-1999",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Castillo Petruzzi y otros Vs. Perú (Serie C N.° 52)",
    titulo:
      "Civiles juzgados por tribunales militares sin rostro: debido proceso y derecho de defensa",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "1999-05-30",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte examinó el procesamiento de civiles por el delito de traición a la patria ante tribunales militares integrados por jueces sin rostro, bajo la legislación antiterrorista peruana. Declaró la responsabilidad del Estado por la vulneración de las garantías judiciales, en particular el derecho a ser juzgado por un juez competente, independiente e imparcial y el derecho de defensa, y dispuso que se garantizara un nuevo juzgamiento con plenas garantías.",
    articulosAplicados: [
      "Art. 8 - CADH (Garantías judiciales)",
      "Art. 8.2.d y 8.2.e - CADH (Derecho de defensa)",
      "Art. 25 - CADH (Protección judicial)",
      "Art. 2 - CADH (Deber de adoptar disposiciones de derecho interno)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/tablas/fichas/castillopetruzzi.pdf",
  },
  {
    id: "cidh-durand-ugarte-2000",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Durand y Ugarte Vs. Perú (Serie C N.° 68)",
    titulo:
      "El Frontón: la jurisdicción militar no puede conocer violaciones de derechos humanos",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2000-08-16",
    citas: 0,
    resumenRatioDecidendi:
      "A partir del mismo operativo militar en el penal El Frontón, la Corte estableció que la jurisdicción penal militar tiene carácter restrictivo y excepcional, y que está reservada a la protección de bienes jurídicos propios de la función militar. El juzgamiento de agentes estatales por hechos que constituyen violaciones de derechos humanos corresponde a la justicia ordinaria, de modo que someterlos al fuero militar vulnera el derecho a un juez competente y la protección judicial de las víctimas.",
    articulosAplicados: [
      "Art. 4 - CADH (Derecho a la vida)",
      "Art. 8.1 - CADH (Juez competente, independiente e imparcial)",
      "Art. 25 - CADH (Protección judicial)",
      "Art. 1.1 - CADH (Obligación de respetar los derechos)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/Seriec_68_esp.pdf",
    fundamentos: [
      {
        referencia: "P\u00e1rr. 117",
        tema: "La jurisdicci\u00f3n penal militar es restrictiva y excepcional",
        texto:
          "En un Estado democr\u00e1tico de Derecho la jurisdicci\u00f3n penal militar ha de tener un alcance restrictivo y excepcional y estar encaminada a la protecci\u00f3n de intereses jur\u00eddicos especiales, vinculados con las funciones que la ley asigna a las fuerzas militares. As\u00ed, debe estar excluido del \u00e1mbito de la jurisdicci\u00f3n militar el juzgamiento de civiles y s\u00f3lo debe juzgar a militares por la comisi\u00f3n de delitos o faltas que por su propia naturaleza atenten contra bienes jur\u00eddicos propios del orden militar.",
        verificado: true,
      },
      {
        referencia: "P\u00e1rr. 118",
        tema: "El Front\u00f3n: fueron delitos comunes, no militares",
        texto:
          "En el presente caso, los militares encargados de la debelaci\u00f3n del mot\u00edn ocurrido en el penal El Front\u00f3n hicieron un uso desproporcionado de la fuerza que excedi\u00f3 en mucho los l\u00edmites de su funci\u00f3n, lo que provoc\u00f3 la muerte de un gran n\u00famero de reclusos. Por lo tanto, los actos que llevaron a este desenlace no pueden ser considerados delitos militares, sino delitos comunes, por lo que la investigaci\u00f3n y sanci\u00f3n de los mismos debi\u00f3 haber reca\u00eddo en la justicia ordinaria.",
        verificado: true,
      },
    ],
  },
  {
    id: "cidh-cantoral-benavides-2000",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Cantoral Benavides Vs. Perú (Serie C N.° 69)",
    titulo:
      "Tortura durante la detención y presunción de inocencia en procesos por terrorismo",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2000-08-18",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró la responsabilidad del Estado por los tratos crueles, inhumanos y degradantes y los actos de tortura sufridos por Luis Alberto Cantoral Benavides durante su detención, así como por las violaciones al debido proceso en su juzgamiento bajo la legislación antiterrorista. Reafirmó que la presunción de inocencia exige que nadie sea condenado mientras no exista prueba plena de responsabilidad, y que la exhibición pública del detenido como culpable la vulnera.",
    articulosAplicados: [
      "Art. 5 - CADH (Integridad personal, prohibición de la tortura)",
      "Art. 8.2 - CADH (Presunción de inocencia)",
      "Art. 7 - CADH (Libertad personal)",
      "Art. 25 - CADH (Protección judicial)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_69_esp.pdf",
  },
  {
    id: "cidh-barrios-altos-2001",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Barrios Altos Vs. Perú (Serie C N.° 75)",
    titulo:
      "Las leyes de amnistía carecen de efectos jurídicos frente a graves violaciones de derechos humanos",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2001-03-14",
    citas: 0,
    resumenRatioDecidendi:
      "Tras el reconocimiento de responsabilidad del Estado por la muerte de quince personas y las lesiones graves de otras cuatro en el vecindario de Barrios Altos (Lima, noviembre de 1991), la Corte estableció que son inadmisibles las disposiciones de amnistía, las de prescripción y el establecimiento de excluyentes de responsabilidad que pretendan impedir la investigación y sanción de los responsables de graves violaciones de derechos humanos. Declaró que las leyes de amnistía peruanas carecían de efectos jurídicos.",
    articulosAplicados: [
      "Art. 1.1 y 2 - CADH (Obligación de respetar y adecuar el derecho interno)",
      "Art. 4 - CADH (Derecho a la vida)",
      "Art. 8 y 25 - CADH (Garantías judiciales y protección judicial)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/Seriec_75_esp.pdf",
    fundamentos: [
      {
        referencia: "P\u00e1rr. 41",
        tema: "Inadmisibilidad de amnist\u00eda y prescripci\u00f3n",
        texto:
          "Esta Corte considera que son inadmisibles las disposiciones de amnist\u00eda, las disposiciones de prescripci\u00f3n y el establecimiento de excluyentes de responsabilidad que pretendan impedir la investigaci\u00f3n y sanci\u00f3n de los responsables de las violaciones graves de los derechos humanos tales como la tortura, las ejecuciones sumarias, extralegales o arbitrarias y las desapariciones forzadas, todas ellas prohibidas por contravenir derechos inderogables reconocidos por el Derecho Internacional de los Derechos Humanos.",
        verificado: true,
      },
    ],
  },
  {
    id: "cidh-la-cantuta-2006",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso La Cantuta Vs. Perú (Serie C N.° 162)",
    titulo:
      "Desaparición forzada y ejecución extrajudicial: deber de investigar pese a la amnistía",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2006-11-29",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró al Perú responsable por la detención arbitraria, desaparición forzada y ejecución extrajudicial de un profesor y nueve estudiantes de la Universidad Nacional de Educación Enrique Guzmán y Valle, ocurridas en julio de 1992. Reiteró la doctrina de Barrios Altos sobre la ineficacia de las leyes de amnistía y precisó el alcance del deber estatal de investigar, juzgar y, en su caso, sancionar a los responsables de graves violaciones de derechos humanos.",
    articulosAplicados: [
      "Art. 3, 4, 5 y 7 - CADH (Personalidad jurídica, vida, integridad y libertad personales)",
      "Art. 8 y 25 - CADH (Garantías judiciales y protección judicial)",
      "Art. 1.1 y 2 - CADH (Obligaciones generales)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_162_esp.pdf",
  },
  {
    id: "cidh-anzualdo-castro-2009",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Anzualdo Castro Vs. Perú (Serie C N.° 202)",
    titulo:
      "Desaparición forzada como violación continuada y deber de tipificarla adecuadamente",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2009-09-22",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró la responsabilidad del Estado por la desaparición forzada de Kenneth Ney Anzualdo Castro, estudiante detenido en 1993. Reafirmó el carácter pluriofensivo y continuado o permanente de la desaparición forzada, cuya consumación se prolonga mientras no se determine el paradero de la víctima, con las consecuencias que ello tiene sobre la investigación y sobre el cómputo de los plazos, y ordenó al Estado adecuar su tipificación interna del delito.",
    articulosAplicados: [
      "Art. 3, 4, 5 y 7 - CADH (Personalidad jurídica, vida, integridad y libertad personales)",
      "Art. 25 - CADH (Protección judicial)",
      "Art. 1.1 y 2 - CADH (Obligaciones generales)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_202_esp.pdf",
  },
  {
    id: "cidh-j-vs-peru-2013",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso J. Vs. Perú (Serie C N.° 275)",
    titulo:
      "Detención y proceso bajo la legislación antiterrorista: garantías del debido proceso",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2013-11-27",
    citas: 0,
    resumenRatioDecidendi:
      "El caso versa sobre la detención, el enjuiciamiento y el posterior pedido de extradición de la señora J. por presuntos delitos de apología y terrorismo. La Corte declaró vulnerados su derecho a la integridad personal y las garantías del debido proceso durante la detención inicial y el procesamiento bajo la legislación antiterrorista de los años noventa. La identidad de la víctima se mantuvo en reserva por decisión del Tribunal.",
    articulosAplicados: [
      "Art. 5 - CADH (Integridad personal)",
      "Art. 7 - CADH (Libertad personal)",
      "Art. 8 - CADH (Garantías judiciales)",
      "Art. 11 - CADH (Protección de la honra y de la dignidad)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/tablas/fichas/jvsperu.pdf",
  },
  {
    id: "cidh-espinoza-gonzales-2014",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Espinoza Gonzáles Vs. Perú (Serie C N.° 289)",
    titulo:
      "Violencia sexual contra mujeres detenidas y deber de investigarla de oficio",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2014-11-20",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró al Estado responsable por la detención arbitraria, la tortura y la violencia sexual sufridas por Gladys Carol Espinoza Gonzáles tras su detención en 1993, en el marco de la aplicación de la legislación antiterrorista. Estableció que, frente a indicios de violencia sexual en custodia estatal, el deber de investigar se activa de oficio, sin que la víctima deba impulsarlo, y que los estereotipos de género en la valoración de la prueba constituyen una forma de discriminación.",
    articulosAplicados: [
      "Art. 5 - CADH (Integridad personal, prohibición de la tortura)",
      "Art. 7 - CADH (Libertad personal)",
      "Art. 8 y 25 - CADH (Garantías judiciales y protección judicial)",
      "Art. 7.b - Convención de Belém do Pará",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_289_esp.pdf",
  },
  {
    id: "cidh-cruz-sanchez-2015",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Cruz Sánchez y otros Vs. Perú (Serie C N.° 292)",
    titulo:
      "Chavín de Huántar: límites al uso de la fuerza letal y competencia del fuero común",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2015-04-17",
    citas: 0,
    resumenRatioDecidendi:
      "A propósito de la operación de rescate de rehenes Chavín de Huántar (1997), la Corte analizó la privación de la vida de Eduardo Nicolás Cruz Sánchez. Precisó los límites del uso de la fuerza letal por agentes estatales, que debe ser absolutamente necesaria y proporcional, y reiteró que la investigación de presuntas ejecuciones extrajudiciales atribuidas a militares corresponde a la justicia ordinaria y no al fuero militar.",
    articulosAplicados: [
      "Art. 4 - CADH (Derecho a la vida)",
      "Art. 8.1 - CADH (Juez competente)",
      "Art. 25 - CADH (Protección judicial)",
      "Art. 1.1 - CADH (Obligación de respetar los derechos)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_292_esp.pdf",
    fundamentos: [
      {
        referencia: "P\u00e1rr. 263",
        tema: "La fuerza letal solo cuando sea absolutamente necesaria",
        texto:
          "[L]a Corte ha sostenido que el uso excepcional de la fuerza letal deber\u00e1 estar formulado por ley, y ser interpretado restrictivamente de manera que sea minimizado en toda circunstancia, no siendo m\u00e1s que el \u201cabsolutamente necesario\u201d en relaci\u00f3n con la fuerza o amenaza que se pretende repeler.",
        verificado: true,
      },
    ],
  },
  {
    id: "cidh-quispialaya-2015",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Quispialaya Vilcapoma Vs. Perú (Serie C N.° 308)",
    titulo:
      "Tortura en el servicio militar: la investigación corresponde a la justicia ordinaria",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2015-11-23",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró la responsabilidad del Estado por los actos de tortura sufridos por Valdemir Quispialaya Vilcapoma a manos de un superior durante su servicio militar, y por la falta de una investigación diligente de los hechos. Reiteró que los casos de violaciones de derechos humanos cometidos por militares contra sus subordinados no pueden ser conocidos por el fuero militar, sino por la jurisdicción ordinaria.",
    articulosAplicados: [
      "Art. 5 - CADH (Integridad personal, prohibición de la tortura)",
      "Art. 8 y 25 - CADH (Garantías judiciales y protección judicial)",
      "Arts. 1, 6 y 8 - Convención Interamericana para Prevenir y Sancionar la Tortura",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_308_esp.pdf",
  },
  {
    id: "cidh-zegarra-marin-2017",
    tipo: "Sentencia CIDH",
    institucion: "Corte IDH",
    numero: "Caso Zegarra Marín Vs. Perú (Serie C N.° 331)",
    titulo:
      "Presunción de inocencia: la condena no puede invertir la carga de la prueba ni carecer de motivación",
    sala: "Corte Interamericana de Derechos Humanos",
    fecha: "2017-02-15",
    citas: 0,
    resumenRatioDecidendi:
      "La Corte declaró al Perú responsable por violar la presunción de inocencia y el deber de motivación de las resoluciones judiciales en la condena dictada contra Agustín Bladimiro Zegarra Marín. La sentencia interna invirtió la carga de la prueba al sustentarse en que no habían surgido pruebas de descargo concluyentes. La Corte precisó que la condena debe exponer de forma clara, completa y lógica las razones por las que la prueba resulta o no fiable, y basarse en prueba de cargo suficiente.",
    articulosAplicados: [
      "Art. 8.1 - CADH (Deber de motivación)",
      "Art. 8.2 - CADH (Presunción de inocencia)",
      "Art. 25 - CADH (Protección judicial)",
      "Art. 1.1 - CADH (Obligación de respetar los derechos)",
    ],
    pdfUrl: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_331_esp.pdf",
    fundamentos: [
      {
        referencia: "P\u00e1rr. 138",
        tema: "La carga de la prueba recae en quien acusa",
        texto:
          "[E]l Tribunal reitera que \u201cla demostraci\u00f3n fehaciente de la culpabilidad constituye un requisito indispensable para la sanci\u00f3n penal, de modo que la carga de la prueba recae en la parte acusadora y no en el acusado\u201d. En este sentido, \u201cel acusado no debe demostrar que no ha cometido el delito que se le atribuye, ya que el onus probandi corresponde a quien acusa\u201d y cualquier duda debe ser usada en beneficio del acusado.",
        verificado: true,
      },
    ],
  },
];

/**
 * Enlaces del grafo. Cada uno existe por una de dos razones verificables:
 * los dos casos comparten el mismo hecho o proceso, o resuelven la misma
 * cuestión sustantiva. `motivo` deja esa razón a la vista: si un enlace no
 * se puede explicar en una línea, no se dibuja.
 */
const enlaces: GraphLink[] = [
  {
    source: "rn-845-2025",
    target: "rn-977-2025",
    motivo:
      "Ambas resuelven sobre alternativas a la pena efectiva (conversión y suspensión de la ejecución de la pena) tras las reformas de deshacinamiento penitenciario.",
  },
  {
    source: "cidh-neira-alegria-1995",
    target: "cidh-durand-ugarte-2000",
    motivo:
      "Los dos casos derivan del mismo operativo militar de debelación del motín en el penal El Frontón (1986).",
  },
  {
    source: "cidh-durand-ugarte-2000",
    target: "cidh-cruz-sanchez-2015",
    motivo:
      "Uso de la fuerza letal por agentes del Estado en operativos y su juzgamiento en la justicia ordinaria, no en el fuero militar.",
  },
  {
    source: "cidh-durand-ugarte-2000",
    target: "cidh-quispialaya-2015",
    motivo:
      "Carácter restrictivo y excepcional de la jurisdicción penal militar frente a violaciones de derechos humanos.",
  },
  {
    source: "cidh-loayza-tamayo-1997",
    target: "cidh-castillo-petruzzi-1999",
    motivo:
      "Juzgamiento de civiles por tribunales militares bajo la legislación antiterrorista de los años noventa.",
  },
  {
    source: "cidh-loayza-tamayo-1997",
    target: "cidh-cantoral-benavides-2000",
    motivo:
      "Detención por la DINCOTE, malos tratos y debido proceso en la aplicación de la legislación antiterrorista.",
  },
  {
    source: "cidh-castillo-petruzzi-1999",
    target: "cidh-cantoral-benavides-2000",
    motivo:
      "Garantías judiciales y derecho de defensa en procesos seguidos ante tribunales militares por terrorismo y traición a la patria.",
  },
  {
    source: "cidh-j-vs-peru-2013",
    target: "cidh-loayza-tamayo-1997",
    motivo:
      "Detención y procesamiento de civiles bajo la legislación antiterrorista y las garantías del debido proceso.",
  },
  {
    source: "cidh-j-vs-peru-2013",
    target: "cidh-espinoza-gonzales-2014",
    motivo:
      "Mujeres detenidas bajo la legislación antiterrorista y protección de su integridad personal durante la custodia estatal.",
  },
  {
    source: "cidh-espinoza-gonzales-2014",
    target: "cidh-cantoral-benavides-2000",
    motivo:
      "Tortura y tratos crueles durante la detención, y deber estatal de investigarlos.",
  },
  {
    source: "cidh-espinoza-gonzales-2014",
    target: "cidh-quispialaya-2015",
    motivo:
      "Prohibición de la tortura y estándares de investigación conforme a la Convención Interamericana para Prevenir y Sancionar la Tortura.",
  },
  {
    source: "cidh-barrios-altos-2001",
    target: "cidh-la-cantuta-2006",
    motivo:
      "Misma doctrina sobre la ineficacia de las leyes de amnistía; la Corte IDH supervisa el cumplimiento de ambas sentencias de forma conjunta.",
  },
  {
    source: "cidh-barrios-altos-2001",
    target: "cidh-anzualdo-castro-2009",
    motivo:
      "Deber de investigar y sancionar graves violaciones de derechos humanos, sin que operen la amnistía ni la prescripción.",
  },
  {
    source: "cidh-la-cantuta-2006",
    target: "cidh-anzualdo-castro-2009",
    motivo:
      "Desaparición forzada como violación continuada y deber del Estado de tipificarla e investigarla adecuadamente.",
  },
  {
    source: "cidh-zegarra-marin-2017",
    target: "cidh-cantoral-benavides-2000",
    motivo:
      "Presunción de inocencia y exigencia de prueba de cargo suficiente para condenar.",
  },
  {
    source: "cidh-zegarra-marin-2017",
    target: "rn-690-2025",
    motivo:
      "Deber de motivación de la sentencia condenatoria y valoración razonada de la prueba de cargo (art. 139.5 de la Constitución / art. 8.1 CADH).",
  },
  {
    source: "cidh-zegarra-marin-2017",
    target: "rn-977-2025",
    motivo:
      "Motivación insuficiente de la decisión penal: la Corte Suprema anuló la prognosis de pena por falta de sustento, con el mismo estándar de motivación.",
  },
  {
    source: "cidh-castillo-petruzzi-1999",
    target: "cas-2308-2022",
    motivo:
      "Contenido del derecho de defensa efectiva en el proceso penal (art. 8.2 CADH / art. 139.14 de la Constitución).",
  },
  {
    source: "cidh-neira-alegria-1995",
    target: "cidh-la-cantuta-2006",
    motivo:
      "Garantía del hábeas corpus y protección judicial frente a privaciones de libertad por agentes del Estado.",
  },
];

/** Grado de cada nodo: cuántos enlaces verificados tiene. */
const grado = (id: string) =>
  enlaces.filter((l) => l.source === id || l.target === id).length;

/**
 * Paleta del grafo: los nodos se leen como puntos blancos/grises, con el
 * verde reservado a la jurisdicción supranacional para que destaque sin
 * saturar la vista.
 */
const colorPorInstitucion = (inst: Resolucion["institucion"]) => {
  switch (inst) {
    case "Corte IDH":
      return "#8bc34a";
    case "Tribunal Constitucional":
      return "#d8d8dc";
    case "Corte Suprema":
      return "#e8e8ec";
  }
};

const nodes: GraphNode[] = resoluciones.map((r) => ({
  ...r,
  color: colorPorInstitucion(r.institucion),
  // El tamaño refleja cuán conectada está la resolución dentro del grafo.
  val: 1 + grado(r.id) * 1.15,
}));

export const graphData: GraphData = { nodes, links: enlaces };
