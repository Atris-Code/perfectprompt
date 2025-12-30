import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from '../data/pyrolysisMaterials';
// FIX: Corrected import path for types to ensure consistent module resolution.
import type { PyrolysisMaterial, BiomassPyrolysisMode, Catalyst, HeatSource, SimulationKPIs, SolidMaterial, SimulationFormData, SimulationResult, PlantModel } from '../types';

const getTriangularSample = (min: number, mode: number, max: number): number => {
    if (max === min) return min;
    const F = (mode - min) / (max - min);
    const rand = Math.random();
    if (rand < F) {
        return min + Math.sqrt(rand * (max - min) * (mode - min));
    } else {
        return max - Math.sqrt((1 - rand) * (max - min) * (max - mode));
    }
};

export const runMonteCarloSimulation = (formData: SimulationFormData): SimulationResult => {
    // 1. Run a single simulation with the base values to get a mean result.
    const baseResult = runSimulation(formData);

    if (!baseResult.simulatedYield) {
        return baseResult;
    }

    // 2. Determine uncertainty from form data
    const tempImpact = (formData.temperaturaRange || 0) / 500; // 500C range variation = 100% impact on uncertainty factor
    const timeImpact = formData.tiempoResidenciaRange ? Math.log10(Math.max(1, formData.tiempoResidenciaRange)) / 4 : 0; // 10000s range variation = 100% impact
    const compImpact = (formData.compositionUncertainty || 0) / 100;
    const totalUncertainty = Math.min(0.5, 0.05 + tempImpact + timeImpact + compImpact); // Base 5% uncertainty, capped at 50%

    const { liquido, solido, gas } = baseResult.simulatedYield;
    const N = 500; // Number of simulations

    const distributions = { liquido: [] as number[], solido: [] as number[], gas: [] as number[] };
    
    for (let i = 0; i < N; i++) {
        const liqSample = getTriangularSample(liquido * (1 - totalUncertainty), liquido, liquido * (1 + totalUncertainty));
        const solSample = getTriangularSample(solido * (1 - totalUncertainty), solido, solido * (1 + totalUncertainty));
        const gasSample = 100 - liqSample - solSample;

        distributions.liquido.push(Math.max(0, liqSample));
        distributions.solido.push(Math.max(0, solSample));
        distributions.gas.push(Math.max(0, gasSample));
    }

    const calculateStats = (arr: number[]) => {
        const sum = arr.reduce((a, b) => a + b, 0);
        const mean = sum / arr.length;
        const stdDev = Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / arr.length);
        return { mean, min: Math.min(...arr), max: Math.max(...arr), stdDev };
    };

    const liquidStats = calculateStats(distributions.liquido);
    const solidStats = calculateStats(distributions.solido);
    const gasStats = calculateStats(distributions.gas);

    const yieldDistribution = {
        liquido: liquidStats,
        solido: solidStats,
        gas: gasStats,
    };
    
    const sensitivityFactors = {
        temp: tempImpact > 0.01 ? 10 * tempImpact : 0,
        comp: compImpact > 0.01 ? 8 * compImpact : 0,
        time: timeImpact > 0.01 ? 4 * timeImpact : 0,
    };

    // 3. Fabricate a sensitivity analysis (Tornado Diagram placeholder).
    const sensitivityAnalysis = [
        { variable: 'Temperatura', impact: sensitivityFactors.temp, description: 'La temperatura del reactor es un factor crítico que afecta la velocidad de las reacciones de craqueo.' },
        { variable: 'Composición de Materia Prima', impact: sensitivityFactors.comp, description: 'La composición lignocelulósica de la biomasa afecta directamente los rendimientos de los productos.' },
        { variable: 'Tiempo de Residencia', impact: sensitivityFactors.time, description: 'Un mayor tiempo de residencia favorece reacciones secundarias, alterando la proporción de productos.' },
    ].filter(item => item.impact > 0).sort((a, b) => b.impact - a.impact);


    return {
        ...baseResult,
        yieldDistribution,
        yieldRawDistribution: distributions,
        sensitivityAnalysis,
    };
};


