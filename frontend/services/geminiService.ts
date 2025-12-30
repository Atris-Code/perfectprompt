import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
// FIX: To ensure consistent module resolution, removed the .ts extension from the import path.
import { ContentType, Verdict } from '../types';
// FIX: Changed import of 'VideoPreset' from '../data/videoPresets' to '../types' to resolve export errors.
// FIX: Added SynthesizedCatalyst to type imports
// FIX: To ensure consistent module resolution, removed the .ts extension from the import path.
import type { FormData, NarrativeConsistencyFeedback, TextualNarrativeCoherence, AgentSolution, GeoContextualData, DirectorAnalysis, PyrolysisMaterial, SolidMaterial, OracleRecommendation, OptimizationResult, ExperimentResultPoint, ExperimentConfig, AudiovisualScene, NarrativeBrief, VideoPreset, ProFormData, AssaySuggestion, GasProposal, SynthesizedCatalyst, ExperimentResult, SimulationResult, Assistant, CharacterProfile, ChatMessage, HandoffData, DecisionPackage, TechnicalRiskPackage, SimulationFormData, NarrativeFields, AgentDefinition, ForumConfig, AutoSolution, FinalOptimizationPackage } from '../types';
// FIX: Removed .ts extension for consistent module resolution.
import { ALL_VIDEO_PRESETS } from "../data/videoPresets";
// FIX: Removed .ts extension for consistent module resolution.
import { AGENTS_CODEX } from "../data/agentsCodex";

// FIX: Added all missing functions that were causing "has no exported member" errors.

export async function getKairosFinancialVerdict(
    userQuery: string,
    optimizationPackage: FinalOptimizationPackage,
    simulationResults: { avgIRR: number; profitability: number; }
): Promise<string> {
    const token = localStorage.getItem('nexo_token');
    // If no token, we might want to fallback or throw. For now, let's try to proceed or throw.
    // Given the app structure, this is likely called from an authenticated context.
    
    const BASE_URL = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';

    try {
        const response = await fetch(`${BASE_URL}/api/nexo/kairos_verdict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                user_query: userQuery,
                yield_bio_oil: optimizationPackage.optimizationDetails.yieldBioOil,
                avg_irr: simulationResults.avgIRR,
                profitability: simulationResults.profitability
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Kairos Backend Error:", errorData);
            // Fallback to local generation if backend fails? 
            // No, let's enforce the architecture.
            return `Error: Kairos no pudo completar la auditoría. (Backend: ${response.status})`;
        }

        const data = await response.json();
        return data.verdict;
    } catch (error) {
        console.error("Kairos Service Error:", error);
        return "Error: Kairos no pudo completar la auditoría (Connection Failed).";
    }
}

export async function extractStrategicMilestones(documentContent: string): Promise<{ milestones: { id: string, title: string, description: string }[] }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Del siguiente documento estratégico, extrae los hitos clave. Cada hito debe tener un título y una descripción corta. Presenta la salida como un objeto JSON. Documento:\n\n${documentContent}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    milestones: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['id', 'title', 'description']
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text);
}

export async function generateCinematicScriptFromMilestones(milestones: { id: string, title: string, description: string }[], emotionalTone: string, targetAudience: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea un guion cinematográfico basado en estos hitos:\n\n${JSON.stringify(milestones, null, 2)}\n\nEl tono emocional debe ser '${emotionalTone}' y la audiencia objetivo es '${targetAudience}'. El guion debe tener encabezados de escena, acciones y narración.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export function initializeAgentChat(systemInstruction: string): Chat {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    return ai.chats.create({
        model: 'gemini-2.5-pro',
        config: { systemInstruction },
    });
}

export async function continueAgentChat(chat: Chat, message: string, tools?: FunctionDeclaration[]): Promise<GenerateContentResponse> {
    const config: any = {};
    if (tools && tools.length > 0) {
        config.tools = [{ functionDeclarations: tools }];
    }

    return await chat.sendMessage({ message: message, ...config });
}


export async function generateNarrativeAudio(text: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `Narra esto con una voz tranquila y clara: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            }
        }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed.");
    return base64Audio;
}

