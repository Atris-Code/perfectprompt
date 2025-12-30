import type { CoPreset, SimulationResult, SimulationKPIs, GroupKey, GroupData } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import {
    calculateMean,
    calculateStdDev,
    calculateConfidenceInterval,
    performANOVA,
    identifyWinner
} from '../utils/statistics';

/**
 * Experiment Engine - Servicio para ejecutar y analizar experimentos DoE
 */

export interface ReactorExperimentResult {
    reactorId: string;
    groupKey: GroupKey;
    presetName: string;
    kpiValue: number;
    fullResult: SimulationResult;
}

export interface GroupedExperimentResults {
    groupA: ReactorExperimentResult[];
    groupB: ReactorExperimentResult[];
    groupC: ReactorExperimentResult[];
}

export interface GroupStatistics {
    mean: number;
    stdDev: number;
    ci95: [number, number];
    count: number;
}

export interface StatisticalAnalysis {
    groupA: GroupStatistics;
    groupB: GroupStatistics;
    groupC: GroupStatistics;
    winner: GroupKey;
    pValue: number;
    fStatistic: number;
    significantDifference: boolean;
}

export interface SavedExperiment {
    id: string;
    name: string;
    kpi: string;
    timestamp: string;
    groups: Record<GroupKey, GroupData>;
    results: GroupedExperimentResults;
    statistics: StatisticalAnalysis;
    insights: string;
}

/**
 * Extrae el valor del KPI específic del resultado de simulación
 */
export function extractKPIValue(result: SimulationResult, kpiName: string): number {
    switch (kpiName) {
        case 'Maximizar Rendimiento de Bio-aceite':
            return result.simulatedYield?.liquido ?? 0;

        case 'Maximizar Pureza de Biochar':
            return result.kpis?.eficiencia_carbono ?? 0;

        case 'Minimizar Consumo Energético':
            // Invertir porque es minimización: más alto = mejor
            const demand = result.plantModel?.electricalDemandKW ?? 1000;
            return 1000 - demand; // Normalizar para que mayor = mejor

        case 'Maximizar Producción de Syngas':
            return result.simulatedYield?.gas ?? 0;

        default:
            return 0;
    }
}

/**
 * Simula un reactor con un preset específico
 */
