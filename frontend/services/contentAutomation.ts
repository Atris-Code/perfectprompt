/**
 * Content Automation Service
 * 
 * Sistema de triggers inteligentes que analiza automáticamente los datos
 * del Evaluador de Viabilidad y selecciona el template de contenido apropiado.
 */

import { VISUAL_TEMPLATES } from './visualCore';

/**
 * Estructura de datos de entrada del Evaluador de Viabilidad
 */
export interface ViabilityInputs {
    carbonBalance: 'Negativo' | 'Neutro' | 'Positivo Leve' | 'Positivo Alto';
    valorization: string[];
    contaminants: 'Excelente' | 'Bueno' | 'Regular' | 'Deficiente';
    conversionEfficiency: number;
    capex: number;
    opex: number;
    scalability: string[];
    feedstockIndependence: 'Muy Baja' | 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
    trl: number;
    compliance: string[];
    operationEase: 'Estándar' | 'Moderada' | 'Alta';
}

/**
 * Scores calculados del sistema de viabilidad
 */
export interface ViabilityScores {
    sustainability: number;
    economics: number;
    transferability: number;
    global: number;
}

/**
 * Tags automáticos asignados según características detectadas
 */
export type ProjectTag =
    | 'High_Sustainability_Potential'
    | 'Low_Tech_Risk'
    | 'High_Efficiency'
    | 'High_Scalability'
    | 'Eco_Friendly'
    | 'Economic_Viable'
    | 'Regulatory_Compliant'
    | 'Easy_Operation';

/**
 * Template de contenido seleccionado
 */
export interface ContentTemplate {
    id: string;
    name: string;
    tone: string;
    visualTemplateKey: keyof typeof VISUAL_TEMPLATES;
    emphasis: string;
    narrativeContext: string;
    recommendedActions: string[];
}

/**
 * Analiza los inputs de viabilidad y asigna tags automáticamente
 * 
 * @param inputs - Datos del formulario de viabilidad
 * @param scores - Scores calculados
 * @returns Array de tags detectados
 */
export function analyzeViabilityTriggers(
    inputs: ViabilityInputs,
    scores: ViabilityScores
): ProjectTag[] {
    const tags: ProjectTag[] = [];

    // TRIGGER 1: Alta Sostenibilidad
    // Condición: Carbono Neutro/Positivo + Eficiencia > 70%
    if (
        (inputs.carbonBalance === 'Neutro' ||
            inputs.carbonBalance === 'Positivo Leve' ||
            inputs.carbonBalance === 'Positivo Alto') &&
        inputs.conversionEfficiency > 70
    ) {
        tags.push('High_Sustainability_Potential');
    }

    // TRIGGER 2: Eco-Amigable
    // Condición: Buen manejo de contaminantes + valorización múltiple
    if (
        (inputs.contaminants === 'Excelente' || inputs.contaminants === 'Bueno') &&
        inputs.valorization.length >= 2
    ) {
        tags.push('Eco_Friendly');
    }

    // TRIGGER 3: Bajo Riesgo Tecnológico
    // Condición: TRL >= 7
    if (inputs.trl >= 7) {
        tags.push('Low_Tech_Risk');
    }

    // TRIGGER 4: Alta Eficiencia
    // Condición: Eficiencia >= 75%
    if (inputs.conversionEfficiency >= 75) {
        tags.push('High_Efficiency');
    }

    // TRIGGER 5: Alta Escalabilidad
    // Condición: Incluye escalas Mediana y Grande
    if (
        inputs.scalability.includes('Mediana') ||
        inputs.scalability.includes('Grande')
    ) {
        tags.push('High_Scalability');
    }

    // TRIGGER 6: Viabilidad Económica
    // Condición: CAPEX bajo + OPEX bajo
    if (inputs.capex < 120 && inputs.opex < 40) {
        tags.push('Economic_Viable');
    }

    // TRIGGER 7: Cumplimiento Regulatorio
    // Condición: Cumple con 2+ marcos regulatorios
    if (inputs.compliance.length >= 2) {
        tags.push('Regulatory_Compliant');
    }

    // TRIGGER 8: Operación Sencilla
    // Condición: Facilidad de operación estándar
    if (inputs.operationEase === 'Estándar') {
        tags.push('Easy_Operation');
    }

    return tags;
}

/**
 * Selecciona el template de contenido apropiado según los tags detectados
 * 
 * @param tags - Tags asignados por analyzeViabilityTriggers
 * @param scores - Scores calculados (para desempates)
 * @returns Template de contenido seleccionado
 */
