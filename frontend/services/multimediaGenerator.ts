/**
 * Multimedia Content Generator Service
 * 
 * Sistema que genera automáticamente contenido multimedia profesional
 * a partir del análisis FODA del Evaluador de Viabilidad.
 * 
 * Genera:
 * 1. Documento técnico en Markdown
 * 2. Prompt para infografía (con Visual Core)
 * 3. Guion de video para Reels/YouTube Shorts
 */

import { generateText, generateJSON } from './aiProvider';
import { VISUAL_CORE_SYSTEM_PROMPT, BRAND_COLORS } from './visualCore';
import type { ContentTemplate } from './contentAutomation';

/**
 * Escena de video con descripción visual y audio
 */
export interface VideoScene {
    number: number;
    visual: string;
    audio: string;
    duration: number;
}

/**
 * Guion de video completo
 */
export interface VideoScript {
    scenes: VideoScene[];
    duration: number;
    style: string;
    visualNotes: string;
}

/**
 * Contenido multimedia generado
 */
export interface MultimediaContent {
    textDocument: string;
    infographicPrompt: string;
    videoScript: VideoScript;
}

/**
 * Genera contenido multimedia completo basado en análisis FODA
 * 
 * @param analysisText - Texto del análisis de fortalezas/debilidades
 * @param template - Template seleccionado automáticamente
 * @param apiKey - API key del proveedor de IA
 * @returns Contenido multimedia en 3 formatos
 */
export async function generateMultimediaContent(
    analysisText: string,
    template: ContentTemplate,
    _apiKey: string
): Promise<MultimediaContent> {
    // Generar los 3 formatos en paralelo
    const [textDocument, infographicPrompt, videoScript] = await Promise.all([
        generateTechnicalDocument(analysisText, template),
        generateInfographicPrompt(analysisText, template),
        generateVideoScript(analysisText, template)
    ]);

    return {
        textDocument,
        infographicPrompt,
        videoScript
    };
}

/**
 * Genera documento técnico profesional en Markdown
 */
async function generateTechnicalDocument(
    analysisText: string,
    template: ContentTemplate
): Promise<string> {
    const prompt = `
Actúa como redactor técnico especializado en tecnologías de valorización de residuos.

CONTEXTO DEL PROYECTO:
${analysisText}

TEMPLATE SELECCIONADO: ${template.name}
TONO: ${template.tone}
ÉNFASIS: ${template.emphasis}

TAREA:
Genera un documento técnico ejecutivo estructurado y profesional.

ESTRUCTURA REQUERIDA:
# Resumen Ejecutivo

[2-3 párrafos concisos que resuman el proyecto, sus fortalezas clave y su potencial]

## 🌟 Fortalezas Clave

- **[Fortaleza 1]**: [Descripción breve con datos específicos]
- **[Fortaleza 2]**: [Descripción breve con datos específicos]
- **[Fortaleza 3]**: [Descripción breve con datos específicos]

## ⚠️ Áreas de Atención y Mitigaciones

- **[Debilidad 1]**: [Descripción del riesgo]
  - *Mitigación propuesta*: [Estrategia específica]
- **[Debilidad 2]**: [Descripción del riesgo]
  - *Mitigación propuesta*: [Estrategia específica]

## 🎯 Conclusión y Recomendaciones

[Veredicto final con pasos accionables concretos]

INSTRUCCIONES ADICIONALES:
- Usa datos cuantitativos cuando estén disponibles (porcentajes, TRL, etc.)
- Sé conciso pero técnico
- Incluye emojis solo en los encabezados
- Formato: Markdown limpio y profesional
- Evita generalizaciones, sé específico
`;

    try {
        return await generateText(prompt);
    } catch (error) {
        console.error('Error generando documento técnico:', error);
        throw new Error('No se pudo generar el documento técnico');
    }
}

/**
 * Genera prompt optimizado para infografía con Visual Core
 */
