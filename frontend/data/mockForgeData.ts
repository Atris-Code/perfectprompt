import type { CoPreset } from '../types';

// 🔧 MOCK DATA para Innovation Forge (workaround temporal)
export const MOCK_CO_PRESETS: CoPreset[] = [
    {
        name: 'Pirólisis Rápida (Bio-aceite)',
        targetTemp: 500,
        residenceTime: 1.5,
        flowN2: 45,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Proceso de alta intensidad para maximizar el rendimiento de bio-aceite.'
    },
    {
        name: 'Modo de Carbonización Gaia',
        targetTemp: 450,
        residenceTime: 1800,
        flowN2: 20,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Producción optimizada de biochar de alta calidad.'
    },
    {
        name: 'Cocción Lenta de Biochar',
        targetTemp: 400,
        residenceTime: 30,
        flowN2: 20,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Una escena lenta y deliberada. Enfocada en la calidad del sólido.'
    },
    {
        name: 'Gas-Synth Optimizado',
        targetTemp: 700,
        residenceTime: 3,
        flowN2: 60,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Proceso de alta temperatura para maximizar volúmenes de syngas.'
    },
    {
        name: 'Torrefacción Leve',
        targetTemp: 280,
        residenceTime: 1800,
        flowN2: 15,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Tratamiento térmico suave para mejorar propiedades de la biomasa.'
    },
    {
        name: 'Pirólisis Flash',
        targetTemp: 650,
        residenceTime: 0.5,
        flowN2: 80,
        agentMode: 'Auto-Optimización (IA)',
        cinematicDescription: 'Conversión ultra-rápida con residencia mínima.'
    },
    {
        name: 'Carbonización Intermedia',
        targetTemp: 475,
        residenceTime: 15,
        flowN2: 30,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Punto medio optimizado para productos duales.'
    },
    {
        name: 'Alta Pureza Biochar',
        targetTemp: 550,
        residenceTime: 3600,
        flowN2: 10,
        agentMode: 'Automático (PID)',
        cinematicDescription: 'Proceso prolongado para biochar de pureza excepcional.'
    },
    {
        name: 'Modo Experimental',
        targetTemp: 425,
        residenceTime: 10,
        flowN2: 25,
        agentMode: 'Manual',
        cinematicDescription: 'Configuración base para experimentación personalizada.'
    }
];

export const MOCK_REACTORS = [
    { id: 'R-001', status: 'off' },
    { id: 'R-002', status: 'off' },
    { id: 'R-003', status: 'off' },
    { id: 'R-004', status: 'off' },
    { id: 'R-005', status: 'off' },
    { id: 'R-006', status: 'off' },
] as any;

console.log('📦 Mock data module loaded:', {
    presetsCount: MOCK_CO_PRESETS.length, // Should be 9
    reactorsCount: MOCK_REACTORS.length
});