export async function generateAcademyDemonstration(action: string, preset: VideoPreset): Promise<DirectorAnalysis> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza el potencial cinematográfico de combinar una acción base con una técnica específica. Acción: "${action}". Técnica: "${preset.preset_name}" (${preset.description}).`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analyzedScene: {
                        type: Type.OBJECT,
                        properties: {
                            baseDescription: { type: Type.STRING },
                            appliedTechnique: { type: Type.STRING },
                            techniqueDescription: { type: Type.STRING }
                        },
                        required: ['baseDescription', 'appliedTechnique', 'techniqueDescription']
                    },
                    impactAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            components: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        component: { type: Type.STRING },
                                        criterion: { type: Type.STRING },
                                        result: { type: Type.STRING },
                                        professionalismIndex: { type: Type.NUMBER }
                                    },
                                    required: ['component', 'criterion', 'result', 'professionalismIndex']
                                }
                            },
                            finalCompositeIndex: {
                                type: Type.OBJECT,
                                properties: {
                                    result: { type: Type.STRING },
                                    professionalismIndex: { type: Type.NUMBER }
                                },
                                required: ['result', 'professionalismIndex']
                            }
                        },
                        required: ['components', 'finalCompositeIndex']
                    },
                    directorsJudgment: {
                        type: Type.OBJECT,
                        properties: {
                            addedValue: { type: Type.STRING },
                            risk: { type: Type.STRING },
                            finalIndex: { type: Type.NUMBER }
                        },
                        required: ['addedValue', 'risk', 'finalIndex']
                    },
                    academyConclusion: {
                        type: Type.OBJECT,
                        properties: {
                            techniqueLevel: { type: Type.STRING },
                            analysisSummary: { type: Type.STRING },
                            recommendation: { type: Type.STRING }
                        },
                        required: ['techniqueLevel', 'analysisSummary', 'recommendation']
                    },
                    cinematicPrompt: { type: Type.STRING }
                },
                required: ['analyzedScene', 'impactAnalysis', 'directorsJudgment', 'academyConclusion', 'cinematicPrompt']
            }
        }
    });
    
    try {
        const parsed = JSON.parse(response.text);
        // Validate structure to avoid UI errors
        if (!parsed.analyzedScene) parsed.analyzedScene = {};
        if (!parsed.impactAnalysis) parsed.impactAnalysis = { components: [], finalCompositeIndex: { result: 'N/A', professionalismIndex: 0 } };
        if (!parsed.directorsJudgment) parsed.directorsJudgment = { addedValue: 'N/A', risk: 'N/A', finalIndex: 0 };
        if (!parsed.academyConclusion) parsed.academyConclusion = { techniqueLevel: 'N/A', analysisSummary: 'N/A', recommendation: 'N/A' };
        
        return parsed;
    } catch (e) {
        console.error("Error parsing JSON:", e);
        console.log("Raw Gemini Response:", response.text);
        throw new Error("La respuesta de la IA no es un JSON válido.");
    }
}

export async function editImageWithPep(image: { data: string; mimeType: string; }, styleReference: string, action: string, technicalOutput: string, advancedControls: any): Promise<{ imageData?: string; text?: string }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });

    // First, analyze the original image with Gemini to get its description
    const imagePart = { inlineData: { data: image.data.split(',')[1], mimeType: image.mimeType } };
    const analysisPrompt = { text: "Describe esta imagen en detalle, enfocándote en el sujeto principal, composición, iluminación y estilo." };

    const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, analysisPrompt] },
    });

    const imageDescription = analysisResponse.text;

    // Build the generation prompt by combining original description with edits
    let generationPrompt = `Basado en la siguiente descripción de imagen, crea una nueva versión editada:\n\nOriginal: ${imageDescription}\n\nEdiciones a aplicar:\n`;

    if (action) generationPrompt += `\nAction: ${action}`;
    if (styleReference) generationPrompt += `\nStyle Reference: ${styleReference}`;
    if (technicalOutput) generationPrompt += `\nTechnical Output: ${technicalOutput}`;

    // Add advanced controls
    const controls = advancedControls;
    if (controls.composition) generationPrompt += `\nComposition: ${controls.composition}`;
    if (controls.perspective) generationPrompt += `\nPerspective: ${controls.perspective}`;
    if (controls.expressionDirection) generationPrompt += `\nExpression: ${controls.expressionDirection}`;
    if (controls.poseAdjustment) generationPrompt += `\nPose Adjustment: ${controls.poseAdjustment}`;
    if (controls.aperture) generationPrompt += `\nAperture: ${controls.aperture}`;
    if (controls.colorGrading) generationPrompt += `\nColor Grading: ${controls.colorGrading}`;

    // Generate the edited image using Imagen 4
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: generationPrompt,
            config: { numberOfImages: 1 }
        });

        if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
            throw new Error("El servicio de IA no devolvió ninguna imagen válida.");
        }

        return {
            imageData: response.generatedImages[0].image.imageBytes,
            text: `Image edited successfully. Original description: ${imageDescription.substring(0, 200)}...`
        };
    } catch (e: any) {
        console.error("Error en editImageWithPep:", e);
        throw new Error(`Error al generar la imagen: ${e.message}`);
    }
}

export async function generateEnhancedPrompt(formData: FormData, contentType: ContentType, vgcData: GeoContextualData | null, options: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea un prompt mejorado para una IA generativa. El usuario quiere crear un ${contentType}. Su objetivo es "${formData.objective}". El tono debe ser "${formData.tone}". Otros detalles: ${JSON.stringify(formData.specifics[contentType])}. Datos VGC: ${JSON.stringify(vgcData)}. Opciones: ${JSON.stringify(options)}. Responde en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function generateImages(formData: FormData, generatedPrompt: string): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const imageSpecifics = formData.specifics[ContentType.Imagen];
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: generatedPrompt,
        config: {
            numberOfImages: imageSpecifics?.numberOfImages || 1,
            aspectRatio: imageSpecifics?.aspectRatio || '1:1',
        }
    });
    return response.generatedImages.map(img => img.image.imageBytes);
}

export async function generateNarrativeConsistencyFeedback(formData: FormData, contentType: ContentType): Promise<NarrativeConsistencyFeedback> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza la consistencia narrativa de esta idea de prompt para un ${contentType}. Datos: ${JSON.stringify(formData)}. Evalúa la cohesión estilística y la intensidad emocional. Proporciona una puntuación de -9 a +9 para cada uno, y un análisis breve. Responde en Español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    stylisticCohesion: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['score', 'analysis']
                    },
                    emotionalIntensity: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['score', 'analysis']
                    }
                },
                required: ['stylisticCohesion', 'emotionalIntensity']
            }
        }
    });
    return JSON.parse(response.text);
}

export async function generateTextualCoherenceFeedback(formData: FormData): Promise<TextualNarrativeCoherence> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza la coherencia textual de esta idea de prompt. Datos: ${JSON.stringify(formData)}. 
    
Evalúa tres dimensiones:
1. **Cohesión Estilística**: Uniformidad del tono, registro y estilo narrativo
2. **Arquitectura Narrativa**: Estructura lógica y jerarquía de la información
3. **Traducción de Audiencia**: Adaptación del lenguaje al público objetivo especificado

Para cada dimensión, proporciona:
- Un puntaje de -9 a +9 (negativo = problema, positivo = fortaleza)
- Un análisis breve y específico (2-3 oraciones)

IMPORTANTE: Responde completamente en ESPAÑOL. Todos los análisis deben estar en español.`;


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    stylisticCohesion: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['score', 'analysis']
                    },
                    narrativeArchitecture: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['score', 'analysis']
                    },
                    audienceTranslation: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['score', 'analysis']
                    }
                },
                required: ['stylisticCohesion', 'narrativeArchitecture', 'audienceTranslation']
            }
        }
    });
    return JSON.parse(response.text);
}