export function selectContentTemplate(
    tags: ProjectTag[],
    scores: ViabilityScores
): ContentTemplate {

    // TEMPLATE 1: Eco-Innovación
    // Prioridad: Sostenibilidad + Eco-amigable
    if (
        tags.includes('High_Sustainability_Potential') ||
        (tags.includes('Eco_Friendly') && scores.sustainability > 60)
    ) {
        return {
            id: 'eco_innovation',
            name: 'Eco-Innovación',
            tone: 'Inspirador, Profesional, Optimista',
            visualTemplateKey: 'ecoInnovation',
            emphasis: 'Enfatizar sostenibilidad, impacto ambiental positivo, carbono neutro',
            narrativeContext: 'Proyecto de vanguardia en economía circular y valorización de residuos',
            recommendedActions: [
                'Destacar balance de carbono en documentación',
                'Mostrar productos valorizados con visuales limpios',
                'Enfatizar certificaciones ambientales',
                'Usar iconografía de naturaleza + tecnología'
            ]
        };
    }

    // TEMPLATE 2: Alta Eficiencia Técnica
    // Prioridad: Eficiencia + Bajo riesgo tecnológico
    if (
        (tags.includes('High_Efficiency') && tags.includes('Low_Tech_Risk')) ||
        (tags.includes('Low_Tech_Risk') && scores.economics > 60)
    ) {
        return {
            id: 'high_tech_efficiency',
            name: 'Alta Eficiencia Técnica',
            tone: 'Preciso, Técnico, Confiable',
            visualTemplateKey: 'highTechEfficiency',
            emphasis: 'Precisión técnica, madurez tecnológica, eficiencia comprobada',
            narrativeContext: 'Tecnología madura con track record demostrable',
            recommendedActions: [
                'Mostrar KPIs de eficiencia prominentemente',
                'Incluir datos de TRL y validación',
                'Visualizar comparativas con benchmarks',
                'Destacar confiabilidad operacional'
            ]
        };
    }

    // TEMPLATE 3: Viabilidad Económica
    // Prioridad: CAPEX/OPEX bajos + Escalabilidad
    if (
        tags.includes('Economic_Viable') &&
        (tags.includes('High_Scalability') || scores.economics > 70)
    ) {
        return {
            id: 'economic_viability',
            name: 'Viabilidad Económica',
            tone: 'Directo, Orientado a ROI, Pragmático',
            visualTemplateKey: 'highTechEfficiency',
            emphasis: 'Retorno de inversión, escalabilidad, costos competitivos',
            narrativeContext: 'Oportunidad de inversión con fundamentals sólidos',
            recommendedActions: [
                'Mostrar análisis CAPEX/OPEX',
                'Destacar escalabilidad y potencial de mercado',
                'Incluir proyecciones financieras',
                'Visualizar ventajas competitivas económicas'
            ]
        };
    }

    // TEMPLATE POR DEFECTO: Equilibrado
    return {
        id: 'balanced_standard',
        name: 'Estándar Equilibrado',
        tone: 'Profesional, Equilibrado, Informativo',
        visualTemplateKey: 'highTechEfficiency',
        emphasis: 'Presentación técnica balanceada de todas las dimensiones',
        narrativeContext: 'Tecnología en desarrollo con potencial multi-dimensional',
        recommendedActions: [
            'Presentar fortalezas y debilidades de forma equilibrada',
            'Incluir análisis FODA completo',
            'Mostrar roadmap de mejoras',
            'Destacar áreas de diferenciación'
        ]
    };
}

/**
 * Genera un resumen ejecutivo del análisis de triggers
 * 
 * @param tags - Tags detectados
 * @param template - Template seleccionado
 * @returns Texto del resumen
 */
export function generateTriggerSummary(
    tags: ProjectTag[],
    template: ContentTemplate
): string {
    const tagDescriptions: Record<ProjectTag, string> = {
        'High_Sustainability_Potential': '🌿 Alto Potencial de Sostenibilidad',
        'Low_Tech_Risk': '✅ Bajo Riesgo Tecnológico',
        'High_Efficiency': '⚡ Alta Eficiencia de Conversión',
        'High_Scalability': '📈 Alta Escalabilidad',
        'Eco_Friendly': '♻️ Eco-Amigable',
        'Economic_Viable': '💰 Económicamente Viable',
        'Regulatory_Compliant': '📋 Cumplimiento Regulatorio',
        'Easy_Operation': '🔧 Operación Sencilla'
    };

    let summary = `**Template Seleccionado:** ${template.name}\n\n`;
    summary += `**Características Detectadas:**\n`;
    tags.forEach(tag => {
        summary += `- ${tagDescriptions[tag]}\n`;
    });

    summary += `\n**Enfoque Recomendado:**\n${template.emphasis}\n`;
    summary += `\n**Acciones Sugeridas:**\n`;
    template.recommendedActions.forEach(action => {
        summary += `- ${action}\n`;
    });

    return summary;
}
