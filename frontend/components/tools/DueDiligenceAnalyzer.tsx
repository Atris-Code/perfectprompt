import React, { useState, useCallback } from 'react';
import { Accordion } from '../form/Accordion';
import { FormInput, FormTextarea, FormSelect } from '../form/FormControls';
import type { Task } from '../../types';
import { ContentType, EventType } from '../../types';
import { performDueDiligenceAnalysis } from '../../services/geminiService';

const SECTIONS = [
    { id: 'deconstruction', title: 'Sección 1: Deconstrucción de la Propuesta Central', questions: ['¿Cuál es la propuesta de valor declarada?', '¿Cuáles son los activos/pasivos (tangibles e intangibles)?', '¿Qué validación de producto existe?', '¿Cuál es el plan de inversión y asignación presupuestaria propuesto?', '¿Qué estructura de retorno se ofrece?', '¿Cuáles son las debilidades no declaradas o supuestos implícitos (especialmente financieros/estratégicos)?'] },
    { id: 'market_analysis', title: 'Sección 2: Análisis del Mercado Objetivo', questions: ['¿Cuál es el perfil del consumidor (valores, estética, poder adquisitivo)?', '¿Hay demanda de transparencia/trazabilidad?', '¿Existe una brecha actitud-comportamiento?', '¿Qué importancia tienen las certificaciones?', '¿Cómo puede la "historia de origen" ser un diferenciador?'] },
    { id: 'competitive_landscape', title: 'Sección 3: Panorama Competitivo', questions: ['¿Quiénes son los competidores clave?', '¿Cuáles son sus puntos de precio y propuesta de valor?', '¿Cómo se compara la estética/materiales de la propuesta con la competencia?', '¿Cuál es el nicho de diferenciación claro?', '¿La estrategia de precios propuesta es viable y coherente con el posicionamiento?'] },
    { id: 'financial_modeling', title: 'Sección 4: Modelado Financiero Realista', questions: ['¿Cuál es el costo de producción unitario?', '¿Cuáles son los costos de aterrizaje estimados (flete, aranceles, IVA) para el mercado objetivo?', '¿Cuál es el CAC benchmark para este sector/mercado?', '¿El presupuesto de marketing es suficiente para alcanzar una masa crítica inicial?', '¿Cuál es el margen de contribución real por unidad/cliente?', '¿Cuál es la proyección de rentabilidad y ROI realista (considerando todos los costos)?'] },
    { id: 'operational_roadmap', title: 'Sección 5: Hoja de Ruta Operativa', questions: ['¿Se abordan los requisitos legales/aduaneros (ej. EORI)?', '¿Se ha definido la infraestructura logística (incluyendo devoluciones)?', '¿Se ha considerado la infraestructura de pagos local?', '¿La estrategia de canales (D2C, marketplaces, físico) es coherente y viable?', '¿Se ha localizado adecuadamente el mensaje de marca y la estrategia de marketing?'] },
    { id: 'risk_assessment', title: 'Sección 6: Evaluación de Riesgos', questions: ['Resumir los principales riesgos: Financieros, Operativos, de Mercado, de Ejecución, Cambiario, etc.'] },
    { id: 'verdict_conditions', title: 'Sección 7: Veredicto y Condiciones', questions: ['¿Cuál es la recomendación final (Rechazar, Aprobar, Condicional)?', 'Si es condicional, ¿cuáles son las condiciones específicas (presupuesto revisado, cambio de estrategia, reestructuración del acuerdo, soporte operativo)?'] },
    { id: 'results_evaluation', title: 'Sección 8: Análisis y Evaluación de Resultados', questions: ['¿Cuáles son los principales hallazgos y conclusiones del análisis?', '¿Cómo se comparan los resultados con las expectativas iniciales de la propuesta?', '¿Qué métricas clave (KPIs) se deben monitorear para evaluar el éxito?', '¿Cuál es el veredicto final sobre la viabilidad y el potencial del proyecto?'] }
];

