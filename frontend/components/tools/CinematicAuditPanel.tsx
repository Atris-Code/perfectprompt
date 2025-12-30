import React, { useState, useMemo, useEffect } from 'react';
import type { AutoSolution, Task, View, PromptCoherenceAnalysis, CoherenceCriterion } from '../../types';
import { ContentType } from '../../types';
import { Accordion } from '../form/Accordion';

// Mocked analysis data from OCR
const MOCK_ANALYSIS_DATA: Omit<PromptCoherenceAnalysis, 'promptText'> = {
  contentCoherence: {
    score: -9,
    issues: [
      { criterion: 'Duplicación y redundancia', evaluation: -3, detail: 'El prompt se repite literalmente en varios párrafos. Parece un copy-paste mal ejecutado.' },
      { criterion: 'Estructura rota', evaluation: -2, detail: 'Saltos bruscos entre instrucciones, sin transiciones.' },
      { criterion: 'Datos sin procesar', evaluation: -2, detail: 'Deja trozos de raw data sin integrar. No se traducen a lenguaje de guion.' },
      { criterion: 'Contradicciones implícitas', evaluation: -1, detail: 'Pide "no menciones página 10" pero contiene referencias crudas.' },
      { criterion: 'Falta de cierre', evaluation: -1, detail: 'El prompt acaba en una frase incompleta.' },
    ],
  },
  visualCoherence: {
    score: 9,
    strengths: [
      { criterion: 'Sistema de etiquetas claro', evaluation: 3, detail: '[TÍTULO EN PANTALLA], [NARRADOR], [VISUAL], [TEXTO SUPERPUESTO] están perfectamente definidos.' },
      { criterion: 'Sugerencias de estilo Vox', evaluation: 2, detail: 'Indica explícitamente “motion graphics”, “texto en pantalla”, “voz en off”, “icono de advertencia en rojo”.' },
      { criterion: 'Segmentación visual lógica', evaluation: 2, detail: 'Propone dividir el video en “Parte 1…”, “Parte 2…” con títulos en pantalla.' },
      { criterion: 'Énfasis en seguridad', evaluation: 2, detail: 'Especifica recursos visuales (color rojo, iconos) para alertas.' },
    ],
  },
  finalScore: {
    content: -9,
    visual: 9,
    total: 0,
    level: 'NEUTRO',
    summary: 'El prompt es un “storyboard visual excelente” pero un “libreto textual defectuoso”.',
  },
  recommendations: [
    { title: 'Dedup + reescribe', detail: 'Usa un paso “remove-duplicates” antes de enviarlo al generador.' },
    { title: 'Normaliza la estructura', detail: 'Emplea un esquema fijo: Sección → Sub-sección → Dato → Traducción a guion.' },
    { title: 'Cierra todos los bloques', detail: 'Añade un marker final [END] para evitar truncamientos.' },
    { title: 'Validación de coherencia automática', detail: 'Aplica un linter de prompt: si detecta más de 30% de n-grams repetidos, rechaza o reescribe.' },
    { title: 'Versión visual vs. textual separada', detail: 'Mantén dos archivos: prompt-visual.md y prompt-narrativa.md, y mézclalos en post-producción.' },
  ],
};