export async function simulateReactor(
    reactorId: string,
    preset: CoPreset,
    kpiName: string,
    apiKey: string
): Promise<{ reactorId: string; kpiValue: number; fullResult: SimulationResult }> {
    try {
        // Crear contexto de simulación basado en el preset
        // Usando valores fijos ya que feedstock y catalyst no están en CoPreset
        const simulationContext = {
            feedstock: 'Biomasa mixta',
            temperature: preset.targetTemp,
            residenceTime: preset.residenceTime,
            catalyst: 'Ninguno',
            n2Flow: preset.flowN2,
            description: preset.cinematicDescription
        };

        // Llamar a geminiService para generar simulación realista
        const prompt = `Simula un reactor de pirólisis con las siguientes condiciones:
- Materia prima: ${simulationContext.feedstock}
- Temperatura: ${simulationContext.temperature}°C
- Tiempo de residencia: ${simulationContext.residenceTime}s
- Flujo N₂: ${simulationContext.n2Flow} L/min
- Catalizador: ${simulationContext.catalyst}

Genera resultados realistas de:
1. Rendimientos (líquido, sólido, gas) en %
2. KPIs (coste bio-aceite, eficiencia carbono, eficiencia energética, emisiones)
3. Demanda eléctrica en kW

Responde SOLO con JSON válido en este formato exacto:
{
  "simulatedYield": {"liquido": number, "solido": number, "gas": number},
  "kpis": {"coste_bio_aceite": number, "eficiencia_carbono": number, "eficiencia_energetica": number, "emisiones_netas": number},
  "plantModel": {"electricalDemandKW": number}
}`;

        // Llamar directamente a Gemini API
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        simulatedYield: {
                            type: Type.OBJECT,
                            properties: {
                                liquido: { type: Type.NUMBER },
                                solido: { type: Type.NUMBER },
                                gas: { type: Type.NUMBER }
                            },
                            required: ['liquido', 'solido', 'gas']
                        },
                        kpis: {
                            type: Type.OBJECT,
                            properties: {
                                coste_bio_aceite: { type: Type.NUMBER },
                                eficiencia_carbono: { type: Type.NUMBER },
                                eficiencia_energetica: { type: Type.NUMBER },
                                emisiones_netas: { type: Type.NUMBER }
                            },
                            required: ['coste_bio_aceite', 'eficiencia_carbono', 'eficiencia_energetica', 'emisiones_netas']
                        },
                        plantModel: {
                            type: Type.OBJECT,
                            properties: {
                                electricalDemandKW: { type: Type.NUMBER }
                            },
                            required: ['electricalDemandKW']
                        }
                    },
                    required: ['simulatedYield', 'kpis', 'plantModel']
                }
            }
        });
        
        if (!result.text) {
            throw new Error("Gemini returned empty response");
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(result.text);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", result.text);
            throw new Error("Invalid JSON response from Gemini");
        }

        // Validate and fill missing structure
        if (!parsedResult.simulatedYield) parsedResult.simulatedYield = { liquido: 0, solido: 0, gas: 0 };
        if (!parsedResult.kpis) parsedResult.kpis = { coste_bio_aceite: 0, eficiencia_carbono: 0, eficiencia_energetica: 0, emisiones_netas: 0 };
        if (!parsedResult.plantModel) parsedResult.plantModel = { electricalDemandKW: 1000 };

        // Crear resultado completo con valores por defecto
        const fullResult: SimulationResult = {
            simulatedYield: parsedResult.simulatedYield,
            kpis: parsedResult.kpis,
            qualityInsights: [`Reactor ${reactorId} con preset ${preset.name}`],
            aiAnalysis: `Simulación para ${preset.cinematicDescription}`,
            carbonBalance: null,
            gasComposition: null,
            simulationInsights: null,
            plantModel: parsedResult.plantModel || {
                capacityGallonsPerYear: 100000,
                ethanolFlowGallonsPerHour: 50,
                electricalDemandKW: 150,
                thermalDemandKJPerHour: 5000,
                fuelConsumptionTonsPerDay: 10
            }
        };

        const kpiValue = extractKPIValue(fullResult, kpiName);

        return { reactorId, kpiValue, fullResult };
    } catch (error) {
        console.error(`Error simulando reactor ${reactorId}:`, error);

        // Fallback a valores simulados sin IA
        const fallbackYield = {
            liquido: 40 + Math.random() * 10,
            solido: 25 + Math.random() * 10,
            gas: 20 + Math.random() * 10
        };

        const fallbackResult: SimulationResult = {
            simulatedYield: fallbackYield,
            kpis: {
                coste_bio_aceite: 0.4 + Math.random() * 0.3,
                eficiencia_carbono: 80 + Math.random() * 15,
                eficiencia_energetica: 70 + Math.random() * 15,
                emisiones_netas: -25 + Math.random() * 10
            },
            qualityInsights: [`Simulación fallback para ${reactorId}`],
            aiAnalysis: 'Datos generados sin IA',
            carbonBalance: null,
            gasComposition: null,
            simulationInsights: null,
            plantModel: {
                capacityGallonsPerYear: 100000,
                ethanolFlowGallonsPerHour: 50,
                electricalDemandKW: 120 + Math.random() * 80,
                thermalDemandKJPerHour: 5000,
                fuelConsumptionTonsPerDay: 10
            }
        };

        const kpiValue = extractKPIValue(fallbackResult, kpiName);
        return { reactorId, kpiValue, fullResult: fallbackResult };
    }
}

/**
 * Agrupa los resultados por grupo experimental
 */
export function aggregateResultsByGroup(
    rawResults: { reactorId: string; groupKey: GroupKey; presetName: string; kpiValue: number; fullResult: SimulationResult }[]
): GroupedExperimentResults {
    const grouped: GroupedExperimentResults = {
        groupA: [],
        groupB: [],
        groupC: []
    };

    rawResults.forEach(result => {
        const groupResult: ReactorExperimentResult = {
            reactorId: result.reactorId,
            groupKey: result.groupKey,
            presetName: result.presetName,
            kpiValue: result.kpiValue,
            fullResult: result.fullResult
        };

        if (result.groupKey === 'A') {
            grouped.groupA.push(groupResult);
        } else if (result.groupKey === 'B') {
            grouped.groupB.push(groupResult);
        } else if (result.groupKey === 'C') {
            grouped.groupC.push(groupResult);
        }
    });

    return grouped;
}

/**
 * Genera insights de IA basados en los resultados experimentales
 */