function generateInfographicPrompt(
    analysisText: string,
    template: ContentTemplate
): string {
    // Extraer fortalezas y debilidades del análisis
    const fortalezasMatch = analysisText.match(/Fortalezas([\s\S]*?)Debilidades/);
    const debilidadesMatch = analysisText.match(/Debilidades([\s\S]*?)$/);

    const fortalezas = fortalezasMatch ? fortalezasMatch[1].trim() : 'Fortalezas del proyecto';
    const debilidades = debilidadesMatch ? debilidadesMatch[1].trim() : 'Áreas de mejora';

    // Seleccionar colores según el template
    const templateColors = {
        eco_innovation: [BRAND_COLORS.bioluminescentCyan, BRAND_COLORS.brightTeal],
        high_tech_efficiency: [BRAND_COLORS.deepTechBlue, BRAND_COLORS.metallicGray],
        economic_viability: [BRAND_COLORS.deepTechBlue, BRAND_COLORS.controlledAmber],
        balanced_standard: [BRAND_COLORS.deepTechBlue, BRAND_COLORS.metallicGray]
    };

    const colors = templateColors[template.id as keyof typeof templateColors] || templateColors.balanced_standard;

    return `${VISUAL_CORE_SYSTEM_PROMPT}

### PROMPT ESPECÍFICO ###

TIPO: Infografía comparativa profesional
LAYOUT: Dos columnas (Fortalezas | Debilidades)
ESTILO: Vectorial plano, limpio, apto para redes sociales

CONTENIDO:

**FORTALEZAS** (Columna Izquierda):
${fortalezas}

**DEBILIDADES** (Columna Derecha):
${debilidades}

CÓDIGO DE COLORES:
- Verde/Cyan (${colors[0]}): Fortalezas y datos positivos
- Amarillo (#FBBF24): Áreas de mejora y precauciones
- Rojo (#EF4444): Solo para debilidades críticas

ELEMENTOS VISUALES:
- Iconos técnicos modernos para cada punto
- Flechas o conectores si hay relaciones
- Diseño holográfico con efectos de glow sutil
- Tipografía: Sans-serif moderna, bold para títulos
- Fondo: Gradiente sutil de ${colors[0]} a ${colors[1]}

PROPORCIONES:
- Formato: 1080x1080px (Instagram) o 1080x1920px (Stories/Reels)
- Márgenes: Generosos, mínimo 60px
- Tamaño de texto: Legible en móvil

RESTRICCIONES:
- NO usar dibujos animados o clipart
- NO sobrecargar con texto (máximo 5-7 palabras por punto)
- SÍ usar jerarquía visual clara
- SÍ mantener espacios en blanco para respiración

${template.emphasis}
`;
}

/**
 * Genera guion de video para Reels/YouTube Shorts
 */
async function generateVideoScript(
    analysisText: string,
    template: ContentTemplate
): Promise<VideoScript> {
    const prompt = `
Genera un guion para un video de 60 segundos para YouTube Shorts/Instagram Reels.

ANÁLISIS BASE:
${analysisText}

TEMPLATE: ${template.name}
TONO: ${template.tone}
ÉNFASIS: ${template.emphasis}

ESTRUCTURA REQUERIDA (4 escenas x 15 segundos):

Escena 1 (0-15s): HOOK EMOCIONAL
- Visual: Imagen impactante que capture atención
- Audio: Pregunta provocadora o dato sorprendente
- Objetivo: Detener el scroll

Escena 2 (15-30s): DATO IMPACTANTE PRINCIPAL
- Visual: Animación de la fortaleza #1
- Audio: Explicación del beneficio clave
- Objetivo: Establecer valor

Escena 3 (30-45s): SEGUNDA FORTALEZA
- Visual: Gráfico o visualización de datos
- Audio: Reforzar con segunda fortaleza clave
- Objetivo: Construir credibilidad

Escena 4 (45-60s): CIERRE Y CTA
- Visual: Logo/marca con mensaje final
- Audio: Call-to-action claro
- Objetivo: Conversión

FORMATO DE SALIDA (JSON):
{
  "scenes": [
    {
      "number": 1,
      "visual": "Descripción detallada de lo que se ve en pantalla",
      "audio": "Texto exacto de la narración o diálogo",
      "duration": 15
    },
    ...
  ],
  "style": "Estilo visual general del video",
  "visualNotes": "Notas adicionales para el editor de video"
}

INSTRUCCIONES:
- Sé conciso y directo
- Usa lenguaje emocional pero creíble
- Incluye datos específicos cuando sea posible
- La narración debe fluir naturalmente
- Evita jerga técnica excesiva
`;

    try {
        const scriptData = await generateJSON<VideoScript>(prompt, {});

        // Validate structure
        if (!scriptData.scenes || !Array.isArray(scriptData.scenes)) {
             // Fallback structure if scenes are missing
             scriptData.scenes = [];
        }

        return {
            scenes: scriptData.scenes,
            duration: scriptData.scenes.reduce((acc: number, scene: VideoScene) => acc + (scene.duration || 0), 0),
            style: scriptData.style || template.emphasis,
            visualNotes: scriptData.visualNotes || `Usar paleta de colores del template ${template.name}`
        };
    } catch (error) {
        console.error('Error generando guion de video:', error);

        // Fallback: Guion básico estructurado
        return {
            scenes: [
                {
                    number: 1,
                    visual: "Imagen de residuos transformándose en energía limpia",
                    audio: "¿Sabías que los residuos pueden ser más valiosos que nunca?",
                    duration: 15
                },
                {
                    number: 2,
                    visual: `Animación mostrando el proceso de valorización`,
                    audio: `Esta tecnología transforma residuos en productos de alto valor`,
                    duration: 15
                },
                {
                    number: 3,
                    visual: "Gráficos mostrando eficiencia y resultados",
                    audio: "Con resultados comprobados y tecnología madura",
                    duration: 15
                },
                {
                    number: 4,
                    visual: "Logo con mensaje final",
                    audio: "El futuro de la valorización de residuos está aquí",
                    duration: 15
                }
            ],
            duration: 60,
            style: template.emphasis,
            visualNotes: `Usar ${template.tone.toLowerCase()} como mood general`
        };
    }
}
