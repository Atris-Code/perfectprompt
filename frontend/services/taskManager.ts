import type { SynthesizedCatalyst } from '../types';
import { ContentType } from '../types';

/**
 * COPRESET Structure:
 * C - Context: Background information
 * O - Objective: What needs to be accomplished
 * P - Presentation: Format/style of output
 * R - Role: Who the AI should act as
 * E - Example: Optional example for reference
 * S - Style: Writing/visual style
 * T - Tone: Emotional tone
 */
export interface COPRESETPayload {
    source_app: string;
    target_module: string;
    project_id: string;
    auto_fill_data: {
        context: string;
        objective: string;
        presentation_format: string;
        role: string;
        example?: string;
        style: string;
        tone: string;
    };
}

/**
 * TaskManager Service
 * Generates structured COPRESET payloads from analysis data
 * to enable seamless integration between modules
 */
export class TaskManager {
    /**
     * Generates a COPRESET payload from Catalyst Lab analysis
     */
    static generateCatalystCOPRESET(catalyst: SynthesizedCatalyst, aiAnalysis: string): COPRESETPayload {
        // Detect critical issues
        const hasMesoporosityIssue = catalyst.properties.mesoporeVolume < 0.05;
        const hasCokeResistanceIssue = catalyst.properties.cokeResistance < 60;

        // Generate context
        const context = `Estamos analizando el catalizador "${catalyst.name}" (framework ${catalyst.frameworkType}). ` +
            `Tiene una relación Si/Al de ${catalyst.siAlRatio}, acidez de ${catalyst.properties.acidity.toFixed(1)}, ` +
            `y excelente estabilidad térmica (${catalyst.properties.thermalStability.toFixed(1)}). ` +
            (hasMesoporosityIssue
                ? `Sin embargo, presenta un volumen de mesoporo crítico (${catalyst.properties.mesoporeVolume.toFixed(3)} cm³/g), ` +
                `causando limitaciones severas de transporte de materia y coquización rápida.`
                : `El volumen de mesoporo es ${catalyst.properties.mesoporeVolume.toFixed(3)} cm³/g.`
            );

        // Generate objective
        const objective = hasMesoporosityIssue
            ? `Crear una representación visual que explique el "Bloqueo de poros por difusión limitada" ` +
            `para justificar la necesidad de introducir mesoporosidad jerárquica mediante desilicación post-síntesis.`
            : `Crear una visualización técnica del catalizador ${catalyst.name} mostrando su estructura ` +
            `porosa y propiedades catalíticas para documentación de investigación.`;

        // Visual metaphor based on issues
        const visualMetaphor = hasMesoporosityIssue
            ? "Un túnel de autopista tapiado con escombros - representando los microporos bloqueados"
            : "Una red de canales interconectados mostrando acceso eficiente a sitios activos";

        return {
            source_app: "Laboratorio_Catalizadores_v1.0",
            target_module: "Creador_Prompts_Pro",
            project_id: `${catalyst.name.replace(/\s+/g, '_')}_Analysis`,
            auto_fill_data: {
                context,
                objective,
                presentation_format: `Render 3D fotorrealista con corte transversal. ${visualMetaphor}. ` +
                    `Incluir escala nanométrica y leyenda explicativa.`,
                role: "Eres un científico de materiales especializado en catálisis heterogénea, " +
                    "experto en visualización científica de estructuras porosas.",
                example: "Similar al estilo de ilustraciones en Nature Materials o Advanced Materials",
                style: "Científico-técnico con elementos visuales claros. Balance entre rigor académico y claridad didáctica.",
                tone: "Profesional, objetivo, enfocado en comunicar hallazgos técnicos de manera precisa"
            }
        };
    }

    /**
     * Generates auto-fill data compatible with Creator component
     */
    static toCreatorFormData(payload: COPRESETPayload) {
        return {
            objective: `${payload.auto_fill_data.context}\n\n${payload.auto_fill_data.objective}`,
            textType: 'Técnico/Científico',
            targetAudience: 'Investigadores y científicos',
            tone: payload.auto_fill_data.tone,
            style: payload.auto_fill_data.style,
            format: payload.auto_fill_data.presentation_format,
            contentType: ContentType.Imagen
        };
    }

    /**
     * Logs COPRESET payload to console for debugging
     */
    static logPayload(payload: COPRESETPayload) {
        console.group('🔷 COPRESET Payload Generated');
        console.log('Source:', payload.source_app);
        console.log('Target:', payload.target_module);
        console.log('Project ID:', payload.project_id);
        console.group('Auto-fill Data');
        Object.entries(payload.auto_fill_data).forEach(([key, value]) => {
            console.log(`${key}:`, value);
        });
        console.groupEnd();
        console.groupEnd();
    }
}
