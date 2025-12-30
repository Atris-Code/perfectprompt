import { EconomicAuditor, loadNexoConfig } from './economicAuditor';
import { AcademicResearcher } from './academicResearcher';
import type {
    ReactorResult,
    PostExperimentReport,
    NexoConfig
} from '../types';
import type { GroupedExperimentResults } from './experimentEngine';

export class PostExperimentManager {
    private config: NexoConfig | null = null;
    private economicAuditor: EconomicAuditor;
    private academicResearcher: AcademicResearcher;

    constructor(config?: NexoConfig) {
        this.config = config || null;

        // Inicializar módulos con configuración
        const ecoParams = config?.modules?.economic_auditor?.parameters;
        this.economicAuditor = new EconomicAuditor(ecoParams);

        const acadParams = config?.modules?.academic_researcher?.parameters;
        const confidenceLevel = acadParams?.confidence_level || 0.95;
        this.academicResearcher = new AcademicResearcher(confidenceLevel);
    }

    /**
     * Procesa los resultados de un experimento y genera el reporte post-experimental
     */
    async processResults(params: {
        experimentResults: GroupedExperimentResults;
        experimentName: string;
        kpi: string;
    }): Promise<PostExperimentReport> {
        const { experimentResults, experimentName, kpi } = params;

        console.log('📊 Post-Experiment Manager: Procesando resultados...');

        // 1. Convertir resultados a formato ReactorResult
        const reactorResults = this.extractReactorResults(experimentResults);

        if (reactorResults.length === 0) {
            console.warn('Post-Experiment Manager: No hay resultados para procesar');
            return {
                triggered_tasks: [],
                timestamp: new Date().toISOString()
            };
        }

        const report: PostExperimentReport = {
            triggered_tasks: [],
            timestamp: new Date().toISOString()
        };

        // 2. Análisis Económico (si está habilitado)
        if (this.config?.modules?.economic_auditor?.enabled !== false) {
            try {
                console.log('💰 Ejecutando análisis económico...');
                const winnerLoser = this.economicAuditor.findWinnerAndLoser(reactorResults);

                if (winnerLoser) {
                    report.economic = this.economicAuditor.analyzeEfficiencyGap(
                        winnerLoser.winner,
                        winnerLoser.loser
                    );

                    console.log(`✓ Economic Analysis: ${report.economic.financial_verdict}`);
                    console.log(`  Ahorro anual proyectado: $${report.economic.annual_projected_savings}`);
                }
            } catch (error) {
                console.error('Error en análisis económico:', error);
            }
        }

        // 3. Análisis Académico (si está habilitado)
        if (this.config?.modules?.academic_researcher?.enabled !== false) {
            try {
                console.log('📚 Ejecutando análisis académico...');
                const groups = AcademicResearcher.createGroups(reactorResults);

                if (groups && groups.groupA.data.length > 0 && groups.groupB.data.length > 0) {
                    // Comparar grupo A (control) vs grupo B o C (test)
                    const testGroup = groups.groupB.data.length > 0 ? groups.groupB : groups.groupC;

                    report.academic = this.academicResearcher.analyzeExperiment(
                        groups.groupA,
                        testGroup
                    );

                    console.log(`✓ Academic Analysis: p=${report.academic.p_value.toFixed(4)}`);
                    console.log(`  ${report.academic.is_significant ? 'SIGNIFICATIVO' : 'NO SIGNIFICATIVO'}`);
                }
            } catch (error) {
                console.error('Error en análisis académico:', error);
            }
        }

        // 4. Evaluar Reglas de Orquestación
        report.triggered_tasks = this.evaluateRules(report);

        console.log(`📋 Tareas generadas: ${report.triggered_tasks.length}`);

        return report;
    }

    /**
     * Extrae ReactorResult[] desde GroupedExperimentResults
     */
    private extractReactorResults(grouped: GroupedExperimentResults): ReactorResult[] {
        const results: ReactorResult[] = [];

        // GroupedExperimentResults tiene estructura: { groupA: [], groupB: [], groupC: [] }
        const groups: Array<{ key: string; data: typeof grouped.groupA }> = [
            { key: 'A', data: grouped.groupA || [] },
            { key: 'B', data: grouped.groupB || [] },
            { key: 'C', data: grouped.groupC || [] }
        ];

        for (const group of groups) {
            for (const reactorData of group.data) {
                results.push({
                    id: reactorData.reactorId,
                    energy: reactorData.kpiValue,
                    group: group.key,
                    preset: reactorData.presetName
                });
            }
        }

        console.log(`📊 Extracted ${results.length} reactor results for analysis`);
        return results;
    }

    /**
     * Evalúa las reglas de orquestación y retorna las tareas disparadas
     */
    private evaluateRules(report: PostExperimentReport): string[] {
        const tasks: string[] = [];

        if (!this.config?.orchestration_rules) {
            return tasks;
        }

        for (const rule of this.config.orchestration_rules) {
            let triggered = false;

            try {
                // Evaluar condición de trigger
                if (rule.id === 'rule_economic_boom') {
                    const savings = report.economic?.annual_projected_savings || 0;
                    const threshold = this.config.modules.economic_auditor.thresholds.high_impact_savings;
                    triggered = savings > threshold;
                } else if (rule.id === 'rule_scientific_breakthrough') {
                    const pValue = report.academic?.p_value || 1.0;
                    const alpha = this.config.modules.academic_researcher.parameters.alpha_significance;
                    triggered = pValue < alpha;
                }

                if (triggered) {
                    const taskDescription = `${rule.action.priority}: ${rule.action.copreset_template}`;
                    tasks.push(taskDescription);
                    console.log(`🎯 Regla activada: ${rule.id} → ${taskDescription}`);
                }
            } catch (error) {
                console.error(`Error evaluando regla ${rule.id}:`, error);
            }
        }

        return tasks;
    }
}

/**
 * Factory function para crear Post-Experiment Manager con configuración cargada
 */
export async function createPostExperimentManager(): Promise<PostExperimentManager> {
    const config = await loadNexoConfig();
    return new PostExperimentManager(config || undefined);
}
