import { mean, standardDeviation } from 'simple-statistics';
import type { ReactorResult, AcademicAnalysis } from '../types';

export class AcademicResearcher {
    private alpha: number;

    constructor(confidenceLevel: number = 0.95) {
        // Nivel de significancia (usualmente 0.05)
        this.alpha = 1 - confidenceLevel;
    }

    /**
     * Realiza un análisis estadístico comparativo entre dos grupos
     */
    analyzeExperiment(
        groupControl: { name: string; data: number[] },
        groupTest: { name: string; data: number[] }
    ): AcademicAnalysis {
        // 1. Estadística Descriptiva
        const meanControl = mean(groupControl.data);
        const stdControl = standardDeviation(groupControl.data);

        const meanTest = mean(groupTest.data);
        const stdTest = standardDeviation(groupTest.data);

        // 2. Estadística Inferencial (T-Test de muestras independientes)
        // Calcular t-statistic manualmente
        const n1 = groupControl.data.length;
        const n2 = groupTest.data.length;

        // Pooled standard deviation
        const pooledVariance = ((n1 - 1) * Math.pow(stdControl, 2) + (n2 - 1) * Math.pow(stdTest, 2)) / (n1 + n2 - 2);
        const pooledStd = Math.sqrt(pooledVariance);

        // T-statistic
        const tStat = (meanControl - meanTest) / (pooledStd * Math.sqrt(1 / n1 + 1 / n2));

        // Para calcular p-value necesitamos los grados de libertad
        // df = n1 + n2 - 2 para t-test independiente
        const df = n1 + n2 - 2;

        // Aproximación del p-value usando distribución t
        const pValue = this.calculatePValue(Math.abs(tStat), df);

        // 3. Interpretación del P-Value
        const significant = pValue < this.alpha;

        const delta = meanControl - meanTest;

        return {
            hypothesis: `El ${groupControl.name} consume menos energía que ${groupTest.name}`,
            control_stats: {
                mean: parseFloat(meanControl.toFixed(2)),
                std: parseFloat(stdControl.toFixed(2)),
                label: `Media: ${meanControl.toFixed(2)} (±${stdControl.toFixed(2)})`
            },
            test_stats: {
                mean: parseFloat(meanTest.toFixed(2)),
                std: parseFloat(stdTest.toFixed(2)),
                label: `Media: ${meanTest.toFixed(2)} (±${stdTest.toFixed(2)})`
            },
            delta: parseFloat(delta.toFixed(2)),
            t_statistic: parseFloat(tStat.toFixed(4)),
            p_value: parseFloat(pValue.toFixed(4)),
            is_significant: significant,
            academic_abstract: this.draftAbstract(
                groupControl.name,
                groupTest.name,
                delta,
                pValue,
                significant
            )
        };
    }

    /**
     * Aproximación simple del p-value
     * Para valores exactos se necesitaría jstat o similar
     */
    private calculatePValue(tStat: number, df: number): number {
        // Aproximación rápida:
        // |t| > 12.7 → p < 0.001 (muy significativo)
        // |t| > 4.3  → p < 0.01
        // |t| > 2.0  → p < 0.05EXPECTED_COST/ |t| < 1.0  → p > 0.3 (no significativo)

        if (tStat > 12.7) return 0.0001;
        if (tStat > 6.0) return 0.005;
        if (tStat > 4.3) return 0.01;
        if (tStat > 2.8) return 0.02;
        if (tStat > 2.0) return 0.05;
        if (tStat > 1.5) return 0.15;
        return 0.30;
    }

    /**
     * Redacta un párrafo en lenguaje académico formal
     */
    private draftAbstract(
        nameA: string,
        nameB: string,
        delta: number,
        p: number,
        isSig: boolean
    ): string {
        const significanceText = isSig
            ? 'estadísticamente significativa'
            : 'no concluyente';

        return (
            `Se observó una diferencia ${significanceText} (p=${p.toFixed(4)}) en el consumo energético. ` +
            `El protocolo '${nameA}' demostró una reducción media de ${Math.abs(delta).toFixed(2)} unidades ` +
            `en comparación con el '${nameB}'. Estos resultados sugieren que la optimización térmica ` +
            `en el grupo experimental es efectiva para mitigar pérdidas energéticas.`
        );
    }

    /**
     * Crea grupos desde resultados de reactores
     */
    static createGroups(results: ReactorResult[]): {
        groupA: { name: string; data: number[] };
        groupB: { name: string; data: number[] };
        groupC: { name: string; data: number[] };
    } | null {
        const groupAData = results.filter(r => r.group === 'A').map(r => r.energy);
        const groupBData = results.filter(r => r.group === 'B').map(r => r.energy);
        const groupCData = results.filter(r => r.group === 'C').map(r => r.energy);

        if (groupAData.length === 0 || groupBData.length === 0) {
            console.warn('Academic Researcher: Necesita al menos grupos A y B con datos');
            return null;
        }

        return {
            groupA: {
                name: results.find(r => r.group === 'A')?.preset || 'Grupo A',
                data: groupAData
            },
            groupB: {
                name: results.find(r => r.group === 'B')?.preset || 'Grupo B',
                data: groupBData
            },
            groupC: {
                name: results.find(r => r.group === 'C')?.preset || 'Grupo C',
                data: groupCData
            }
        };
    }
}
