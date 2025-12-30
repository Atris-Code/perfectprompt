import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Accordion } from '../form/Accordion';
// FIX: Import 'FormInput' to resolve 'Cannot find name' errors.
import { FormSelect, FormInput } from '../form/FormControls';
import { analyzeViabilityTriggers, selectContentTemplate, generateTriggerSummary, type ProjectTag, type ContentTemplate } from '../../services/contentAutomation';
import { generateMultimediaContent, type MultimediaContent } from '../../services/multimediaGenerator';
import { MultimediaContentPanel } from './MultimediaContentPanel';

const ScoreGauge: React.FC<{ score: number; label: string; maxScore?: number }> = ({ score, label, maxScore = 100 }) => {
    const percentage = (score / maxScore) * 100;
    const color = percentage >= 75 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444';
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center text-center">
            <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
                <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold" fill={color}>
                    {score.toFixed(0)}
                </text>
            </svg>
            <span className="text-sm font-semibold mt-2 text-gray-600">{label}</span>
        </div>
    );
};

// CheckboxGroup component - defined outside to prevent re-render issues
const CheckboxGroup: React.FC<{
    name: string;
    options: string[];
    label: string;
    inputs: typeof initialInputs;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, options, label, inputs, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-2 space-y-2">
            {options.map(option => (
                <label key={option} className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name={name}
                        value={option}
                        checked={(inputs as any)[name].includes(option)}
                        onChange={onChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const initialInputs = {
    carbonBalance: 'Neutro',
    valorization: ['Energía'],
    contaminants: 'Bueno',
    conversionEfficiency: 75,
    capex: 100,
    opex: 30,
    scalability: ['Mediana'],
    feedstockIndependence: 'Media',
    trl: 7,
    compliance: ['UE'],
    operationEase: 'Estándar',
};

export const GlobalViabilityAssessor: React.FC = () => {
    const [inputs, setInputs] = useState(initialInputs);
    const [scores, setScores] = useState({ sustainability: 0, economics: 0, transferability: 0, global: 0 });
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedTags, setDetectedTags] = useState<ProjectTag[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
    const [multimediaContent, setMultimediaContent] = useState<MultimediaContent | null>(null);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            const { checked } = checkbox;
            setInputs(prev => {
                const currentArray = (prev as any)[name] as string[];
                return {
                    ...prev,
                    [name]: checked
                        ? [...currentArray, value]
                        : currentArray.filter((v: string) => v !== value)
                };
            });
        } else {
            setInputs(prev => ({
                ...prev,
                [name]: type === 'number' || type === 'range' ? Number(value) : value
            }));
        }
    };

    const calculateScores = useCallback(() => {
        // --- Sustainability Score ---
        const carbonMap: Record<string, number> = { 'Negativo': -10, 'Neutro': 0, 'Positivo Leve': 10, 'Positivo Alto': 20 };
        const valorizationScore = inputs.valorization.length * 10;
        const contaminantsMap: Record<string, number> = { 'Excelente': 20, 'Bueno': 10, 'Regular': 0, 'Deficiente': -10 };
        const efficiencyScore = Math.max(-20, Math.min(20, (inputs.conversionEfficiency - 75) * 2));
        const sustainabilityScore = carbonMap[inputs.carbonBalance] + valorizationScore + contaminantsMap[inputs.contaminants] + efficiencyScore;

        // --- Economics Score ---
        const capexScore = inputs.capex < 100 ? 20 : inputs.capex < 150 ? 10 : 0;
        const opexScore = inputs.opex < 30 ? 20 : inputs.opex < 50 ? 10 : 0;
        const scalabilityScore = inputs.scalability.length * 10;
        const feedstockMap: Record<string, number> = { 'Muy Baja': 20, 'Baja': 10, 'Media': 0, 'Alta': -10, 'Muy Alta': -20 };
        const economicsScore = capexScore + opexScore + scalabilityScore + feedstockMap[inputs.feedstockIndependence];

        // --- Transferability Score ---
        const trlScore = (inputs.trl - 7) * 10;
        const complianceScore = inputs.compliance.length * 10;
        const operationMap: Record<string, number> = { 'Estándar': 20, 'Moderada': 0, 'Alta': -10 };
        const transferabilityScore = trlScore + complianceScore + operationMap[inputs.operationEase];

        const normalize = (score: number, max: number) => Math.max(0, Math.min(100, (score / max) * 100));

        const finalSustainability = normalize(sustainabilityScore, 80);
        const finalEconomics = normalize(economicsScore, 90);
        const finalTransferability = normalize(transferabilityScore, 60);

        const globalScore = (finalSustainability + finalEconomics + finalTransferability) / 3;

        setScores({
            sustainability: finalSustainability,
            economics: finalEconomics,
            transferability: finalTransferability,
            global: globalScore
        });

    }, [inputs]);

    useEffect(() => {
        calculateScores();

        // Auto-detectar triggers cuando cambien inputs o scores
        const tags = analyzeViabilityTriggers(inputs, scores);
        setDetectedTags(tags);

        const template = selectContentTemplate(tags, scores);
        setSelectedTemplate(template);
    }, [calculateScores, inputs, scores]);

    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        setAiAnalysis('');
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
            const prompt = `
            Eres un consultor experto en tecnologías de valorización de residuos. Analiza la siguiente tecnología basada en los parámetros proporcionados por el usuario.
            Proporciona un resumen conciso de sus fortalezas y debilidades clave en formato de viñetas (una lista para fortalezas y otra para debilidades). Sé directo y profesional.

            Parámetros de la Tecnología:
            - **Sostenibilidad Ambiental**:
              - Balance de Carbono: ${inputs.carbonBalance}
              - Productos Valorizados: ${inputs.valorization.join(', ') || 'Ninguno'}
              - Manejo de Contaminantes: ${inputs.contaminants}
              - Eficiencia de Conversión: ${inputs.conversionEfficiency}%
            - **Viabilidad Económica**:
              - Costo de Capital (CAPEX): ${inputs.capex} €/ton
              - Costo Operacional (OPEX): ${inputs.opex} €/ton
              - Escalabilidad: ${inputs.scalability.join(', ') || 'No especificada'}
              - Dependencia de Materia Prima: ${inputs.feedstockIndependence}
            - **Transferibilidad y Aceptación**:
              - Madurez Tecnológica (TRL): ${inputs.trl}
              - Cumplimiento Normativo: ${inputs.compliance.join(', ') || 'No especificado'}
              - Facilidad de Operación: ${inputs.operationEase}

            Basado en estos datos, genera el análisis de fortalezas y debilidades.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            setAiAnalysis(response.text);
        } catch (error) {
            setAiAnalysis("Error al contactar al servicio de IA. Por favor, inténtalo de nuevo.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateMultimedia = async () => {
        if (!aiAnalysis || !selectedTemplate) {
            alert('Primero genera el análisis de fortalezas y debilidades');
            return;
        }

        setIsGeneratingContent(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string || '';
            const content = await generateMultimediaContent(aiAnalysis, selectedTemplate, apiKey);
            setMultimediaContent(content);
        } catch (error) {
            alert('Error al generar contenido multimedia. Por favor, inténtalo de nuevo.');
            console.error(error);
        } finally {
            setIsGeneratingContent(false);
        }
    };

    const handleCopyContent = (text: string) => {
        navigator.clipboard.writeText(text);
    };


    // CheckboxGroup now defined outside component

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Evaluador de Viabilidad Global de Tecnologías de Residuos</h2>
                <p className="mt-2 text-md text-gray-600">Puntúa una tecnología para obtener una valoración instantánea de su potencial.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <Accordion title="Sostenibilidad Ambiental y Eficiencia Técnica" defaultOpen>
                        <FormSelect label="Balance de Carbono" name="carbonBalance" value={inputs.carbonBalance} onChange={handleInputChange}>
                            <option>Negativo</option><option>Neutro</option><option>Positivo Leve</option><option>Positivo Alto</option>
                        </FormSelect>
                        <CheckboxGroup name="valorization" label="Valorización de Productos" options={['Energía', 'Biochar', 'Biofertilizantes', 'Químicos']} inputs={inputs} onChange={handleInputChange} />
                        <FormSelect label="Manejo de Contaminantes" name="contaminants" value={inputs.contaminants} onChange={handleInputChange}>
                            <option>Excelente</option><option>Bueno</option><option>Regular</option><option>Deficiente</option>
                        </FormSelect>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Eficiencia de Conversión ({inputs.conversionEfficiency}%)</label>
                            <input type="range" name="conversionEfficiency" min="0" max="100" value={inputs.conversionEfficiency} onChange={handleInputChange} className="w-full" />
                        </div>
                    </Accordion>
                    <Accordion title="Viabilidad Económica y Escala" defaultOpen>
                        <FormInput label="Costo de Capital (CAPEX - €/ton capacidad anual)" name="capex" type="number" value={inputs.capex} onChange={handleInputChange} />
                        <FormInput label="Costo Operacional (OPEX - €/ton procesado)" name="opex" type="number" value={inputs.opex} onChange={handleInputChange} />
                        <CheckboxGroup name="scalability" label="Escalabilidad" options={['Pequeña', 'Mediana', 'Grande']} inputs={inputs} onChange={handleInputChange} />
                        <FormSelect label="Independencia Materia Prima" name="feedstockIndependence" value={inputs.feedstockIndependence} onChange={handleInputChange}>
                            <option>Muy Baja</option><option>Baja</option><option>Media</option><option>Alta</option><option>Muy Alta</option>
                        </FormSelect>
                    </Accordion>
                    <Accordion title="Transferibilidad y Aceptación" defaultOpen>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Madurez Tecnológica (TRL): {inputs.trl}</label>
                            <input type="range" name="trl" min="1" max="9" value={inputs.trl} onChange={handleInputChange} className="w-full" />
                        </div>
                        <CheckboxGroup name="compliance" label="Cumplimiento Normativo" options={['UE', 'EEUU', 'China', 'Otras']} inputs={inputs} onChange={handleInputChange} />
                        <FormSelect label="Facilidad de Operación" name="operationEase" value={inputs.operationEase} onChange={handleInputChange}>
                            <option>Estándar</option><option>Moderada</option><option>Alta</option>
                        </FormSelect>
                    </Accordion>
                </div>
                <div className="sticky top-8">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-center mb-6">Panel de Resultados</h3>
                        <div className="flex justify-around items-center mb-8">
                            <ScoreGauge score={scores.sustainability} label="Ambiental" />
                            <ScoreGauge score={scores.economics} label="Económica" />
                            <ScoreGauge score={scores.transferability} label="Transferibilidad" />
                        </div>
                        <div className="text-center mb-6">
                            <h4 className="text-lg font-semibold text-gray-700">Puntuación Global de Viabilidad</h4>
                            <ScoreGauge score={scores.global} label="Global" />
                        </div>

                        {/* Template Recomendado Section */}
                        {selectedTemplate && detectedTags.length > 0 && (
                            <div className="pt-6 border-t">
                                <h4 className="text-lg font-semibold text-gray-700 mb-3">🎯 Template Recomendado</h4>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-blue-900">{selectedTemplate.name}</span>
                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                            Auto-seleccionado
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-3">
                                        <strong>Tono:</strong> {selectedTemplate.tone}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-3">
                                        <strong>Énfasis:</strong> {selectedTemplate.emphasis}
                                    </p>

                                    {/* Tags Detectados */}
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Características Detectadas:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {detectedTags.map(tag => {
                                                const tagEmojis: Record<string, string> = {
                                                    'High_Sustainability_Potential': '🌿',
                                                    'Low_Tech_Risk': '✅',
                                                    'High_Efficiency': '⚡',
                                                    'High_Scalability': '📈',
                                                    'Eco_Friendly': '♻️',
                                                    'Economic_Viable': '💰',
                                                    'Regulatory_Compliant': '📋',
                                                    'Easy_Operation': '🔧'
                                                };
                                                const tagNames: Record<string, string> = {
                                                    'High_Sustainability_Potential': 'Alta Sostenibilidad',
                                                    'Low_Tech_Risk': 'Bajo Riesgo Tech',
                                                    'High_Efficiency': 'Alta Eficiencia',
                                                    'High_Scalability': 'Escalable',
                                                    'Eco_Friendly': 'Eco-Amigable',
                                                    'Economic_Viable': 'Viable Econ.',
                                                    'Regulatory_Compliant': 'Cumple Normas',
                                                    'Easy_Operation': 'Fácil Operación'
                                                };
                                                return (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded-full text-xs font-medium text-blue-900"
                                                    >
                                                        <span>{tagEmojis[tag]}</span>
                                                        <span>{tagNames[tag]}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Análisis por IA</h4>
                            <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                {isAnalyzing ? 'Analizando...' : 'Generar Resumen de Fortalezas y Debilidades'}
                            </button>
                            {aiAnalysis && (
                                <div className="mt-4">
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(aiAnalysis);
                                                const btn = document.activeElement as HTMLButtonElement;
                                                const originalText = btn.textContent;
                                                btn.textContent = '✓ Copiado';
                                                setTimeout(() => {
                                                    btn.textContent = originalText || '📋 Copiar';
                                                }, 2000);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            📋 Copiar
                                        </button>
                                    </div>
                                    <div className="p-4 bg-white border rounded-md text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                                        {aiAnalysis}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generador de Contenido Multimedia */}
                        {aiAnalysis && selectedTemplate && (
                            <div className="pt-6 border-t">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">🎬 Contenido Multimedia</h4>
                                <button
                                    onClick={handleGenerateMultimedia}
                                    disabled={isGeneratingContent}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-md hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg"
                                >
                                    {isGeneratingContent ? '⏳ Generando...' : '🚀 Generar Contenido Multimedia (Documento + Infografía + Video)'}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Genera automáticamente: Documento técnico, Prompt para infografía y Guion de video
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Multimedia Content Panel (Full Width Below) */}
            {multimediaContent && (
                <div className="mt-8">
                    <MultimediaContentPanel
                        content={multimediaContent}
                        onCopy={handleCopyContent}
                    />
                </div>
            )}
        </div>
    );
};