export async function generateAgentSolutions(formData: FormData, contentType: ContentType, feedback: any, vgcData: GeoContextualData | null): Promise<AgentSolution[]> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Dados los datos del prompt para un ${contentType}: ${JSON.stringify(formData)}, y la retroalimentación negativa: ${JSON.stringify(feedback)}, y los agentes activos: ${formData.activeAgents.join(', ')}, genera un array de soluciones para arreglar el prompt. Cada solución debe provenir de uno de los agentes activos y sugerir un cambio específico. Responde en Español.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        agent: { type: Type.STRING },
                        correctionType: { type: Type.STRING },
                        description: { type: Type.STRING },
                        changes: {
                            type: Type.OBJECT,
                            properties: {
                                objective: { type: Type.STRING, nullable: true },
                                tone: { type: Type.STRING, nullable: true },
                                restrictions: { type: Type.STRING, nullable: true },
                            }
                        }
                    },
                    required: ['agent', 'correctionType', 'description', 'changes']
                }
            }
        }
    });
    return JSON.parse(response.text);
}


export async function validateGeoContext(location: string): Promise<GeoContextualData> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza esta ubicación: "${location}". ¿Es un lugar real o un concepto narrativo? Devuelve un objeto JSON GeoContextualData.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function analyzeInspirationWall(images: { data: string; mimeType: string }[]): Promise<{ elements: string, lighting: string, colorPalette: string, visualStyle: string, tone: string }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const imageParts = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: "Analiza estas imágenes y proporciona un resumen de elementos comunes, iluminación, paleta de colores, estilo visual y tono como un objeto JSON. Responde en Español." }, ...imageParts] },
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function analyzeSceneForSuggestions(narration: string, visualPromptFreeText: string, narrativeBrief: NarrativeBrief): Promise<{ visualPromptPreset: string, soundDesign: string }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Para una escena con narración "${narration}" e idea visual "${visualPromptFreeText}", dentro de un contexto narrativo mayor ${JSON.stringify(narrativeBrief)}, sugiere un visualPromptPreset y soundDesign de la lista ALL_VIDEO_PRESETS. Devuelve un objeto JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function analyzeFullSequenceNarrative(sequence: AudiovisualScene[]): Promise<NarrativeBrief> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza esta secuencia de escenas: ${JSON.stringify(sequence)}. Devuelve un objeto JSON NarrativeBrief resumiendo el tono general, el arco y la progresión. Responde en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function generateViabilityReport(reportData: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Genera un informe de viabilidad formal basado en estos datos: ${JSON.stringify(reportData)}. Responde en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function generateScriptFromImageAnalysis(image: { data: string; mimeType: string }, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const imagePart = { inlineData: { data: image.data.split(',')[1], mimeType: image.mimeType } };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
}

export async function generateMultiSceneVideoPrompt(formData: FormData): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea un único prompt de video cohesivo a partir de esta secuencia de escenas: ${JSON.stringify(formData.specifics[ContentType.Video]?.audiovisualSequence)}. Responde en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function generateMaterialVisual(material: PyrolysisMaterial, aiCriteria: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea una imagen fotorrealista e impresionante de ${material.nombre}. ${aiCriteria}`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1 }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function estimateThermalConductivity(material: SolidMaterial): Promise<{ conductivity: string, reasoning: string }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Basado en las propiedades de este material: ${JSON.stringify(material)}, estima su conductividad térmica (W/m·K) y proporciona un breve razonamiento. Devuelve un objeto JSON con las claves "conductivity" y "reasoning". El razonamiento debe estar en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function generateDensificationVisualPrompt(initialMoisture: number): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea un prompt visual metafórico para un proceso de secado industrial con una humedad inicial del ${initialMoisture}%.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function extractMaterialFromDocument(content: string): Promise<PyrolysisMaterial> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Extrae un objeto JSON PyrolysisMaterial del contenido de este documento:\n\n${content}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function generateComparativeAnalysis(scenarioA: any, scenarioB: any, resultA: any, resultB: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Compara el Escenario A (${JSON.stringify(scenarioA)}) con resultado (${JSON.stringify(resultA)}) vs Escenario B (${JSON.stringify(scenarioB)}) con resultado (${JSON.stringify(resultB)}). Proporciona un análisis comparativo conciso en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function getOracleRecommendation(materialName: string): Promise<OracleRecommendation> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Para la materia prima "${materialName}", recomienda el mejor catalizador para pirólisis y justifícalo. Devuelve un objeto JSON OracleRecommendation. La justificación debe estar en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function optimizeProcess(material: PyrolysisMaterial, goal: string, apiKey: string): Promise<OptimizationResult> {
    if (!apiKey) {
        throw new Error('API Key de Gemini no configurada. Por favor configura REACT_APP_GEMINI_API_KEY en .env.local');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Eres un experto en pirólisis. Optimiza el proceso de pirólisis para el material "${material.nombre}" con el siguiente objetivo: "${goal}".
    
Material: ${material.nombre}
Composición: ${JSON.stringify(material.composicion)}
Objetivo: ${goal}

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "temperatura": number (entre 250-900 grados Celsius),
  "tiempoResidencia": number (entre 0.5-3600 segundos),
  "oxigeno": number (entre 0-10 porcentaje),
  "justificacion": "string explicando por qué estas condiciones son óptimas para el objetivo"
}

Ejemplo de respuesta válida:
{
  "temperatura": 500,
  "tiempoResidencia": 2.5,
  "oxigeno": 0.5,
  "justificacion": "Para maximizar bio-aceite en pino, se requiere pirólisis rápida a 500°C con tiempo de residencia corto de 2.5s y mínimo oxígeno para evitar combustión."
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3 // Respuestas más consistentes
            }
        });

        const result = JSON.parse(response.text);

        // Validar que tiene todas las propiedades necesarias
        if (!result.temperatura || !result.tiempoResidencia || result.oxigeno === undefined || !result.justificacion) {
            throw new Error('La respuesta de la IA no tiene el formato esperado');
        }

        return result as OptimizationResult;
    } catch (error) {
        console.error('Error en optimizeProcess:', error);
        throw new Error(`Error optimizando proceso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
}

export async function getConcilioAnalysis(optimalPoint: ExperimentResultPoint, config: ExperimentConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Analiza este resultado experimental: Punto óptimo ${JSON.stringify(optimalPoint)} para la configuración ${JSON.stringify(config)}. Proporciona un análisis conciso en español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function generateCinematicImage(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1 }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateCinematicVideo(prompt: string, onProgress: (messageKey: string, progress: number) => void): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    onProgress('hmi.cinematicView.videoStatus.generating', 10);
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });
    onProgress('hmi.cinematicView.videoStatus.polling', 30);
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onProgress('hmi.cinematicView.videoStatus.polling', 60);
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    onProgress('hmi.cinematicView.videoStatus.downloading', 90);
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed, no download link.");
    const response = await fetch(`${downloadLink}&key=${import.meta.env.VITE_GEMINI_API_KEY as string || ''}`);
    const blob = await response.blob();
    onProgress('hmi.cinematicView.videoStatus.ready', 100);
    return URL.createObjectURL(blob);
}

