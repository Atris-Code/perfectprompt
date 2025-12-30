import React, { useState, useEffect, useRef } from 'react';
import type { View, CharacterProfile, Assistant, SkillModule, Task } from '../types';
import { ContentType } from '../types';
import { AssistantModal } from './CreateAssistantModal';
import CreateSkillModuleModal from './CreateSkillModuleModal';
import { executeSkillModule } from '../services/geminiService';
import { FormInput } from './form/FormControls';

interface TitanWorkspaceProps {
    titan: CharacterProfile;
    onUpdateTitan: (titan: CharacterProfile) => void;
    onClose: () => void;
    onStartChat: (titan: CharacterProfile) => void;
    knowledgeSources: { name: string; content: string }[];
    onSaveTask: (task: Task, navigate?: boolean) => void;
    onNavigateToForum: (context: { instructions: string; files: { name: string; content: string }[] }) => void;
}

const ParameterInputModal: React.FC<{
    skill: SkillModule;
    onClose: () => void;
    onSubmit: (skill: SkillModule, value: string) => void;
}> = ({ skill, onClose, onSubmit }) => {
    const [value, setValue] = useState('');
    const paramName = skill.instruction.match(/\[parámetro:\s*([^\]]+)\]/)?.[1] || 'parámetro';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSubmit(skill, value);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <h3 className="text-2xl font-bold mb-6">Parámetro Requerido para '{skill.name}'</h3>
                        <div className="space-y-4">
                            <FormInput
                                label={`Por favor, introduce el valor para "${paramName}":`}
                                id="parameter-input"
                                name="parameter-input"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">Ejecutar</button>
                    </div>
                </form>
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

const WorkspaceCard: React.FC<{
    title: string;
    children: React.ReactNode;
    collapsible?: boolean;
}> = ({ title, children, collapsible = true }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white text-gray-800 rounded-lg shadow-md flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                {collapsible && (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="p-6 flex-grow flex flex-col">
                    {children}
                </div>
            )}
        </div>
    );
};


