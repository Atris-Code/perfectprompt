import type { Task } from '../types';
import { ContentType } from '../types';

/**
 * Creates a Task object from a post-experiment triggered task string
 * @param taskString Format: "PRIORITY: template_name"
 * @param context Additional context from the experiment
 */
export function createTaskFromPostExperiment(
    taskString: string,
    context: {
        experimentName: string;
        kpi: string;
        economicVerdict?: string;
        academicSignificance?: boolean;
    }
): Task {
    // Parse task string: "HIGH: investor_pitch"
    const [priority, templateName] = taskString.split(':').map(s => s.trim());

    // Map template names to readable titles
    const titleMap: Record<string, string> = {
        'investor_pitch': 'Pitch para Inversores',
        'academic_paper_abstract': 'Abstract Académico',
        'process_optimization_report': 'Reporte de Optimización',
        'creative_visualization': 'Visualización Creativa'
    };

    const title = titleMap[templateName] || templateName.replace(/_/g, ' ');

    // Map priority to agent
    const agentId = priority === 'HIGH' ? 'synthia-pro' : 'Orquestador';

    // Map template to event type
    const eventTypeMap: Record<string, 'ViabilityAnalysis' | 'VisualCampaign' | 'ExecutiveReport' | 'MarketOpportunityAnalysis' | 'ComparativeAnalysis' | 'Assay'> = {
        'investor_pitch': 'ExecutiveReport',
        'academic_paper_abstract': 'ExecutiveReport',
        'process_optimization_report': 'ComparativeAnalysis',
        'creative_visualization': 'VisualCampaign'
    };
    const eventType = eventTypeMap[templateName] || 'ComparativeAnalysis';

    // Create objective based on template
    let objective = '';
    if (templateName === 'investor_pitch') {
        objective = `Crear un pitch ejecutivo presentando los resultados del experimento "${context.experimentName}". ` +
            `El análisis económico muestra: ${context.economicVerdict}. ` +
            `Enfoque: ${context.kpi}`;
    } else if (templateName === 'academic_paper_abstract') {
        objective = `Redactar un abstract científico sobre el experimento "${context.experimentName}". ` +
            `Los resultados son estadísticamente ${context.academicSignificance ? 'SIGNIFICATIVOS' : 'NO CONCLUYENTES'}. ` +
            `Métrica evaluada: ${context.kpi}`;
    } else {
        objective = `Generar contenido creativo basado en el experimento "${context.experimentName}" ` +
            `enfocado en ${context.kpi}`;
    }

    // Create subtasks based on template
    const subtasksMap: Record<string, string[]> = {
        'investor_pitch': [
            'Análisis de ROI y proyecciones',
            'Estructurar narrative para inversores',
            'Crear deck de presentación'
        ],
        'academic_paper_abstract': [
            'Revisar significancia estadística',
            'Redactar metodología y resultados',
            'Preparar gráficos y tablas'
        ],
        'process_optimization_report': [
            'Comparar configuraciones',
            'Identificar optimizaciones',
            'Documentar recomendaciones'
        ],
        'creative_visualization': [
            'Diseñar concepto visual',
            'Generar assets',
            'Integrar con datos'
        ]
    };

    const subtaskNames = subtasksMap[templateName] || ['Análisis inicial', 'Desarrollo', 'Revisión final'];
    const subTasks = subtaskNames.map(name => ({
        name,
        status: 'pending' as const
    }));

    // Create Task
    const task: Task = {
        id: `post-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `[Forja] ${title}`,
        createdAt: Date.now(),
        status: 'Por Hacer',
        contentType: templateName === 'creative_visualization' ? ContentType.Imagen : ContentType.Texto,
        formData: {
            objective
        },
        isIntelligent: true,
        agentId,
        eventType,
        subTasks
    };

    return task;
}