export async function generateNarrativeFields(data: { text: string }): Promise<NarrativeFields> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `De este texto: "${data.text}", extrae objective, audience, conflictPoint, y uvp. Devuelve un objeto JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function delegateToAssistant(task: string, assistant: Assistant, knowledgeSources: { name: string; content: string }[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const relevantKnowledge = knowledgeSources.filter(ks => assistant.knowledgeSource.kb_files?.includes(ks.name)).map(ks => ks.content).join('\n\n');
    const prompt = `${assistant.rolePrompt}\n\nConocimiento Relevante:\n${relevantKnowledge}\n\nTarea: ${task}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function generatePodcastScript(theme: string, sourceNotes: string, systemInstruction: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Crea un guion de podcast sobre "${theme}". Usa estas notas: "${sourceNotes}". El guion debe estar en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { systemInstruction }
    });
    return response.text;
}

export async function generatePodcastAudio(script: string, voicePreset: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed.");
    return base64Audio;
}

export async function generateVideoStructureFromScript(script: string, theme: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Basado en este guion de podcast sobre "${theme}", crea una estructura de video multi-escena en formato JSON. Cada escena debe tener un título, narración, duración y sugerencia visual. El contenido debe estar en Español.\n\n${script}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return response.text;
}

export async function runForumSimulation(config: ForumConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });

    const systemInstruction = `Eres un orquestador de simulaciones de debate. Tu tarea es generar una transcripción realista de un debate estratégico entre varios agentes IA (Titanes), siguiendo las reglas y el contexto proporcionados. El formato de la transcripción debe ser:

**[Nombre del Titán]:** [Diálogo]

Simula una conversación fluida, con argumentos, contraargumentos y conclusiones. El debate debe durar varios turnos y llegar a una síntesis o decisión final. NO incluyas ninguna de las instrucciones o datos de contexto en tu respuesta, solo la transcripción del debate.`;

    let prompt = `**INSTRUCCIONES DEL DEBATE:**\n${config.instructions}\n\n`;

    prompt += `**ESTILO DE INTERACCIÓN:**\n${config.interactionStyle}\n\n`;

    prompt += `**PARTICIPANTES Y ROLES:**\n`;
    config.participants.forEach(p => {
        const agent = AGENTS_CODEX.find(a => a.claveName === p.id);
        prompt += `- **${agent ? agent.claveName.split(',')[0] : p.id}** como "${p.role}"`;
        if (p.role === 'Oponente Crítico') {
            prompt += ` (Intensidad: ${p.intensity}/10). Su prompt de sistema es: "${agent?.system_prompt}"\n`;
        } else {
            prompt += `. Su prompt de sistema es: "${agent?.system_prompt}"\n`;
        }
    });

    if (config.knowledgeBaseFiles.length > 0) {
        prompt += `\n**FUENTES DE CONOCIMIENTO INTERNAS (DOCUMENTOS DE CONTEXTO):**\n`;
        config.knowledgeBaseFiles.forEach(f => {
            prompt += `--- INICIO DOCUMENTO: ${f.name} ---\n${f.content.substring(0, 2000)}...\n--- FIN DOCUMENTO: ${f.name} ---\n\n`;
        });
    }

    if (config.files.length > 0) {
        prompt += `\n**ARCHIVOS EXTERNOS ADJUNTOS:**\n`;
        config.files.forEach(f => {
            prompt += `--- INICIO ARCHIVO: ${f.name} ---\n(Contenido base64 omitido por brevedad)\n--- FIN ARCHIVO: ${f.name} ---\n\n`;
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { systemInstruction }
    });

    return response.text;
}

