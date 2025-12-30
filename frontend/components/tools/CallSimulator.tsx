

import React, { useState, useCallback, useMemo } from 'react';
import type { Task, View } from '../../types';
import { ContentType, EventType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';
import { Accordion } from '../form/Accordion';
import { FormInput, FormTextarea, FormSelect } from '../form/FormControls';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CallSimulatorProps {
    onSaveTask: (task: Task, navigate?: boolean) => void;
    setView: (view: View) => void;
    onNavigateToForum: (context: { instructions: string; files: { name: string; content: string }[] }) => void;
}

const BOLIVIA_CALL_TEXT = `
CONVOCATORIA PÚBLICA PARA PROYECTOS DE ENERGÍAS RENOVABLES - ESTADO PLURINACIONAL DE BOLIVIA

1. OBJETIVO:
Fomentar el desarrollo e implementación de proyectos de generación de energía a partir de fuentes renovables no convencionales (solar, eólica, biomasa) para diversificar la matriz energética nacional, reducir la dependencia de combustibles fósiles y mitigar el cambio climático.

2. ÁREAS PRIORITARIAS:
- Proyectos solares fotovoltaicos en el Altiplano.
- Proyectos eólicos en la región de Santa Cruz.
- Proyectos de aprovechamiento de biomasa residual agrícola en el oriente boliviano.

3. CRITERIOS DE EVALUACIÓN:
- Innovación Tecnológica (25%): Grado de novedad y eficiencia de la tecnología propuesta.
- Viabilidad Económica y Financiera (30%): Sostenibilidad del modelo de negocio, análisis de costos y proyecciones de retorno.
- Impacto Ambiental y Social (20%): Contribución a la reducción de emisiones, generación de empleo local y beneficios para la comunidad.
- Equipo y Experiencia (15%): Capacidad técnica y de gestión del equipo proponente.
- Alineación con la Estrategia Nacional (10%): Coherencia con los planes energéticos del país.

4. FINANCIAMIENTO:
Se otorgará financiamiento de hasta el 70% del costo total del proyecto, con un monto máximo de $5,000,000 USD.

5. PRESENTACIÓN DE PROPUESTAS:
Las propuestas deben ser presentadas en formato digital (PDF) antes del 31 de Diciembre de 2024.
`;

const EVALUATION_CRITERIA_TEMPLATE = [
    { name: 'Innovación Tecnológica', score: 0, justification: '', weight: 25 },
    { name: 'Viabilidad Económica', score: 0, justification: '', weight: 30 },
    { name: 'Impacto Ambiental y Social', score: 0, justification: '', weight: 20 },
    { name: 'Equipo y Experiencia', score: 0, justification: '', weight: 15 },
    { name: 'Alineación Estratégica', score: 0, justification: '', weight: 10 },
];

const PROJECT_DATA_TEMPLATE = {
    title: 'Planta de Pirólisis de Biomasa Agrícola en Santa Cruz',
    summary: 'Desarrollo de una planta modular de pirólisis para convertir residuos de soja y caña en biochar y bio-aceite, generando energía y mejorando la calidad del suelo.',
    objectives: '1. Valorizar 10,000 ton/año de biomasa residual.\n2. Producir 3,000 ton/año de biochar.\n3. Generar 2 MW de energía a partir de syngas.',
    techApproach: 'Se utilizarán reactores de pirólisis rápida de lecho fluidizado, optimizados para la materia prima local. El proceso será autosostenible energéticamente.',
    budget: '5,000,000 USD',
    team: 'Equipo multidisciplinario con experiencia en ingeniería química, agronomía y finanzas.',
};

export const CallSimulator: React.FC<CallSimulatorProps> = ({ onSaveTask, setView, onNavigateToForum }) => {
    const { t } = useTranslations();
    const [step, setStep] = useState(1);
    const [callDocument, setCallDocument] = useState<{ name: string; content: string } | null>(null);
    const [projectData, setProjectData] = useState({ title: '', summary: '', objectives: '', techApproach: '', budget: '', team: '' });
    const [evaluationCriteria, setEvaluationCriteria] = useState(EVALUATION_CRITERIA_TEMPLATE);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setError('');
        setIsLoading(true);

        try {
            if (file.type === 'application/pdf') {
                if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    throw new Error("La librería PDF.js no se ha cargado correctamente.");
                }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ');
                }
                setCallDocument({ name: file.name, content: fullText });
            } else {
                 throw new Error('Formato de archivo no soportado. Por favor, sube un PDF.');
            }
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUseTemplate = () => {
        setCallDocument({ name: 'Plantilla_Bolivia.txt', content: BOLIVIA_CALL_TEXT });
    };

    const handleProjectDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImportProjectData = () => {
        setProjectData(PROJECT_DATA_TEMPLATE);
    };

    const handleSimulateEvaluation = (index: number) => {
        // This simulates an AI call.
        const simulatedScores = [7, 8, 9, 6, 10];
        const simulatedJustifications = [
            "La tecnología de pirólisis rápida es innovadora pero el TRL es 7, lo que introduce un riesgo moderado. Puntuación: 7/10.",
            "El modelo financiero es sólido, con un ROI proyectado atractivo. Sin embargo, la dependencia del precio de los commodities es alta. Puntuación: 8/10.",
            "El proyecto tiene un alto impacto positivo, secuestrando carbono y valorizando residuos. Se necesita un plan de participación comunitaria más detallado. Puntuación: 9/10.",
            "El equipo técnico es fuerte, pero falta experiencia específica en operaciones a gran escala en Bolivia. Puntuación: 6/10.",
            "Alineación perfecta con las prioridades de biomasa y la estrategia de economía circular del país. Puntuación: 10/10.",
        ];

        setEvaluationCriteria(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, score: simulatedScores[index], justification: simulatedJustifications[index] };
            }
            return item;
        }));
    };
    
    const handleCriteriaChange = (index: number, field: 'score' | 'justification', value: string | number) => {
        setEvaluationCriteria(prev => prev.map((item, i) => {
            if (i !== index) return item;
    
            // FIX: Explicitly handle the two cases for 'field' to satisfy TypeScript's strictness.
            if (field === 'score') {
                const score = Math.max(0, Math.min(10, Number(value)));
                return { ...item, score };
            } else { // field === 'justification'
                return { ...item, justification: String(value) };
            }
        }));
    };

    const weightedScore = useMemo(() => {
        const total = evaluationCriteria.reduce((sum, item) => sum + (item.score / 10 * item.weight), 0);
        return total.toFixed(1);
    }, [evaluationCriteria]);

    const radarChartData = useMemo(() => {
        return evaluationCriteria.map(item => ({
            subject: item.name,
            score: item.score,
            fullMark: 10
        }));
    }, [evaluationCriteria]);

    const handleDiscussInForum = () => {
        const projectSummary = `
# Propuesta de Proyecto: ${projectData.title}
## Resumen
${projectData.summary}
## Objetivos
${projectData.objectives}
## Enfoque Técnico
${projectData.techApproach}
        `.trim();

        const evaluationSummary = `
# Matriz de Evaluación
${evaluationCriteria.map(c => `## ${c.name}\n- Puntuación: ${c.score}/10\n- Justificación: ${c.justification}`).join('\n\n')}
**Puntuación Ponderada Total: ${weightedScore} / 100**
        `.trim();

        onNavigateToForum({
            instructions: `Discutan la siguiente propuesta de proyecto y su matriz de evaluación. El objetivo es identificar las debilidades clave y proponer mejoras concretas para aumentar la puntuación ponderada por encima de 85/100. Enfóquense en el criterio con la puntuación más baja: 'Equipo y Experiencia'.`,
            files: [
                { name: 'resumen_propuesta.md', content: projectSummary },
                { name: 'matriz_evaluacion.md', content: evaluationSummary }
            ]
        });
    };

    const handleGenerateDraft = () => {
        const task: Task = {
            id: `call-draft-${Date.now()}`,
            title: `Borrador Propuesta: ${projectData.title}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'CallForProposalDraft',
            formData: {
                objective: `Generar un borrador completo de propuesta para la convocatoria '${callDocument?.name || 'convocatoria energética'}' basado en los datos del proyecto.`,
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Pitch de Inversión (Llamada a la Acción)',
                        audience: 'Comité de Evaluación de Convocatorias',
                        rawData: `
                        Título del Proyecto: ${projectData.title}
                        Resumen: ${projectData.summary}
                        Objetivos: ${projectData.objectives}
                        Enfoque Técnico: ${projectData.techApproach}
                        Presupuesto: ${projectData.budget}
                        Equipo: ${projectData.team}
                        
                        Criterios de Evaluación y Puntuaciones:
                        ${evaluationCriteria.map(c => `- ${c.name}: ${c.score}/10`).join('\n')}
                        Puntuación Total: ${weightedScore}/100
                        `,
                    },
                    [ContentType.Imagen]: {}, [ContentType.Video]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {},
                }
            },
            isIntelligent: true,
            agentId: 'Helena, la Estratega'
        };
        onSaveTask(task, true);
    };

    const steps = ["Cargar Convocatoria", "Definir Proyecto", "Evaluar Criterios", "Análisis y Sinergia"];

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Simulador de Respuesta a Convocatorias</h2>
                <p className="mt-2 text-md text-gray-600">Analiza convocatorias, define tu proyecto y evalúa tus posibilidades.</p>
            </header>
            
            <div className="mb-8">
                <ol className="flex items-center w-full">
                    {steps.map((stepName, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = step > stepNumber;
                        const isCurrent = step === stepNumber;
                        return (
                            <li key={stepName} className={`flex w-full items-center ${stepNumber < steps.length ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block " : ""} ${isCompleted || isCurrent ? "after:border-blue-600" : "after:border-gray-200"}`}>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isCurrent ? 'bg-blue-600 text-white' : isCompleted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <span className="font-bold">{stepNumber}</span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="mt-8">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center">Paso 1: Cargar Documento de la Convocatoria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subir archivo (PDF)</label>
                                <input type="file" onChange={handleFileChange} accept=".pdf" className="mt-1 block w-full text-sm"/>
                                {isLoading && <p>Procesando PDF...</p>}
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <p className="text-center text-sm my-2">O</p>
                                <button onClick={handleUseTemplate} className="w-full bg-gray-200 py-2 rounded">Usar plantilla de ejemplo (Convocatoria Bolivia)</button>
                            </div>
                            <FormTextarea label="Contenido Extraído" value={callDocument?.content || ''} readOnly rows={15} className="bg-gray-50"/>
                        </div>
                        <div className="text-right">
                            <button onClick={() => setStep(2)} disabled={!callDocument} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Siguiente</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                     <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center">Paso 2: Definir la Propuesta del Proyecto</h3>
                        <div className="text-right mb-4"><button onClick={handleImportProjectData} className="bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg text-sm">Cargar Datos de Proyecto de Ejemplo</button></div>
                        <div className="space-y-4">
                            <FormInput label="Título del Proyecto" name="title" value={projectData.title} onChange={handleProjectDataChange} />
                            <FormTextarea label="Resumen Ejecutivo" name="summary" value={projectData.summary} onChange={handleProjectDataChange} rows={3} />
                            <FormTextarea label="Objetivos Principales" name="objectives" value={projectData.objectives} onChange={handleProjectDataChange} rows={3} />
                            <FormTextarea label="Enfoque Técnico" name="techApproach" value={projectData.techApproach} onChange={handleProjectDataChange} rows={4} />
                            <FormInput label="Presupuesto Estimado" name="budget" value={projectData.budget} onChange={handleProjectDataChange} />
                            <FormTextarea label="Equipo y Experiencia" name="team" value={projectData.team} onChange={handleProjectDataChange} rows={2} />
                        </div>
                         <div className="flex justify-between">
                            <button onClick={() => setStep(1)} className="bg-gray-200 py-2 px-6 rounded-lg">Anterior</button>
                            <button onClick={() => setStep(3)} disabled={!projectData.title} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">Siguiente</button>
                        </div>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold text-center">Paso 3: Simular Evaluación de Criterios</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                {evaluationCriteria.map((item, index) => (
                                    <div key={item.name} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <label className="font-semibold">{item.name} ({item.weight}%)</label>
                                            <button onClick={() => handleSimulateEvaluation(index)} className="bg-blue-100 text-blue-800 text-xs font-bold py-1 px-2 rounded">Evaluar con IA</button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="range" min="0" max="10" value={item.score} onChange={e => handleCriteriaChange(index, 'score', e.target.value)} className="w-full" />
                                            <span className="font-bold text-lg w-12 text-center">{item.score}</span>
                                        </div>
                                        <textarea value={item.justification} onChange={e => handleCriteriaChange(index, 'justification', e.target.value)} rows={2} className="w-full p-2 border rounded mt-2 text-sm bg-gray-50" placeholder="Justificación..."/>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width="100%" height={400}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                                        <Radar name="Puntuación" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                                <p className="text-center font-bold text-xl mt-4">Puntuación Ponderada Final: {weightedScore} / 100</p>
                            </div>
                        </div>
                         <div className="flex justify-between mt-4">
                            <button onClick={() => setStep(2)} className="bg-gray-200 py-2 px-6 rounded-lg">Anterior</button>
                            <button onClick={() => setStep(4)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Siguiente</button>
                        </div>
                    </div>
                )}
                
                {step === 4 && (
                     <div className="space-y-6 animate-fade-in text-center">
                        <h3 className="text-xl font-semibold">Paso 4: Análisis Final y Sinergia</h3>
                        <p className="text-lg">Tu propuesta ha sido evaluada con una puntuación de <strong className="text-blue-600 text-2xl">{weightedScore}</strong> sobre 100.</p>
                        <p>¿Qué quieres hacer ahora?</p>
                        <div className="flex justify-center gap-6 pt-4">
                            <button onClick={handleDiscussInForum} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-lg">Discutir en Forum de Titanes</button>
                            <button onClick={handleGenerateDraft} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg">Generar Borrador de Propuesta</button>
                        </div>
                        <div className="mt-8">
                           <button onClick={() => setStep(3)} className="bg-gray-200 py-2 px-6 rounded-lg">Volver a Evaluación</button>
                        </div>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};