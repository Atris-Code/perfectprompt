import type { CoPreset } from '../types';

export const CO_PRESETS: CoPreset[] = [
  {
    name: 'Arranque en Frío Seguro',
    initialTemp: 200,
    targetTemp: 500,
    residenceTime: 0, // No feed during heat up
    flowN2: 50,
    agentMode: 'Solo Monitoreo',
    cinematicDescription: 'Calentamiento lento y metódico. Tensión ascendente.',
  },
  {
    name: 'Furia de Pirólisis Rápida',
    targetTemp: 500,
    residenceTime: 1.5,
    flowN2: 40,
    agentMode: 'Auto-Optimización (IA)',
    cinematicDescription: 'El clímax del proceso. Alta energía, máxima acción.',
  },
  {
    name: 'Modo de Carbonización Gaia',
    targetTemp: 450,
    residenceTime: 1800, // 30 minutos
    flowN2: 20,
    agentMode: 'Automático (PID)',
    cinematicDescription: 'Producción optimizada de biochar de alta calidad, transformando residuos en oro negro para la bioeconomía circular.',
  },
  {
    name: 'Cocción Lenta de Biochar',
    targetTemp: 400,
    residenceTime: 30,
    flowN2: 20,
    agentMode: 'Automático (PID)',
    cinematicDescription: 'Una escena lenta y deliberada. Enfocada en la calidad del sólido.',
  },
  {
    name: 'Operación Estándar PID',
    targetTemp: 400,
    residenceTime: 600,
    flowN2: 25,
    agentMode: 'Automático (PID)',
    cinematicDescription: 'Operación estable y controlada bajo PID. Enfoque en la consistencia del proceso.',
  },
  {
    name: 'Modo Reposo Eficiente',
    targetTemp: 150,
    residenceTime: 0, // No feed
    flowN2: 5,
    agentMode: 'Solo Monitoreo',
    cinematicDescription: 'El reactor duerme, pero está alerta. Bajo consumo.',
  },
  {
    name: 'Pirólisis Rápida (Bio-aceite)',
    targetTemp: 500,
    residenceTime: 1.5,
    flowN2: 45,
    agentMode: 'Auto-Optimización (IA)',
    cinematicDescription: 'Proceso de alta intensidad para maximizar el rendimiento de bio-aceite. Requiere control preciso.',
  },
  {
    name: "Pirólisis de GCR para Syngas",
    targetTemp: 850,
    residenceTime: 120,
    flowN2: 40,
    agentMode: "Auto-Optimización (IA)",
    cinematicDescription: "Proceso de alta temperatura para craquear GCR en gas de síntesis de alto poder calorífico. Energía pura."
  },
  {
    name: 'Caos y Desorden en Sala de Control',
    targetTemp: 850,
    residenceTime: 0.5,
    flowN2: 80,
    agentMode: 'Solo Monitoreo',
    cinematicDescription: 'Alerta máxima. Fluctuaciones extremas en todos los sistemas. Riesgo de sobrepresión inminente.',
  },
  {
    name: 'Simulación de Entrenamiento (Director)',
    targetTemp: 650,
    residenceTime: 2.0,
    flowN2: 60,
    agentMode: 'Solo Monitoreo',
    cinematicDescription: 'Escenario de entrenamiento de alta intensidad. Fluctuaciones inesperadas del sistema para probar la respuesta del operador.',
  },
];