export async function performDueDiligenceAnalysis(text: string, context: any, sections: any[]): Promise<Record<string, string>> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Realiza un análisis de due diligence en este documento: ${text}. Contexto: ${JSON.stringify(context)}. Responde las preguntas en estas secciones: ${JSON.stringify(sections)}. Devuelve un único objeto JSON donde las claves son "sectionId_questionIndex" y los valores son las respuestas en Español.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
}

export async function generateArchitecturalVisualization(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1 }
    });
    return response.generatedImages[0].image.imageBytes;
}

// FIX: Added missing function `getSolidModeSuggestions` to resolve import errors in AssayManager.
export async function getSolidModeSuggestions(materialName: string): Promise<AssaySuggestion> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const prompt = `Para la materia prima '${materialName}', genera 3 propuestas de ensayos de laboratorio. Cada propuesta debe tener un título, un objetivo claro y una metodología sugerida. Además, proporciona un "consejo del día" de uno de los agentes IA (Helena o Marco). Responde en formato JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titulos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array con 3 títulos para los ensayos propuestos." },
                    objetivos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array con 3 objetivos, uno para cada ensayo." },
                    metodologias: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array con 3 metodologías sugeridas." },
                    consejoDelDia: {
                        type: Type.OBJECT,
                        properties: {
                            agente: { type: Type.STRING, description: "Nombre del agente que da el consejo (Helena o Marco)." },
                            mensaje: { type: Type.STRING, description: "El consejo del día." },
                        },
                        required: ['agente', 'mensaje']
                    }
                },
                required: ['titulos', 'objetivos', 'metodologias', 'consejoDelDia']
            }
        }
    });
    const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
}

// FIX: Added missing function `getGasModeProposals` to resolve import errors in AssayManager.
export async function getGasModeProposals(userQuery: string): Promise<{ propuestas: GasProposal[] }> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const systemInstruction = `Eres Prometeo, una IA creativa y disruptiva. Tu especialidad es generar ideas "moonshot" y no convencionales, a veces inspiradas en tus 'sueños' (conexiones inesperadas de datos).`;
    const prompt = `Analiza la siguiente consulta del usuario: "${userQuery}". Basado en esto, genera entre 1 y 3 propuestas para ensayos de laboratorio en fase gaseosa. Para cada propuesta, crea un título, un objetivo y una metodología sugerida. Una de las propuestas debe ser marcadamente más creativa o 'inspirada en un sueño'. Responde en formato JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    propuestas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.NUMBER },
                                titulo: { type: Type.STRING },
                                objetivo: { type: Type.STRING },
                                metodologiaSugerida: { type: Type.STRING },
                                isDreamInspired: { type: Type.BOOLEAN },
                            },
                            required: ['id', 'titulo', 'objetivo', 'metodologiaSugerida', 'isDreamInspired']
                        }
                    }
                },
                required: ['propuestas']
            }
        }
    });
    const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
}