export async function generateAIInsights(
    experimentName: string,
    kpiName: string,
    results: GroupedExperimentResults,
    statistics: StatisticalAnalysis,
    apiKey: string
): Promise<string> {
    const prompt = `Eres un experto en diseño de experimentos (DoE) y análisis estadístico de procesos de pirólisis.

**Experimento:** "${experimentName}"
**KPI Optimizado:** ${kpiName}

**Resultados por Grupo:**

**Grupo A (Control):**
- Media: ${statistics.groupA.mean.toFixed(2)}
- Desviación Estándar: ${statistics.groupA.stdDev.toFixed(2)}
- IC 95%: [${statistics.groupA.ci95[0].toFixed(2)}, ${statistics.groupA.ci95[1].toFixed(2)}]
- Resultados individuales: ${results.groupA.map(r => `${r.reactorId}: ${r.kpiValue.toFixed(2)}`).join(', ')}

**Grupo B (Test 1):**
- Media: ${statistics.groupB.mean.toFixed(2)}
- Desviación Estándar: ${statistics.groupB.stdDev.toFixed(2)}
- IC 95%: [${statistics.groupB.ci95[0].toFixed(2)}, ${statistics.groupB.ci95[1].toFixed(2)}]
- Resultados individuales: ${results.groupB.map(r => `${r.reactorId}: ${r.kpiValue.toFixed(2)}`).join(', ')}

**Grupo C (Test 2):**
- Media: ${statistics.groupC.mean.toFixed(2)}
- Desviación Estándar: ${statistics.groupC.stdDev.toFixed(2)}
- IC 95%: [${statistics.groupC.ci95[0].toFixed(2)}, ${statistics.groupC.ci95[1].toFixed(2)}]
- Resultados individuales: ${results.groupC.map(r => `${r.reactorId}: ${r.kpiValue.toFixed(2)}`).join(', ')}

**Análisis Estadístico:**
- Grupo Ganador: **${statistics.winner}**
- p-value (ANOVA): ${statistics.pValue.toFixed(4)}
- F-statistic: ${statistics.fStatistic.toFixed(2)}
- ¿Diferencia significativa?: ${statistics.significantDifference ? 'SÍ (p < 0.05)' : 'NO (p >= 0.05)'}

Proporciona un análisis detallado en markdown que incluya:

1. **Hallazgos Clave** (2-3 puntos principales)
2. **Interpretación Estadística** (¿es la diferencia significativa? ¿qué implica?)
3. **Recomendaciones Prácticas** (qué hacer con estos resultados)
4. **Próximos Experimentos Sugeridos** (cómo optimizar más)

Sé técnicamente preciso pero claro. Usa negritas para destacar puntos importantes.`;

    try {
        // Llamar directamente a Gemini API
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });
        
        if (!result.text) {
             throw new Error("Gemini returned empty response for insights");
        }
        
        const insights = result.text; 
        return insights;
    } catch (error) {
        console.error('Error generando insights de IA:', error);
        return `## ⚠ Error al generar insights de IA

Los resultados del experimento están disponibles en las tablas y gráficos anteriores.

**Grupo Ganador:** Grupo ${statistics.winner} con media de ${statistics.winner === 'A' ? statistics.groupA.mean : statistics.winner === 'B' ? statistics.groupB.mean : statistics.groupC.mean.toFixed(2)}

**Significancia estadística:** ${statistics.significantDifference ? 'Las diferencias entre grupos son estadísticamente significativas.' : 'No hay suficiente evidencia de diferencias significativas entre grupos.'}`;
    }
}
/**
 * Realiza análisis estadístico completo de los resultados experimentales
 */
export function performStatisticalAnalysis(
    results: GroupedExperimentResults
): StatisticalAnalysis {
    // Extraer valores por grupo
    const valuesA = results.groupA.map(r => r.kpiValue);
    const valuesB = results.groupB.map(r => r.kpiValue);
    const valuesC = results.groupC.map(r => r.kpiValue);

    // Calcular estadísticas para cada grupo
    const meanA = calculateMean(valuesA);
    const meanB = calculateMean(valuesB);
    const meanC = calculateMean(valuesC);

    const stdDevA = calculateStdDev(valuesA, meanA);
    const stdDevB = calculateStdDev(valuesB, meanB);
    const stdDevC = calculateStdDev(valuesC, meanC);

    const ci95A = calculateConfidenceInterval(meanA, stdDevA, valuesA.length);
    const ci95B = calculateConfidenceInterval(meanB, stdDevB, valuesB.length);
    const ci95C = calculateConfidenceInterval(meanC, stdDevC, valuesC.length);

    // ANOVA
    const { fStatistic, pValue } = performANOVA(valuesA, valuesB, valuesC);

    // Identificar ganador
    const winner = identifyWinner(meanA, meanB, meanC);

    return {
        groupA: { mean: meanA, stdDev: stdDevA, ci95: ci95A, count: valuesA.length },
        groupB: { mean: meanB, stdDev: stdDevB, ci95: ci95B, count: valuesB.length },
        groupC: { mean: meanC, stdDev: stdDevC, ci95: ci95C, count: valuesC.length },
        winner,
        pValue,
        fStatistic,
        significantDifference: pValue < 0.05
    };
}