export interface SkillModulePreset {
  name: string;
  instruction: string;
}

export const SKILL_MODULE_PRESETS: Record<string, SkillModulePreset[]> = {
  "Dr. Pirolis": [
    {
      name: "Analizar Composición Química de Residuo",
      instruction: "Consulta al Asistente de Química Ambiental. Dada la descripción del residuo [parámetro: descripción del residuo], analiza su composición química probable, identifica componentes peligrosos y sugiere posibles vías de valorización termoquímica."
    },
    {
      name: "Calcular Balance Entálpico de Reacción",
      instruction: "Consulta al Asistente de Termoquímica y Equilibrio. Calcula el cambio de entalpía $(\\Delta H)$ para la reacción [parámetro: ecuación química] bajo las condiciones [parámetro: temperatura y presión]."
    },
    {
      name: "Estimar Rendimiento de Combustión WtE",
      instruction: "Consulta al Asistente de Combustión WtE. Basado en la composición del residuo [parámetro: composición %], estima el poder calorífico inferior (PCI), la eficiencia de combustión esperada en una caldera moderna y la cantidad de cenizas generadas por tonelada."
    }
  ],
  "Hefesto, el Maestro Forjador": [
    {
      name: "Realizar Balance Rápido de Masa/Energía",
      instruction: "Utiliza al Asistente de Transferencia de Masa y Energía. Para la unidad de proceso [parámetro: nombre unidad] con flujos de entrada [parámetro: flujos entrada], calcula los flujos de salida estimados y el consumo/generación neta de energía."
    },
    {
      name: "Evaluar Eficiencia de Recolección de Residuos",
      instruction: "Consulta al Asistente de Gestión de Residuos Sólidos. Analiza los datos de recolección [parámetro: datos de rutas/tonelajes] y evalúa la eficiencia de las operaciones actuales, sugiriendo puntos de mejora."
    },
    {
      name: "Sugerir Tecnología de Control de Emisiones",
      instruction: "Consulta al Asistente de Control de Fuentes Estacionarias. Para una fuente que emite [parámetro: contaminante] a [parámetro: concentración/flujo], sugiere la tecnología de control (BAT - Best Available Technology) más adecuada y su eficiencia esperada."
    }
  ],
  "Helena, la Estratega": [
    {
      name: "Análisis Preliminar Viabilidad MRF",
      instruction: "Consulta al Asistente de Economía de Recuperación. Dada la capacidad [parámetro: ton/año] y tipos de materiales [parámetro: lista materiales] de una MRF propuesta, realiza un análisis preliminar de viabilidad económica considerando costos típicos y precios de mercado para reciclados."
    },
    {
      name: "Esbozar Matriz de Riesgo Ambiental",
      instruction: "Utiliza al Asistente de Evaluación de Riesgos. Para el proyecto [parámetro: descripción proyecto], identifica 3-5 peligros ambientales clave, estima su probabilidad e impacto potencial (cualitativo) y plásmalo en una matriz de riesgo básica."
    },
    {
      name: "Proyectar Demanda Energética Futura",
      instruction: "Consulta al Asistente de Proyecciones Demográficas. Para la región [parámetro: nombre región] con tasa de crecimiento [parámetro: % anual], proyecta la demanda energética residencial estimada para los próximos [parámetro: número años], asumiendo un consumo per cápita constante."
    }
  ],
  "Marco, el Narrador": [
    {
      name: "Redactar Comunicado de Riesgo (Borrador)",
      instruction: "Consulta al Asistente de Comunicación de Riesgos. Toma el siguiente análisis técnico [parámetro: texto análisis riesgo] y redacta un borrador de comunicado claro y conciso para la audiencia [parámetro: tipo audiencia], explicando el riesgo y las medidas de mitigación."
    },
    {
      name: "Crear Explicación Sencilla de Concepto Climático",
      instruction: "Pide al Asistente de Divulgación Climática que explique el concepto '[parámetro: concepto climático, ej: Potencial de Calentamiento Global]' en un lenguaje accesible para el público general, usando analogías si es posible."
    }
  ],
  "Janus, el Conciliador": [
    {
      name: "Verificar Cumplimiento Preliminar Agua Potable",
      instruction: "Consulta al Asistente de Cumplimiento Normativo (Agua). Compara los siguientes parámetros de calidad del agua [parámetro: lista de parámetros y valores] con los límites máximos permitidos por la SDWA (o normativa equivalente especificada) e indica posibles incumplimientos."
    },
    {
      name: "Evaluar Cumplimiento Preliminar Emisiones Atmosféricas",
      instruction: "Consulta al Asistente de Cumplimiento Normativo (Aire). Dada la emisión de [parámetro: contaminante] a [parámetro: concentración/tasa] desde [parámetro: tipo de fuente], evalúa preliminarmente si cumple con los estándares de la Clean Air Act (o normativa equivalente especificada)."
    }
  ],
  "Prometeo, el Creador": [
    {
      name: "Idear Soluciones de Remediación No Convencionales",
      instruction: "Consulta al Asistente de Tecnologías de Remediación. Para la contaminación por [parámetro: contaminante] en [parámetro: medio ambiente], genera 3 ideas conceptuales de remediación que sean innovadoras o combinen tecnologías existentes de forma novedosa."
    },
    {
      name: "Brainstorming de Valorización para Residuo Complejo",
      instruction: "Pide al Asistente de Innovación en Reciclaje que genere un listado de 5 posibles vías de valorización (material o energética, convencionales o disruptivas) para el residuo [parámetro: descripción residuo complejo]."
    },
    {
      name: "Explorar Aplicaciones Disruptivas de Principio Energético",
      instruction: "Consulta al Asistente de Conceptos Energéticos Fundamentales. Tomando el principio de [parámetro: ej. Efecto Termoeléctrico], propone 3 aplicaciones radicalmente nuevas o en sectores inesperados."
    }
  ],
};