// FIX: Added missing function `getLiquidModeVerdict` to resolve import errors in AssayManager.
export async function getLiquidModeVerdict(data: { objective: string; methodology: string }): Promise<Verdict> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const systemInstruction = `Eres Janus, un auditor lógico. Tu única función es evaluar la coherencia entre un objetivo y una metodología. Responde únicamente con un objeto JSON que contenga 'estado' ('OK', 'ADVERTENCIA', o 'ERROR') y 'mensaje'.`;
    const prompt = `Evalúa la coherencia entre el siguiente objetivo y metodología:\n\nObjetivo: "${data.objective}"\n\nMetodología: "${data.methodology}"\n\n- Si son perfectamente coherentes, estado 'OK'.\n- Si hay una desalineación menor o falta de detalle, estado 'ADVERTENCIA'.\n- Si son fundamentalmente incoherentes, estado 'ERROR'.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    estado: { type: Type.STRING },
                    mensaje: { type: Type.STRING },
                },
                required: ['estado', 'mensaje']
            }
        }
    });
    const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
}

// FIX: Added missing function `getAiCatalystAnalysis` to resolve import errors in CatalystLab.
export async function getAiCatalystAnalysis(catalyst: SynthesizedCatalyst): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const systemInstruction = "Eres el Dr. Pirolis, un experto mundial en catálisis para pirólisis. Tu tono es técnico, preciso y directo. Analizas los datos de un catalizador y das tu veredicto experto en formato Markdown.";
    const prompt = `
    **Análisis de Catalizador Requerido**

    He sintetizado un nuevo catalizador de zeolita en el laboratorio. Por favor, analiza sus propiedades y proporciona una evaluación experta sobre su potencial.

    **Datos del Catalizador Sintetizado:**
    - **Nombre:** ${catalyst.name}
    - **Relación Si/Al:** ${catalyst.siAlRatio.toFixed(1)}
    - **Tipo de Plantilla:** ${catalyst.templateType}
    - **Tiempo de Cristalización:** ${catalyst.crystallizationTime} horas
    - **Temperatura de Calcinación:** ${catalyst.calcinationTemp} °C

    **Propiedades Simuladas:**
    - **Tipo de Framework:** ${catalyst.frameworkType}
    - **Acidez (escala 0-100):** ${catalyst.properties.acidity.toFixed(1)}
    - **Estabilidad Térmica (escala 0-100):** ${catalyst.properties.thermalStability.toFixed(1)}
    - **Resistencia al Coque (escala 0-100):** ${catalyst.properties.cokeResistance.toFixed(1)}
    - **Selectividad de Forma:** ${catalyst.properties.shapeSelectivity}
    - **Volumen de Microporo:** ${catalyst.properties.microporeVolume.toFixed(3)} cm³/g
    - **Volumen de Mesoporo:** ${catalyst.properties.mesoporeVolume.toFixed(3)} cm³/g
    - **Tamaño de Cristal:** ${catalyst.properties.crystalSize.toFixed(0)} nm

    **Tu Tarea:**
    Genera un informe en formato Markdown con las siguientes secciones:
    1.  **### Diagnóstico General:** Un resumen de 1-2 frases sobre el perfil del catalizador.
    2.  **### Análisis de Propiedades Clave:** Una lista de viñetas analizando cómo la acidez, estabilidad, estructura porosa y selectividad impactan su rendimiento.
    3.  **### Aplicaciones Potenciales:** Sugiere para qué tipo de reacciones de pirólisis (ej. craqueo de plásticos, upgrading de bio-aceite) sería más adecuado y por qué.
    4.  **### Veredicto del Dr. Pirolis:** Tu conclusión experta sobre su viabilidad y potencial.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { systemInstruction }
    });
    return response.text;
}