interface CinematicAuditPanelProps {
    auditData: AutoSolution;
    onSaveTask: (task: Task) => void;
    setView: (view: View) => void;
    onDone: () => void;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const isPositive = score >= 0;
    const colorClass = isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const sign = isPositive ? '+' : '';
    return <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${colorClass}`}>{sign}{score}</span>
};

const CoherenceTable: React.FC<{ items: CoherenceCriterion[]; isStrength: boolean }> = ({ items, isStrength }) => (
    <table className="w-full text-sm">
        <thead className="text-left">
            <tr className="border-b border-gray-700">
                <th className="p-2 w-2/5">Criterio</th>
                <th className="p-2 w-1/5 text-center">Evaluación</th>
                <th className="p-2 w-2/5">Detalle</th>
            </tr>
        </thead>
        <tbody>
            {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                    <td className="p-2 font-semibold">{item.criterion}</td>
                    <td className="p-2 text-center"><ScoreBadge score={item.evaluation} /></td>
                    <td className="p-2 text-gray-400">{item.detail}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export const CinematicAuditPanel: React.FC<CinematicAuditPanelProps> = ({ auditData, onSaveTask, setView, onDone }) => {
    const [analysisResult, setAnalysisResult] = useState<PromptCoherenceAnalysis | null>(null);

    useEffect(() => {
        if (!auditData) return;

        const rawData = `
${auditData.protocoloLimpieza.titulo}
${auditData.protocoloLimpieza.pasos.map((paso, index) => `${index + 1}. ${paso}`).join('\n')}
        `.trim();

        const videoScriptPrompt = `
### **Prompt Mejorado para Generador de IA**

**Actúa como un director de producción y generador de guiones para videos técnicos.**

Tu tarea es crear el guion para un video corto y profesional que sirva como **registro visual del cumplimiento** de un protocolo de mantenimiento de contingencia. El video debe documentar de forma clara y secuencial cada paso completado por el cliente para resolver la "Alarma 7".

**1. Título del Proyecto:**
Registro de Cumplimiento: Protocolo de Limpieza para Alarma 7

**2. Objetivo Principal:**
Generar un video conciso que certifique la ejecución completa y exitosa del "Protocolo de Limpieza Inmediato" para la Alarma 7, realizado por el cliente. Este video funcionará como prueba documental para el soporte técnico y el registro interno.

**3. Audiencia:**
Personal de soporte técnico, ingenieros de mantenimiento y el propio cliente para sus registros de calidad.

**4. Tono y Estilo Visual (visualToneSyncStyle):**
* **Tono del Narrador/Texto:** Profesional, factual, claro y directo. Sin lenguaje coloquial.
* **Estilo Visual:** Documental técnico. Tomas limpias, estables, bien iluminadas y con un enfoque nítido en los detalles de cada acción. La paleta de colores debe ser neutra y profesional (grises, blancos, azules metálicos). Utiliza superposiciones de texto (gráficos en pantalla) minimalistas y legibles para cada paso.

**5. Estructura del Guion (Escena por Escena):**
Basado en los siguientes datos de cumplimiento, genera una secuencia visual lógica:

* **Raw Data:**
${rawData.split('\n').map(line => `* \`${line}\``).join('\n')}

---
### **GUION DE VIDEO:**

**(ESCENA 1: INTRODUCCIÓN)**
* **VISUAL:** Pantalla de título sobre un fondo técnico desenfocado (esquema de la caldera).
* **TEXTO EN PANTALLA:**
  * TÍTULO: **Registro de Cumplimiento**
  * PROTOCOLO: **Limpieza Inmediata - Alarma 7**
  * ESTADO: **Completado por el Cliente**
* **AUDIO:** Sonido electrónico breve y sutil.

... (resto de la estructura de escenas como se definió en TitansDebate) ...

---
**Instrucción Final:** Asegúrate de que las transiciones entre escenas sean limpias y rápidas. La duración total del video debe ser corta y directa al punto (ej. 45-60 segundos), enfocada en mostrar eficiencia y cumplimiento.
        `.trim();

        setAnalysisResult({
            ...MOCK_ANALYSIS_DATA,
            promptText: videoScriptPrompt,
        });

    }, [auditData]);

    const handleCreateRatificationTask = () => {
        const rawData = `
${auditData.protocoloLimpieza.titulo}
${auditData.protocoloLimpieza.pasos.map((paso, index) => `${index + 1}. ${paso}`).join('\n')}
        `.trim();

        const ratificationProposal: Task = {
            id: `ratification-proposal-${Date.now()}`,
            title: `Propuesta de Ratificación: Cumplimiento Protocolo Alarma 7`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'TitansDebate',
            stateLabel: 'Pendiente de Ratificación DAO',
            formData: {
                objective: 'Ratificar el cumplimiento del protocolo de limpieza para la Alarma 7, realizado por el cliente, y sellar el cumplimiento en la blockchain.',
                specifics: {
                    [ContentType.Texto]: { rawData, originalData: auditData },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
        };
        onSaveTask(ratificationProposal);
        onDone();
        setView('tasks');
    };

    if (!analysisResult) {
        return <div className="text-center p-8 bg-gray-900 text-white">Generando análisis del prompt...</div>;
    }

    const { contentCoherence, visualCoherence, finalScore, recommendations, promptText } = analysisResult;

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg min-h-full font-sans">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold">Auditoría Cinemática del Prompt</h2>
                <p className="mt-2 text-md text-slate-400">Análisis de coherencia del prompt de video generado para el protocolo de Alarma 7.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-6">
                    <Accordion title="Prompt Generado para Auditoría" defaultOpen>
                        <pre className="text-xs bg-gray-800 p-4 rounded-md whitespace-pre-wrap font-mono max-h-[80vh] overflow-y-auto">{promptText}</pre>
                    </Accordion>
                    <Accordion title="Recomendaciones de Prompt-Engineering" defaultOpen>
                        <ul className="space-y-3">
                            {recommendations.map((rec, i) => (
                                <li key={i} className="bg-gray-800 p-3 rounded-md">
                                    <p className="font-semibold text-cyan-400">{rec.title}</p>
                                    <p className="text-sm text-gray-300 mt-1">{rec.detail}</p>
                                </li>
                            ))}
                        </ul>
                    </Accordion>
                </div>
                <div className="space-y-6">
                    <Accordion title="Índice de Coherencia Global" defaultOpen>
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                            <p className="text-lg font-bold">Índice Final: <span className="text-2xl font-mono">{finalScore.total > 0 ? '+' : ''}{finalScore.total}</span> <span className="px-2 py-1 text-sm font-semibold rounded-md bg-yellow-200 text-yellow-900">{finalScore.level}</span></p>
                            <p className="italic text-gray-400 mt-2">"{finalScore.summary}"</p>
                        </div>
                    </Accordion>
                    <Accordion title="Análisis de Coherencia de Contenido" defaultOpen>
                         <h4 className="font-bold text-lg mb-2">Puntuación: <ScoreBadge score={contentCoherence.score} /> / 9</h4>
                         <CoherenceTable items={contentCoherence.issues} isStrength={false} />
                    </Accordion>
                     <Accordion title="Análisis de Coherencia Visual" defaultOpen>
                        <h4 className="font-bold text-lg mb-2">Puntuación: <ScoreBadge score={visualCoherence.score} /> / 9</h4>
                        <CoherenceTable items={visualCoherence.strengths} isStrength={true} />
                    </Accordion>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-xl font-bold text-center mb-4">Siguiente Paso</h3>
                        <button onClick={handleCreateRatificationTask} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700">
                            Enviar Propuesta de Ratificación a la DAO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