export const TitanWorkspace: React.FC<TitanWorkspaceProps> = ({ titan, onUpdateTitan, onClose, onStartChat, knowledgeSources, onSaveTask, onNavigateToForum }) => {
    const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
    const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);

    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<SkillModule | null>(null);

    const [executionResults, setExecutionResults] = useState<Record<string, { name: string; result: string; isLoading: boolean; error: string }>>({});
    const [skillToParametrize, setSkillToParametrize] = useState<SkillModule | null>(null);
    const [copiedResultId, setCopiedResultId] = useState<string | null>(null);
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionMenuRef]);

    const handleCopyText = (text: string, skillId: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedResultId(skillId);
            setTimeout(() => setCopiedResultId(null), 2000);
        });
    };

    const handleDownloadTxt = (text: string, skillName: string) => {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${skillName.replace(/ /g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = async (skillId: string, skillName: string) => {
        const element = document.getElementById(`result-content-${skillId}`);
        if (!element) return;
        
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert("Las librerías para generar PDF no se cargaron correctamente. Comprueba tu conexión a internet y refresca la página.");
            return;
        }
        
        const { jsPDF } = window.jspdf;

        const canvas = await window.html2canvas(element, {
            scale: 2,
            backgroundColor: '#1f2937' // bg-gray-800
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const pageWidth = pdfWidth - margin * 2;
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / pageWidth;
        const finalImgHeight = imgHeight / ratio;

        let heightLeft = finalImgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', margin, margin, pageWidth, finalImgHeight);
        heightLeft -= (pdfHeight - margin * 2);

        while (heightLeft > 0) {
            position -= (pdfHeight - margin * 2);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, pageWidth, finalImgHeight);
            heightLeft -= (pdfHeight - margin * 2);
        }

        pdf.save(`${skillName.replace(/ /g, '_')}.pdf`);
    };

    const handleDiscussInForum = (resultName: string, resultText: string) => {
        const context = {
            instructions: `Analizar y debatir sobre el siguiente resultado generado por ${titan.claveName.split(',')[0]} a través de la habilidad '${resultName}':\n\n---\n${resultText}\n---`,
            files: [],
        };
        onNavigateToForum(context);
        setActionMenuOpenId(null);
    };

    const handleSendToEditorial = (resultName: string, resultText: string) => {
        const newTask: Task = {
            id: `task-editorial-${Date.now()}`,
            title: `Documentar Análisis: ${resultName} (Asistente de ${titan.claveName.split(',')[0]})`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            eventType: 'Resultado de Simulación',
            formData: {
                objective: `Documentar y formatear el análisis '${resultName}' para uso editorial.`,
                specifics: {
                    [ContentType.Texto]: {
                        type: "Informe de Sostenibilidad (ESG)",
                        rawData: resultText,
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
        };
        onSaveTask(newTask, true);
        setActionMenuOpenId(null);
    };

    const handleSaveToKB = () => {
        alert('La función "Guardar en Base de Conocimiento" se implementará en una futura actualización.');
        setActionMenuOpenId(null);
    };

    const handleSaveAssistant = (newAssistantData: Omit<Assistant, 'id' | 'status'>) => {
        const assistantWithId: Assistant = {
            ...newAssistantData,
            id: `asst-${Date.now()}`,
            status: 'INACTIVE',
        };
        const updatedTitan = {
            ...titan,
            assistants: [...(titan.assistants || []), assistantWithId]
        };
        onUpdateTitan(updatedTitan);
        setIsAssistantModalOpen(false);
    };

    const handleUpdateAssistant = (updatedAssistant: Assistant) => {
        const updatedTitan = {
            ...titan,
            assistants: (titan.assistants || []).map(asst => 
                asst.id === updatedAssistant.id ? updatedAssistant : asst
            )
        };
        onUpdateTitan(updatedTitan);
        setEditingAssistant(null);
    };
    
    const handleSaveSkillModule = (skillData: Omit<SkillModule, 'id' | 'status'>) => {
        const newSkillModule: SkillModule = {
            ...skillData,
            id: `skill-${Date.now()}`,
            status: 'INACTIVE',
        };
        const updatedTitan: CharacterProfile = {
            ...titan,
            skillModules: [...(titan.skillModules || []), newSkillModule]
        };
        onUpdateTitan(updatedTitan);
        setIsSkillModalOpen(false);
    };

    const handleUpdateSkillModule = (updatedSkill: SkillModule) => {
        const updatedTitan: CharacterProfile = {
            ...titan,
            skillModules: (titan.skillModules || []).map(skill => 
                skill.id === updatedSkill.id ? updatedSkill : skill
            )
        };
        onUpdateTitan(updatedTitan);
        setEditingSkill(null);
    };

    const handleDeleteSkillModule = (skillId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este módulo de habilidad?')) {
            const updatedTitan: CharacterProfile = {
                ...titan,
                skillModules: (titan.skillModules || []).filter(skill => skill.id !== skillId)
            };
            onUpdateTitan(updatedTitan);
        }
    };

    const handleToggleAssistantStatus = (assistantId: string) => {
        const updatedTitan: CharacterProfile = {
            ...titan,
            assistants: (titan.assistants || []).map(asst => {
                if (asst.id === assistantId) {
                    // FIX: Explicitly type the new status to prevent type widening to `string`.
                    const newStatus: 'ACTIVE' | 'INACTIVE' = asst.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                    return { ...asst, status: newStatus };
                }
                return asst;
            })
        };
        onUpdateTitan(updatedTitan);
    };

    const handleToggleSkillStatus = (skillId: string) => {
        const updatedTitan: CharacterProfile = {
            ...titan,
            skillModules: (titan.skillModules || []).map(skill => {
                if (skill.id === skillId) {
                    // FIX: Explicitly type the new status to prevent type widening to `string`.
                    const newStatus: 'ACTIVE' | 'INACTIVE' = skill.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                    return { ...skill, status: newStatus };
                }
                return skill;
            })
        };
        onUpdateTitan(updatedTitan);
    };

    const executeFinalInstruction = async (skill: SkillModule, instruction: string) => {
        setExecutionResults(prev => ({
            ...prev,
            [skill.id]: { name: skill.name, result: '', isLoading: true, error: '' }
        }));
        try {
            const result = await executeSkillModule(instruction);
            setExecutionResults(prev => ({
                ...prev,
                [skill.id]: { ...prev[skill.id], result, isLoading: false }
            }));
        } catch (e) {
            setExecutionResults(prev => ({
                ...prev,
                [skill.id]: { ...prev[skill.id], error: e instanceof Error ? e.message : 'Error desconocido', isLoading: false }
            }));
        }
    };

    const handleExecuteSkill = async (skill: SkillModule) => {
        const paramRegex = /\[parámetro:\s*([^\]]+)\]/;
        const match = skill.instruction.match(paramRegex);
    
        if (match) {
            setSkillToParametrize(skill); // Opens the modal
        } else {
            await executeFinalInstruction(skill, skill.instruction); // No parameter, execute directly
        }
    };

    const handleExecuteWithParameter = async (skill: SkillModule, value: string) => {
        const paramRegex = /\[parámetro:\s*([^\]]+)\]/;
        const finalInstruction = skill.instruction.replace(paramRegex, value);
        setSkillToParametrize(null); // Close the modal
        await executeFinalInstruction(skill, finalInstruction);
    };


    const handleDeleteAssistant = (assistantId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este asistente?')) {
            const updatedTitan = {
                ...titan,
                assistants: (titan.assistants || []).filter(asst => asst.id !== assistantId)
            };
            onUpdateTitan(updatedTitan);
        }
    };


    return (
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg min-h-full">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            `}</style>
            {isAssistantModalOpen && (
                <AssistantModal
                    onClose={() => setIsAssistantModalOpen(false)}
                    onCreate={handleSaveAssistant}
                    onUpdate={() => {}} // Not used here
                    knowledgeSources={knowledgeSources}
                />
            )}
             {editingAssistant && (
                <AssistantModal
                    onClose={() => setEditingAssistant(null)}
                    onCreate={() => {}}
                    onUpdate={handleUpdateAssistant}
                    assistantToEdit={editingAssistant}
                    knowledgeSources={knowledgeSources}
                />
            )}

            {isSkillModalOpen && (
                <CreateSkillModuleModal
                    onClose={() => setIsSkillModalOpen(false)}
                    onSave={handleSaveSkillModule}
                    titanName={titan.claveName}
                />
            )}

            {editingSkill && (
                 <CreateSkillModuleModal
                    onClose={() => setEditingSkill(null)}
                    onSave={handleUpdateSkillModule}
                    skillModuleToEdit={editingSkill}
                    titanName={titan.claveName}
                />
            )}

            {skillToParametrize && (
                <ParameterInputModal
                    skill={skillToParametrize}
                    onClose={() => setSkillToParametrize(null)}
                    onSubmit={handleExecuteWithParameter}
                />
            )}


            <header className="mb-8">
                <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 mb-4">&larr; Volver al Atrio</button>
                <h2 className="text-4xl font-bold">{titan.claveName}</h2>
                <p className="text-lg text-gray-400">{titan.archetype}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <WorkspaceCard title="Acciones Principales">
                    <button onClick={() => onStartChat(titan)} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg">Conversar con {titan.claveName.split(',')[0]}</button>
                </WorkspaceCard>

                <WorkspaceCard title="Mis Asistentes IA" collapsible={false}>
                    <div className="space-y-4 flex flex-col flex-grow">
                        <button onClick={() => setIsAssistantModalOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                            + Crear Nuevo Asistente
                        </button>
                        <div className="space-y-3 flex-grow max-h-96 overflow-y-auto pr-2">
                            {(titan.assistants || []).length > 0 ? (
                                titan.assistants!.map(asst => (
                                    <div key={asst.id} className="bg-gray-100 p-4 rounded-md space-y-3 border">
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800">{asst.name}</p>
                                            <p className="text-xs text-gray-500 mt-1"><strong>Rol:</strong> {asst.rolePrompt.substring(0, 100)}...</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-600">Estado:</span>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={asst.status === 'ACTIVE'} onChange={() => handleToggleAssistantStatus(asst.id)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingAssistant(asst)} className="text-xs font-semibold bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Editar</button>
                                                <button onClick={() => handleDeleteAssistant(asst.id)} className="text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded">Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-800">No hay asistentes creados.</p>
                            )}
                        </div>
                    </div>
                </WorkspaceCard>
                
                 <WorkspaceCard title="Mis Módulos de Habilidad">
                    <div className="space-y-4 flex flex-col flex-grow">
                       <button onClick={() => setIsSkillModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                            + Crear Nuevo Módulo
                        </button>
                        <div className="space-y-3 flex-grow max-h-96 overflow-y-auto pr-2">
                            {(titan.skillModules || []).length > 0 ? (
                                titan.skillModules!.map(skill => (
                                    <div key={skill.id} className="bg-gray-100 p-4 rounded-md border">
                                        <p className="font-semibold text-lg text-gray-800">{skill.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{skill.instruction.substring(0, 120)}...</p>
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-600">Estado:</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={skill.status === 'ACTIVE'} onChange={() => handleToggleSkillStatus(skill.id)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </div>
                                            <button onClick={() => handleExecuteSkill(skill)} disabled={skill.status === 'INACTIVE'} className="text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">Ejecutar</button>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => setEditingSkill(skill)} className="text-xs font-semibold bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Editar</button>
                                            <button onClick={() => handleDeleteSkillModule(skill.id)} className="text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded">Eliminar</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-800">No hay módulos de habilidad creados.</p>
                            )}
                        </div>
                    </div>
                </WorkspaceCard>
            </div>
            
            {Object.keys(executionResults).length > 0 && (
                <div className="mt-8">
                     <div className="bg-white text-gray-800 rounded-lg shadow-md">
                        <div className="p-4 border-b border-gray-200">
                           <h3 className="font-bold text-lg text-gray-900">Resultados de Ejecución de Habilidad</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {Object.keys(executionResults).map((id) => {
                                const res = executionResults[id];
                                return (
                                    <div key={id} className="bg-gray-800 rounded-lg border border-gray-700 text-white">
                                        <div id={`result-content-${id}`} className="p-4">
                                            <h4 className="font-bold text-cyan-400">{res.name}</h4>
                                            {res.isLoading && <p className="text-sm text-gray-400 animate-pulse">Ejecutando...</p>}
                                            {res.error && <p className="text-sm text-red-400">Error: {res.error}</p>}
                                            {res.result && <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans mt-2">{res.result}</pre>}
                                        </div>
                                        {res.result && !res.isLoading && (
                                            <div className="px-4 pb-3 border-t border-gray-600 flex flex-wrap justify-end items-center gap-2">
                                                <button onClick={() => handleCopyText(res.result, id)} className="text-xs font-semibold bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-md">
                                                    {copiedResultId === id ? '¡Copiado!' : 'Copiar Texto'}
                                                </button>
                                                <button onClick={() => handleDownloadTxt(res.result, res.name)} className="text-xs font-semibold bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-md">
                                                    Descargar TXT
                                                </button>
                                                <button onClick={() => handleDownloadPdf(id, res.name)} className="text-xs font-semibold bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-md">
                                                    Descargar PDF
                                                </button>
                                                <div className="relative" ref={actionMenuOpenId === id ? actionMenuRef : null}>
                                                    <button
                                                        onClick={() => setActionMenuOpenId(actionMenuOpenId === id ? null : id)}
                                                        className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1"
                                                    >
                                                        Utilizar este Análisis en...
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </button>
                                                    {actionMenuOpenId === id && (
                                                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200 animate-fade-in">
                                                            <ul className="py-1 text-sm text-gray-700">
                                                                <li><button onClick={() => handleDiscussInForum(res.name, res.result)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Discutir en Forum de Titanes</button></li>
                                                                <li><button onClick={() => handleSendToEditorial(res.name, res.result)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Enviar a la Editorial (Crear Tarea)</button></li>
                                                                <li><button onClick={handleSaveToKB} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-400" title="Función futura">Guardar en Base de Conocimiento</button></li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};