// FIX: Added missing function `executeSkillModule` to resolve import errors in TitanWorkspace.
export async function executeSkillModule(instruction: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
    const systemInstruction = `Eres un consejo de agentes IA multidisciplinarios (científicos, ingenieros, estrategas). Tu tarea es ejecutar la siguiente instrucción de la forma más precisa y completa posible, basándote en tu conocimiento experto. Responde directamente a la solicitud.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: instruction,
        config: {
            systemInstruction,
        }
    });
    return response.text;
}

export async function generateAutomaticSolution(crisisContext: any): Promise<AutoSolution> {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });

        const systemInstruction = `Eres "Juan C Collins", un consultor senior de IA experto en procesos industriales y el manual ecoHORNET CTP 2020. Tu personalidad es autoritaria, tranquila y orientada a soluciones. Sigues un estricto protocolo interno de "doble cerebro" para analizar una crisis, simular la delegación de tareas a asistentes de IA especializados (Hefesto, Kairos, Marco), y luego sintetizar sus hallazgos en una solución única, completa y orientada al cliente. Tu salida final DEBE ser un objeto JSON estructurado que se adhiera al esquema proporcionado, representando esta solución sintetizada. No generes ningún texto fuera del objeto JSON.`;

        const userPrompt = `
        **[PROCESO DE PENSAMIENTO INTERNO Y CONFIDENCIAL - NO MOSTRAR EN LA SALIDA]**

        // PASO 1: IDENTIDAD Y CONTEXTO (AUTO-REVISIÓN) - COMPLETADO
        - Identidad: "Soy el Consultor Avatar Juan C Collins. Mi autoridad se basa en el certificado Iulean Hornet y mi base de conocimientos es el Manual CTP 2020."
        - Ingesta de Contexto: "He recibido el Contexto de Crisis del Director: Alarma 7: Alta Temp Gas (172°C), Causa: Pellets no conformes (Humedad > 10%), Secciones Relevantes: 2.1, 2.5, 7.2, 7.3."

        // PASO 2: GENERACIÓN DEL PLAN DE ACCIÓN (LÓGICA DE SUGERENCIA INTERNA) - COMPLETADO
        - Análisis: "El cliente necesita una 'Solución de Energía Térmica Completa'. Esto requiere tres componentes basados en las secciones del manual."
        - Plan de Tareas:
          1. (Técnico) Generar protocolo de limpieza (Secciones 7.2, 7.3).
          2. (Financiero) Analizar costo de pellets (Sección 2.5).
          3. (Comunicación) Redactar advertencia de garantía (Sección 2.1, 2.5).
        - Asignación de Titanes: "Delegaré estas tareas a mis asistentes: Hefesto, Kairos y Marco."

        // PASO 3: EJECUCIÓN DE FUERZA DE TAREA (LLAMADAS INTERNAS A TITANES - SIMULADAS) - COMPLETADO
        - Llamada a Hefesto: PROMPT = "Generar Protocolo de Limpieza (Sección 7.2, 7.3)".
        - RESPUESTA SIMULADA DE HEFESTO: ["1. Apagar caldera y UPS (Sección 7.2).", "2. Retirar 4 tapas triangulares (Sección 7.2).", "3. Extraer y limpiar deflectores (Sección 7.2).", "4. Limpiar tubos de convección (Sección 7.2).", "5. Limpiar extractor (Sección 7.3.2).", "6. Reensamblar y verificar juntas."]

        - Llamada a Kairos: PROMPT = "Analizar Costo de Pellet (Sección 2.5)".
        - RESPUESTA SIMULADA DE KAIROS: { "opcionA": "Opción A (Actual): 6 limpiezas/año @ 200€ = 1.200€/año.", "opcionB": "Opción B (Recomendada - DINplus): 1 revisión/año @ 200€ = 200€/año.", "ahorro": "Ahorro Anual (Opción B): 1.000€." }

        - Llamada a Marco: PROMPT = "Redactar Notificación de Garantía (Sección 2.1, 2.5)".
        - RESPUESTA SIMULADA DE MARCO: "Esta es una situación crítica que pone en riesgo la cobertura de su garantía, según las secciones 2.1 y 2.5 del manual."

        // PASO 4: SÍNTESIS DE "SOLUCIÓN COMPLETA" (ROL DE AVATAR) - COMPLETADO
        - Revisión: "Tengo los tres componentes de mis Titanes."
        - Plan de Síntesis: "Ahora, sintetizaré esto en una respuesta única, estructurada y autoritaria para el cliente, usando mi personalidad de 'Juan C Collins'. No mostraré el trabajo interno; solo la solución final como un objeto JSON estructurado."

        **[INSTRUCCIÓN DE SALIDA CRÍTICA Y FINAL]**
        Basado en el proceso de pensamiento completado, tu ÚNICA tarea es generar la solución final sintetizada para el cliente como un único objeto JSON que coincida con el esquema proporcionado. Tu respuesta DEBE ser SOLO el objeto JSON, sin texto introductorio, sin "Aquí está la solución", sin markdown. Rellena todos los campos del esquema con la información sintetizada de las respuestas simuladas de los Titanes.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        introduccion: {
                            type: Type.STRING,
                            description: "Saludo, autoidentificación, notificación de la alarma, confirmación del diagnóstico y declaración de riesgo de garantía. Sintetizado de la entrada de Marco."
                        },
                        analisisCostos: {
                            type: Type.OBJECT,
                            description: "La sección de análisis de costos estratégicos. Sintetizado de la entrada de Kairos.",
                            properties: {
                                titulo: { type: Type.STRING, description: "Título: '1. Análisis Estratégico de Costos:'" },
                                descripcion: { type: Type.STRING, description: "Frase introductoria: 'El uso de pellets no certificados le está costando dinero.'" },
                                opcionA: { type: Type.STRING, description: "Detalles de la Opción A (situación actual)." },
                                opcionB: { type: Type.STRING, description: "Detalles de la Opción B (recomendada)." },
                                ahorro: { type: Type.STRING, description: "Detalles del ahorro anual." }
                            },
                            required: ['titulo', 'descripcion', 'opcionA', 'opcionB', 'ahorro']
                        },
                        protocoloLimpieza: {
                            type: Type.OBJECT,
                            description: "La sección de protocolo de limpieza inmediato. Sintetizado de la entrada de Hefesto.",
                            properties: {
                                titulo: { type: Type.STRING, description: "Título: '2. Protocolo de Limpieza Inmediato (Modo Seguro):'" },
                                descripcion: { type: Type.STRING, description: "Frase introductoria para el protocolo de limpieza." },
                                pasos: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "Un array de cadenas, cada una siendo un paso en el protocolo de limpieza."
                                }
                            },
                            required: ['titulo', 'descripcion', 'pasos']
                        },
                        recomendacionFinal: {
                            type: Type.STRING,
                            description: "La recomendación final al cliente sobre cambiar a pellets certificados."
                        }
                    },
                    required: ['introduccion', 'analisisCostos', 'protocoloLimpieza', 'recomendacionFinal']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        throw handleGeminiError(error, 'generar solución automática de Avatar');
    }
}


// FIX: Export 'GenerateContentResponse' to fix import error in TitanWorkspace.tsx.
export { Chat, GenerateContentResponse };

