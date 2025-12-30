import type { ReactorResult, EconomicAnalysis, NexoConfig } from '../types';

export class EconomicAuditor {
    private rate: number;
    private currency: string;
    private annualHours: number;

    constructor(config?: Partial<NexoConfig['modules']['economic_auditor']['parameters']>) {
        // Default values from nexo_config.json
        this.rate = config?.electricity_rate_kwh || 0.12;
        this.currency = config?.currency_symbol || 'USD';
        this.annualHours = config?.industrial_hours_per_year || 7920;
    }

    /**
     * Calcula el costo directo de una sola ejecución experimental
     */
    calculateRunCost(energyUnits: number): number {
        return parseFloat((energyUnits * this.rate).toFixed(2));
    }

    /**
     * Compara el mejor reactor contra el peor para hallar el "Costo de Ineficiencia"
     * y proyectarlo anualmente
     */
    analyzeEfficiencyGap(
        winner: ReactorResult,
        loser: ReactorResult
    ): EconomicAnalysis {
        // 1. Costos Individuales
        const costWinner = this.calculateRunCost(winner.energy);
        const costLoser = this.calculateRunCost(loser.energy);

        // 2. Delta (Diferencia)
        const energySaved = loser.energy - winner.energy;
        const moneySavedPerRun = costLoser - costWinner;
        const efficiencyGainPct = (energySaved / loser.energy) * 100;

        // 3. Proyección Anual (Escalabilidad Industrial)
        // Asumiendo que cada "run" dura 1 hora para efectos de estandarización
        const projectedAnnualSavings = moneySavedPerRun * this.annualHours;

        return {
            comparison_id: `${winner.id} vs ${loser.id}`,
            winner: {
                id: winner.id,
                cost: costWinner
            },
            loser: {
                id: loser.id,
                cost: costLoser
            },
            savings_per_run: parseFloat(moneySavedPerRun.toFixed(2)),
            efficiency_gain_percent: parseFloat(efficiencyGainPct.toFixed(2)),
            annual_projected_savings: parseFloat(projectedAnnualSavings.toFixed(2)),
            financial_verdict: this.generateVerdict(projectedAnnualSavings)
        };
    }

    /**
     * Genera una frase de impacto para el reporte o el prompt
     */
    private generateVerdict(savings: number): string {
        if (savings > 10000) {
            return 'ALTO IMPACTO: La optimización justifica inversión inmediata.';
        } else if (savings > 1000) {
            return 'IMPACTO MEDIO: Mejora operativa significativa.';
        } else {
            return 'BAJO IMPACTO: Optimización marginal.';
        }
    }

    /**
     * Encuentra el reactor ganador y perdedor de una lista de resultados
     */
    findWinnerAndLoser(results: ReactorResult[]): {
        winner: ReactorResult;
        loser: ReactorResult;
    } | null {
        if (results.length < 2) {
            console.warn('Economic Auditor: Necesita al menos 2 reactores para comparar');
            return null;
        }

        // Para "Minimizar Consumo Energético", menor es mejor
        const sorted = [...results].sort((a, b) => a.energy - b.energy);

        return {
            winner: sorted[0], // Menor consumo
            loser: sorted[sorted.length - 1] // Mayor consumo
        };
    }
}

/**
 * Carga la configuración desde nexo_config.json
 */
export async function loadNexoConfig(): Promise<NexoConfig | null> {
    try {
        const response = await fetch('/config/nexo_config.json');
        if (!response.ok) {
            console.warn('No se pudo cargar nexo_config.json, usando valores por defecto');
            return null;
        }
        const config: NexoConfig = await response.json();
        return config;
    } catch (error) {
        console.error('Error cargando nexo_config.json:', error);
        return null;
    }
}

/**
 * Factory function para crear Economic Auditor con configuración
 */
export async function createEconomicAuditor(): Promise<EconomicAuditor> {
    const config = await loadNexoConfig();
    const params = config?.modules?.economic_auditor?.parameters;
    return new EconomicAuditor(params);
}