interface DueDiligenceAnalyzerProps {
    onSaveTask: (task: Task) => void;
}

export const DueDiligenceAnalyzer: React.FC<DueDiligenceAnalyzerProps> = ({ onSaveTask }) => {
    const [proposalText, setProposalText] = useState('');
    const [document, setDocument] = useState<{ name: string; content: string } | null>(null);
    const [context, setContext] = useState<Record<string, string>>({
        projectName: '', sector: '', market: '', proposalType: '', investment: ''
    });
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<'assisted' | 'ia'>('assisted');
    const [generatedReport, setGeneratedReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClearAnalysis = useCallback(() => {
        setProposalText('');
        setDocument(null);
        setContext({ projectName: '', sector: '', market: '', proposalType: '', investment: '' });
        setAnswers({});
        setGeneratedReport('');
        setError('');
        // FIX: Use the global document object to get the element by ID.
        const fileInput = window.document.getElementById('due-diligence-file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setError('');
        setIsLoading(true);

        let content = '';
        try {
            if (file.type === 'application/pdf') {
                if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    throw new Error("La librería PDF.js no se ha cargado correctamente.");
                }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    content += textContent.items.map((item: any) => item.str).join(' ');
                }
            } else if (file.type.startsWith('text/')) {
                content = await file.text();
            } else {
                throw new Error('Formato de archivo no soportado. Por favor, sube PDF o TXT.');
            }
            setDocument({ name: file.name, content });
            setProposalText(content);
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContext(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };
    
    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedReport('');

        if (mode === 'ia') {
            try {
                const textToAnalyze = document?.content || proposalText;
                if (!textToAnalyze.trim()) {
                    throw new Error("Debes cargar un documento o pegar el texto de la propuesta para el análisis con IA.");
                }
                const result = await performDueDiligenceAnalysis(textToAnalyze, context, SECTIONS);
                setAnswers(result);
                // Also generate the report immediately for convenience
                generateReportFromAnswers(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error en el análisis con IA.');
            }
        } else {
            generateReportFromAnswers(answers);
        }

        setIsLoading(false);
    };

    const generateReportFromAnswers = (currentAnswers: Record<string, string>) => {
        let report = `# Informe de Diligencia Debida: ${context.projectName || 'Sin Título'}\n\n`;
        report += `**Sector:** ${context.sector || 'N/A'} | **Mercado:** ${context.market || 'N/A'} | **Tipo:** ${context.proposalType || 'N/A'}\n\n`;

        SECTIONS.forEach(section => {
            report += `## ${section.title}\n\n`;
            section.questions.forEach((q, index) => {
                const key = `${section.id}_${index}`;
                report += `**${q}**\n`;
                report += `${currentAnswers[key] || '_Sin respuesta._'}\n\n`;
            });
        });
        setGeneratedReport(report);
    };
    
    const handleSaveTask = () => {
        const task: Task = {
            id: `due-diligence-${Date.now()}`,
            title: `Informe de Diligencia Debida: ${context.projectName || 'Nuevo Proyecto'}`,
            createdAt: Date.now(),
            status: 'Completado',
            contentType: ContentType.Texto,
            formData: {
                objective: `Informe de Diligencia Debida para ${context.projectName}`,
                specifics: {
                    [ContentType.Texto]: {
                        type: 'Informe de Diligencia Debida',
                        rawData: generatedReport,
                        dueDiligenceAnswers: answers,
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
            result: { text: generatedReport },
            eventType: 'DueDiligenceReport'
        };
        onSaveTask(task);
        alert('Informe guardado como una nueva tarea en el Gestor de Tareas.');
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <header className="text-center mb-10 relative">
                <h2 className="text-3xl font-bold text-gray-900">Analizador de Diligencia Debida Estratégica (A&G)</h2>
                <p className="mt-2 text-md text-gray-600">Evalúa sistemáticamente cualquier propuesta de negocio o expansión.</p>
                <div className="absolute top-0 right-0">
                    <button onClick={handleClearAnalysis} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">Limpiar Análisis</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* --- INPUT & CONFIGURATION --- */}
                <div className="space-y-6">
                    <Accordion title="Panel de Entrada" defaultOpen>
                        <div className="md:col-span-2">
                            <label className="font-medium text-gray-700">Carga de Propuesta</label>
                            <input type="file" id="due-diligence-file-input" onChange={handleFileChange} accept=".pdf,.txt" className="mt-1 block w-full text-sm"/>
                            {document && <p className="text-sm mt-1 text-gray-600">Cargado: {document.name}</p>}
                            <p className="text-center my-2 text-sm text-gray-500">O</p>
                            {/* FIX: Explicitly typed event handler to resolve potential 'e.target' type errors. */}
                            <FormTextarea label="Pega el texto de la propuesta aquí" value={proposalText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProposalText(e.target.value)} rows={8} />
                        </div>
                    </Accordion>
                    <Accordion title="Contexto Clave" defaultOpen>
                        <FormInput label="Nombre del Proyecto/Empresa" name="projectName" value={context.projectName} onChange={handleContextChange} />
                        <FormInput label="Sector Industrial" name="sector" placeholder="Ej: Moda Sostenible" value={context.sector} onChange={handleContextChange} />
                        <FormInput label="Mercado Objetivo" name="market" placeholder="Ej: Suecia, UE" value={context.market} onChange={handleContextChange} />
                        <FormInput label="Tipo de Propuesta" name="proposalType" placeholder="Ej: Expansión Internacional" value={context.proposalType} onChange={handleContextChange} />
                        <FormInput label="Inversión Solicitada (Opcional)" name="investment" placeholder="Ej: 20,000 USD (Deuda)" value={context.investment} onChange={handleContextChange} />
                    </Accordion>
                    <Accordion title="Secciones de Análisis Guiado" defaultOpen>
                         {SECTIONS.map(section => (
                            <details key={section.id} className="bg-gray-50 p-3 rounded-lg">
                                <summary className="font-semibold cursor-pointer">{section.title}</summary>
                                <div className="mt-4 space-y-4">
                                    {section.questions.map((q, index) => {
                                        const key = `${section.id}_${index}`;
                                        {/* FIX: Explicitly typed event handler to resolve potential 'e.target' type errors. */}
                                        return <FormTextarea key={key} label={q} value={answers[key] || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(key, e.target.value)} rows={3} disabled={mode === 'ia'} />;
                                    })}
                                </div>
                            </details>
                         ))}
                    </Accordion>
                </div>
                
                {/* --- ANALYSIS & RESULTS --- */}
                <div className="space-y-6 sticky top-8">
                    <Accordion title="Panel de Resultados y Lógica" defaultOpen>
                         <div className="md:col-span-2">
                             <label className="font-medium text-gray-700">Modo de Operación</label>
                            <div className="mt-2 flex rounded-md shadow-sm">
                                <button onClick={() => setMode('assisted')} className={`px-4 py-2 rounded-l-md text-sm font-medium w-1/2 ${mode === 'assisted' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Asistido por Usuario</button>
                                <button onClick={() => setMode('ia')} className={`px-4 py-2 rounded-r-md text-sm font-medium w-1/2 ${mode === 'ia' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Aumentado por IA (Helena)</button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button onClick={handleRunAnalysis} disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                {isLoading ? 'Analizando...' : 'Generar Informe de Diligencia Debida'}
                            </button>
                        </div>
                        {error && <p className="md:col-span-2 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                        <div className="md:col-span-2">
                            <FormTextarea label="Informe Generado" value={generatedReport} readOnly rows={20} className="font-mono text-xs bg-gray-100" />
                        </div>
                        {generatedReport && (
                            <div className="md:col-span-2">
                                 <button onClick={handleSaveTask} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700">Guardar Informe como Tarea</button>
                            </div>
                        )}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};