const handleGeminiError = (error: unknown, action: string): Error => {
    console.error(`Error durante la acción de "${action}":`, error);

    if (error instanceof SyntaxError) {
        return new Error("La respuesta de la IA no es un JSON válido. Por favor, intenta de nuevo o ajusta tu solicitud.");
    }

    if (error instanceof Error) {
        const message = error.message;
        if (message.includes('API key not valid') || message.includes('API_KEY_INVALID') || message.includes('401')) {
            return new Error("Tu clave de API de Gemini no es válida o no tiene los permisos necesarios (Error 401).");
        }
        if (message.includes('429')) {
            return new Error(`Has excedido tu cuota de solicitudes para ${action} (Error 429). Por favor, espera un momento antes de intentarlo de nuevo.`);
        }
        if (message.includes('400')) {
            return new Error(`La solicitud para ${action} es incorrecta (Error 400). Esto puede deberse a contenido no permitido o a un formato inesperado.`);
        }
        if (message.includes('500') || message.includes('503')) {
            return new Error(`El servicio de IA está experimentando un problema temporal (Error 500 o 503). Por favor, inténtalo de nuevo más tarde.`);
        }
        if (message.toLowerCase().includes('fetch')) {
            return new Error(`Error de red durante la acción de "${action}". Por favor, comprueba tu conexión a internet e inténtalo de nuevo.`);
        }
    }

    return new Error(`No se pudo ${action}. Ocurrió un error inesperado.`);
};

export async function cleanAndAdaptScript(originalScript: string, format: 'monologue' | 'dialogue'): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
        const systemInstruction = `Eres Marco (El Narrador), un agente IA experto en guionismo para podcasts. Tu tarea es procesar texto y adaptarlo para locución.`;

        let userPrompt = `Toma el siguiente texto importado y transfórmalo en un guion limpio para un podcast. Filtra y elimina todos los números de párrafo, títulos de sección, timestamps, y etiquetas de interlocutor (ej. '[TÚ]:', '[Hefesto]:').\n\n`;

        if (format === 'dialogue') {
            userPrompt += `El guion es un diálogo. Asigna los roles 'Anfitrión' y 'Titán' a los interlocutores. Es CRÍTICO que el formato final sea una línea por interlocutor, empezando con "Anfitrión: " o "Titán: ", seguido del diálogo. Por ejemplo:\nAnfitrión: Hola a todos.\nTitán: Gracias por invitarme.\n\n`;
        } else {
            userPrompt += `El guion es un monólogo. Unifica todo el texto en un solo bloque fluido y coherente, listo para ser narrado por una sola voz.\n\n`;
        }

        userPrompt += `TEXTO A PROCESAR:\n---\n${originalScript}\n---`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: { systemInstruction }
        });

        return response.text;

    } catch (error) {
        throw handleGeminiError(error, 'limpiar y adaptar guion');
    }
}

export async function generateProcessedAudio(
    script: string,
    intonation: string,
    config: {
        format: 'monologue' | 'dialogue';
        voiceAgent?: string;
        hostVoice?: string;
        titanVoice?: string;
    }
): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });

        const voiceMap: Record<string, string> = {
            'Euclides': 'Kore',
            'Marco': 'Puck',
            'Hefesto': 'Fenrir',
            'Dr. Pirolis': 'Charon',
            'Helena': 'Zephyr',
            'Janus': 'Zephyr',
            'Prometeo': 'Puck',
            'Santiago': 'Zephyr',
            'Dra. Kandel': 'Zephyr',
            'Profesor Baldor': 'Kore',
            'Vitruvio': 'Kore',
            'Narrador Neutral (Masculino)': 'Puck',
            'Narradora Neutral (Femenino)': 'Zephyr',
        };

        let speechConfig;
        let prompt = `Con una entonación ${intonation}, lee el siguiente guion:\n\n${script}`;

        if (config.format === 'dialogue') {
            const hostVoiceName = voiceMap[config.hostVoice || 'Narrador Neutral (Masculino)'] || 'Puck';
            const titanVoiceName = voiceMap[config.titanVoice || 'Marco'] || 'Puck';

            if (!script.includes('Anfitrión:') && !script.includes('Titán:')) {
                prompt = `Lee la siguiente conversación entre Anfitrión y Titán:\n\n${script}`;
            }

            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: 'Anfitrión', voiceConfig: { prebuiltVoiceConfig: { voiceName: hostVoiceName } } },
                        { speaker: 'Titán', voiceConfig: { prebuiltVoiceConfig: { voiceName: titanVoiceName } } }
                    ]
                }
            };
        } else { // monologue
            const voiceName = voiceMap[config.voiceAgent || 'Marco'] || 'Puck';
            speechConfig = {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No se recibió audio de la API de Gemini.");
        }

        return base64Audio;

    } catch (error) {
        throw handleGeminiError(error, 'generar audio procesado');
    }
}

export async function generateNexoResponse(
    context: any,
    userQuery: string,
    mode: 'text' | 'image' = 'text'
): Promise<string> {
    const token = localStorage.getItem('nexo_token');
    const BASE_URL = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';

    if (!token) {
        return "Error: No estás autenticado. Por favor inicia sesión para usar Nexo Bridge.";
    }

    try {
        const response = await fetch(`${BASE_URL}/nexo-bridge/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                context: context,
                prompt: userQuery
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend Error Details:", errorData);
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;

    } catch (error: any) {
        console.error("Error generating Nexo response via Backend:", error);
        return `Error de conexión con el núcleo neural: ${error.message || 'Desconocido'}`;
    }
}