export const runSimulation = (formData: SimulationFormData): SimulationResult => {
    const {
        simulationMode,
        composition,
        simpleCatalystId,
        mixture,
        advancedCatalystId,
        selectedBiomassModeId,
        selectedHeatSourceId,
        sensitivityChange,
        temperatura,
        tiempoResidencia,
        oxigeno
    } = formData;

    const solidMaterials = PYROLYSIS_MATERIALS.filter((m): m is PyrolysisMaterial & { fase: 'Sólido' } => m.fase === 'Sólido');
    const allMaterialsForAdvanced = PYROLYSIS_MATERIALS.filter(m => m.id !== -1);

    const effectiveMaterial = ((): PyrolysisMaterial | undefined => {
        if (simulationMode === 'simple' || simulationMode === 'extremo') {
            const total = composition.celulosa + composition.hemicellulosa + composition.lignina;
            if (total === 0) return solidMaterials[0];
            const theoreticalMaterial: PyrolysisMaterial = {
                id: -1,
                fase: 'Sólido',
                nombre: 'Biomasa Teórica',
                categoria: 'Teórica',
                propiedades: {
                    composicion: { 
                        celulosa: composition.celulosa, 
                        hemicellulosa: composition.hemicellulosa, 
                        lignina: composition.lignina 
                    },
                    analisisElemental: { carbono: 48, hidrogeno: 6, oxigeno: 45, nitrogeno: 0.5, azufre: 0.1 },
                    analisisInmediato: { humedad: 10, cenizas: 2, materiaVolatil: 80, carbonoFijo: 18 },
                    poderCalorificoSuperior: 19,
                }
            };
            return theoreticalMaterial;
        } else { // 'avanzado'
            if (mixture.length === 0) return allMaterialsForAdvanced[0];
            
            const firstMaterialId = mixture[0]?.materialId;
            const firstMaterial = PYROLYSIS_MATERIALS.find(m => m.id === firstMaterialId);
            
            if (mixture.length === 1) {
                return firstMaterial;
            }
            
            const mixtureName = mixture.map(item => {
                const mat = PYROLYSIS_MATERIALS.find(m => m.id === item.materialId);
                return `${item.percentage}% ${mat?.nombre || 'Desconocido'}`;
            }).join(' + ');
            
            const mixturePhase = firstMaterial?.fase || 'Sólido';
            const baseProps = {
                id: -2,
                nombre: `Mezcla: ${mixtureName}`,
                categoria: 'Mezcla',
                propiedades: firstMaterial?.propiedades as any
            };

            if (mixturePhase === 'Líquido') {
                return { ...baseProps, fase: 'Líquido' } as PyrolysisMaterial;
            }
            if (mixturePhase === 'Gaseoso') {
                return { ...baseProps, fase: 'Gaseoso' } as PyrolysisMaterial;
            }
            return { ...baseProps, fase: 'Sólido' } as PyrolysisMaterial;
        }
    })();

    const biomassModes = SIMULATION_ENGINE.biomass_pyrolysis_modes;
    const heatSources = SIMULATION_ENGINE.heat_sources;
    const selectedCatalystId = simulationMode === 'simple' ? simpleCatalystId : advancedCatalystId;

    const mode = biomassModes.find(m => m.id === selectedBiomassModeId);
    const heatSource = heatSources.find(h => h.id === selectedHeatSourceId);

    if (!mode || !heatSource || !effectiveMaterial) {
        return {
            simulatedYield: null,
            kpis: null,
            qualityInsights: [],
            aiAnalysis: '',
            carbonBalance: null,
            gasComposition: null,
            simulationInsights: null,
            effectiveMaterial: undefined,
            plantModel: null,
        };
    }

    let baseYield: { liquido: number; solido: number; gas: number; ceras?: number; } = { ...mode.rendimiento_base_porcentaje };
    let insights: string[] = [];
    let aiAnalysisText = heatSource.efecto_simulado.analisis_ia;
    const catalyst = SIMULATION_ENGINE.catalysts.find(c => c.id === selectedCatalystId);
    
    // Modifier logic for custom conditions from sliders/optimizer
    const idealTempStr = mode.condiciones_tipicas.temperatura_C;
    let idealTemp = idealTempStr.includes('-') ? (Number(idealTempStr.split('-')[0]) + Number(idealTempStr.split('-')[1])) / 2 : Number(idealTempStr.replace('>', ''));

    if (catalyst) {
        const condMod = catalyst.efecto_simulado.modificador_condiciones;
        if (condMod.includes("Reduce ligeramente la temperatura")) idealTemp -= 25;
        else if (condMod.includes("(500-600°C)")) idealTemp = 550;
        else if (condMod.includes("> 600°C")) idealTemp = 650;
        else if (condMod.includes("600-750°C")) idealTemp = 675;
    }
    
    const tempDelta = temperatura - idealTemp;
    baseYield.gas += tempDelta * 0.05;
    baseYield.liquido -= tempDelta * 0.03;
    baseYield.solido -= tempDelta * 0.02;

    const idealTimeStr = mode.condiciones_tipicas.tiempo_residencia;
    const idealTime = idealTimeStr.includes('< 2 s') ? 1.5 : idealTimeStr.includes('horas') ? 3600 : 180;
    const timeDelta = Math.log10(Math.max(1, tiempoResidencia)) - Math.log10(idealTime);
    
    baseYield.gas += timeDelta * 5;
    baseYield.liquido -= timeDelta * 3;
    baseYield.solido -= timeDelta * 2;

    if (oxigeno > 0) {
        baseYield.gas += oxigeno * 1.5;
        baseYield.liquido -= oxigeno * 1.0;
        baseYield.solido -= oxigeno * 0.5;
    }
    
    // Critical AI Analysis
    if (oxigeno > 5) {
        insights.push(`🔥 **¡CRÍTICO!** Operar con una concentración de oxígeno superior al 5% crea un riesgo significativo de combustión incontrolada y explosión.`);
        aiAnalysisText += ` Se ha detectado un nivel de oxígeno peligrosamente alto.`;
    }
    if (temperatura > 650) {
        insights.push(`💬 **Análisis Cinético:** A ${temperatura}°C, estás favoreciendo el craqueo térmico secundario, lo que maximiza la producción de gas. Si tu objetivo es el bio-aceite, considera reducir la temperatura.`);
    }


    if (catalyst) {
        const { modificador_rendimiento, mejora_calidad_liquido, mejora_calidad_gas } = catalyst.efecto_simulado;
        const parse = (s: string) => parseFloat(s.replace(/[^0-9-.]/g, '')) || 0;
        baseYield.liquido += parse(modificador_rendimiento.liquido);
        baseYield.solido += parse(modificador_rendimiento.solido);
        baseYield.gas += parse(modificador_rendimiento.gas);
        insights.push(mejora_calidad_liquido);
        insights.push(mejora_calidad_gas);
    }
    
    // Normalize yields
    const totalYield = baseYield.liquido + baseYield.solido + baseYield.gas + (baseYield.ceras || 0);
    if (totalYield > 0) {
        const scale = 100 / totalYield;
        baseYield.liquido *= scale;
        baseYield.solido *= scale;
        baseYield.gas *= scale;
        if (baseYield.ceras) baseYield.ceras *= scale;
    }
    
    const finalTotal = baseYield.liquido + baseYield.solido + baseYield.gas + (baseYield.ceras || 0);
    const diff = 100 - finalTotal;
    if (Math.abs(diff) > 0.01) baseYield.gas += diff;
    
    baseYield.liquido = Math.max(0, baseYield.liquido);
    baseYield.solido = Math.max(0, baseYield.solido);
    baseYield.gas = Math.max(0, baseYield.gas);

    const plantModelResult: PlantModel = {
        capacityGallonsPerYear: 5000000,
        ethanolFlowGallonsPerHour: 600,
        electricalDemandKW: 2500,
        thermalDemandKJPerHour: 1.5e7,
        fuelConsumptionTonsPerDay: 50,
    };

    return {
        simulatedYield: baseYield,
        kpis: heatSource.efecto_simulado.kpis,
        qualityInsights: insights,
        aiAnalysis: aiAnalysisText,
        carbonBalance: heatSource.efecto_simulado.carbon_balance || null,
        gasComposition: { H2: 20, CO: 45, CO2: 15, CH4: 10, C2_C4: 5, N2: 5 }, // Dummy data
        simulationInsights: {
            key_findings: ["El catalizador mejoró la calidad del líquido.", "La temperatura es un factor clave."],
            recommendations: ["Operar cerca de 500°C para bio-aceite."],
            sensitivity_analysis: "El rendimiento del líquido es muy sensible a la temperatura."
        },
        effectiveMaterial: effectiveMaterial,
        plantModel: plantModelResult,
    };
};