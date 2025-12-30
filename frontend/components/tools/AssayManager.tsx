import React, { useState, useMemo, useCallback } from 'react';
import { ContentType } from '../../types';
import type { Task, View, AssayDetails, Verdict, AssaySuggestion, GasProposal } from '../../types';
import { PYROLYSIS_MATERIALS } from '../../data/pyrolysisMaterials';
import { getSolidModeSuggestions, getGasModeProposals, getLiquidModeVerdict } from '../../services/geminiService';
import { FormSelect, FormTextarea } from '../form/FormControls';
import { useTranslations } from '../../contexts/LanguageContext';

interface AssayManagerProps {
    tasks: Task[];
    onSaveTask: (task: Task) => void;
    onUpdateTask: (task: Task) => void;
    setView: (view: View) => void;
}

interface Proposal {
    id: string;
    title: string;
    objective: string;
    methodology: string;
    status: 'default' | 'selected' | 'refined';
    score: number;
    critique?: {
        status: string;
        text: string;
        actions: {
            label: string;
            type: 'align_methodology' | 'focus_objective' | 'modularize_assay';
        }[];
    };
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ModeTab: React.FC<{ tabMode: 'solid' | 'liquid' | 'gas', label: string, icon: React.ReactNode, activeMode: 'solid' | 'liquid' | 'gas', onClick: (mode: 'solid' | 'liquid' | 'gas') => void }> = ({ tabMode, label, icon, activeMode, onClick }) => (
    <button onClick={() => onClick(tabMode)} className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeMode === tabMode ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {icon} {label}
    </button>
);

export const AssayManager: React.FC<AssayManagerProps> = ({ tasks, onSaveTask, onUpdateTask, setView }) => {
    const { t } = useTranslations();
    const [mode, setMode] = useState<'solid' | 'liquid' | 'gas'>('solid');
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string>>({});

    // Solid mode state
    const [selectedSolidMaterialId, setSelectedSolidMaterialId] = useState<number | null>(PYROLYSIS_MATERIALS.find(m => m.fase === 'Sólido' && m.nombre === 'Cáscara de Soja')?.id || null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [activeCritiqueId, setActiveCritiqueId] = useState<string | null>(null);
    const [flashingElement, setFlashingElement] = useState<{ id: string, part: 'methodology' | 'objective' } | null>(null);
    const [consejoDelDia, setConsejoDelDia] = useState<{ agente: string; mensaje: string; } | null>(null);


    // Gas mode state
    const [gasUserQuery, setGasUserQuery] = useState('');
    const [gasProposals, setGasProposals] = useState<GasProposal[]>([]);

    // Liquid mode state
    const [liquidObjective, setLiquidObjective] = useState('');
    const [liquidMethodology, setLiquidMethodology] = useState('');
    const [liquidVerdict, setLiquidVerdict] = useState<Verdict | null>(null);

    const solidMaterials = useMemo(() => PYROLYSIS_MATERIALS.filter(m => m.fase === 'Sólido'), []);
    
    const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));
    const setErr = (key: string, value: string) => setError(prev => ({ ...prev, [key]: value }));

    const triggerFlash = (id: string, part: 'methodology' | 'objective') => {
        setFlashingElement({ id, part });
        setTimeout(() => {
            setFlashingElement(null);
        }, 1500);
    };

    const createAssayTask = (
        title: string,
        objective: string,
        methodology: string,
        options: {
            zone: 'Sólida' | 'Líquida' | 'Gaseosa',
            originSource: 'Concilio' | 'Prometeo' | 'user',
            linkedMaterialId?: number | null,
            proposalIdToRemove?: string,
        }
    ) => {
        const newTask: Task = {
            id: `assay-${Date.now()}`,
            title,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {},
            isIntelligent: true,
            eventType: 'Assay',
            zone: options.zone,
            stateLabel: 'Planificación Inicial',
            originSource: options.originSource,
            activeAgent: 'Janus',
            assayDetails: {
                linkedMaterialId: options.linkedMaterialId || null,
                objective,
                methodology,
                labResults: [],
            }
        };
        onSaveTask(newTask);

        if (options.proposalIdToRemove) {
            setProposals(prev => prev.filter(p => p.id !== options.proposalIdToRemove));
        }

        if (options.zone === 'Gaseosa') {
            const proposalIdToRemoveNumber = options.proposalIdToRemove ? parseInt(options.proposalIdToRemove, 10) : NaN;
            if (!isNaN(proposalIdToRemoveNumber)) {
                setGasProposals(prev => prev.filter(p => p.id !== proposalIdToRemoveNumber));
            } else {
                 setGasProposals([]);
            }
            setGasUserQuery('');
        }
        if (options.zone === 'Líquida') {
            setLiquidObjective('');
            setLiquidMethodology('');
            setLiquidVerdict(null);
        }

        alert(`Tarea de ensayo "${title}" creada. Serás redirigido al Gestor de Tareas.`);
        setView('tasks');
    };

    const handleRefinementAction = (proposalId: string, actionType: 'align_methodology' | 'focus_objective' | 'modularize_assay') => {
        if (actionType === 'align_methodology') {
            setProposals(prev => prev.map(p => {
                if (p.id === proposalId) {
                    const newMethodology = "Realización de ensayos de dureza Janka según la norma ASTM D143 y ensayos de compresión paralela a la fibra... en conjunto con la medición de densidad y contenido de humedad...";
                    triggerFlash(p.id, 'methodology');
                    return { ...p, methodology: newMethodology, status: 'refined', score: 8, critique: undefined };
                }
                return p;
            }));
        } else if (actionType === 'focus_objective') {
             setProposals(prev => prev.map(p => {
                if (p.id === proposalId) {
                    const newObjective = "Objetivo Refinado: Se ha enfocado el objetivo para alinearse directamente con la metodología propuesta, evaluando el impacto de las propiedades físicas en el rendimiento mecánico.";
                    triggerFlash(p.id, 'objective');
                    return { ...p, objective: newObjective, status: 'refined', score: 8, critique: undefined };
                }
                return p;
            }));
        } else if (actionType === 'modularize_assay') {
            setProposals(prev => {
                const originalIndex = prev.findIndex(p => p.id === proposalId);
                if (originalIndex === -1) return prev;

                const newProposals: Proposal[] = [
                    {
                        id: `prop-mod-1-${Date.now()}`,
                        title: "Ensayo de Estabilidad Dimensional (Abiótico)",
                        objective: "Enfocado en la respuesta de la madera a ciclos de humedad y temperatura en una cámara climática, midiendo cambios dimensionales y contenido de humedad (alineado con el título actual).",
                        methodology: "Exposición de muestras a ciclos controlados de humedad y temperatura en cámara climática según ASTM D4442.",
                        status: 'refined',
                        score: 9,
                    },
                    {
                        id: `prop-mod-2-${Date.now()}`,
                        title: "Ensayo de Durabilidad Biológica",
                        objective: "Enfocado en la resistencia a hongos e insectos, utilizando protocolos específicos de exposición a organismos en condiciones controladas.",
                        methodology: "Exposición a organismos según normas de la serie AWPA (ej. AWPA E10 para hongos, AWPA E1 para termitas) en laboratorios especializados.",
                        status: 'refined',
                        score: 9,
                    }
                ];
                const updatedList = [...prev];
                updatedList.splice(originalIndex, 1, ...newProposals);
                return updatedList;
            });
        }
        setActiveCritiqueId(null);
    };

    const handleGetSolidSuggestions = useCallback(async () => {
        const material = solidMaterials.find(m => m.id === selectedSolidMaterialId);
        if (!material) return;

        setLoading('solid', true);
        setErr('solid', '');
        setProposals([]);
        setConsejoDelDia(null);
        setActiveCritiqueId(null);
        try {
            const result = await getSolidModeSuggestions(material.nombre);
            
            const generatedProposals: Proposal[] = result.titulos.map((title, index) => {
                const id = `prop-${index}-${Date.now()}`;
                let proposalData: Partial<Proposal> = {};

                // FOR DEMONSTRATION: Always add critiques to the 2nd and 3rd proposals
                if (index === 1) { // Second proposal
                    proposalData = {
                        score: 7,
                        critique: {
                            status: 'Requiere Refinamiento',
                            text: 'Se ha detectado una desalineación entre los diferentes componentes de la propuesta. El título y el objetivo se centran en un tipo de análisis, mientras que la metodología describe otro. Para alcanzar la robustez científica, es crucial alinear estos elementos.',
                            actions: [
                                { label: 'Aplicar Metodología Alineada', type: 'align_methodology' },
                                { label: 'Enfocar Objetivo', type: 'focus_objective' },
                            ]
                        }
                    };
                } else if (index === 2) { // Third proposal
                    proposalData = {
                        score: 8,
                        critique: {
                            status: 'Crítica de Alcance',
                            text: "El objetivo actual es demasiado amplio e incluye múltiples ensayos (abióticos y bióticos) que requieren protocolos distintos. Se recomienda modularizar la propuesta en ensayos más específicos para mayor claridad y viabilidad.",
                            actions: [
                                { label: 'Modularizar Ensayo', type: 'modularize_assay' },
                            ]
                        }
                    };
                } else { // First proposal
                    proposalData = { score: 9 };
                }


                return {
                    id,
                    title,
                    objective: result.objetivos[index] || '',
                    methodology: result.metodologias[index] || '',
                    status: 'default',
                    ...proposalData,
                } as Proposal;
            });

            setProposals(generatedProposals);
            if (result.consejoDelDia) {
                setConsejoDelDia(result.consejoDelDia);
            }

        } catch (e) {
            setErr('solid', e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setLoading('solid', false);
        }
    }, [selectedSolidMaterialId, solidMaterials]);

    const handleGetGasProposals = useCallback(async () => {
        if (!gasUserQuery.trim()) return;
        setLoading('gas', true);
        setErr('gas', '');
        setGasProposals([]);
        try {
            const result = await getGasModeProposals(gasUserQuery);
            setGasProposals(result.propuestas);
        } catch (e) {
            setErr('gas', e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setLoading('gas', false);
        }
    }, [gasUserQuery]);
    
    const handleGetLiquidVerdict = useCallback(async () => {
        if (!liquidObjective.trim() || !liquidMethodology.trim()) return;
        setLoading('liquid', true);
        setErr('liquid', '');
        setLiquidVerdict(null);
        try {
            const result = await getLiquidModeVerdict({ objective: liquidObjective, methodology: liquidMethodology });
            setLiquidVerdict(result);
        } catch (e) {
            setErr('liquid', e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setLoading('liquid', false);
        }
    }, [liquidObjective, liquidMethodology]);
    
    const getVerdictColor = (estado?: Verdict['estado'] | string) => {
        switch (estado) {
            case 'OK':
            case 'Propuesta Coherente y Robusta':
                return 'border-green-500 bg-green-50 text-green-800';
            case 'ADVERTENCIA': 
            case 'Requiere Refinamiento':
            case 'Crítica de Alcance':
                return 'border-amber-500 bg-amber-50 text-amber-800';
            case 'ERROR': return 'border-red-500 bg-red-50 text-red-800';
            default: return 'border-gray-300';
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col">
             <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes flash {
                    0% { background-color: transparent; }
                    25% { background-color: #FEF3C7; } /* amber-100 */
                    100% { background-color: transparent; }
                }
                .flash-yellow {
                    animation: flash 1.5s ease-out;
                }
            `}</style>
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('assayManager.title')}</h2>
                <p className="mt-2 text-md text-gray-600">{t('assayManager.subtitle')}</p>
            </header>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <ModeTab tabMode="solid" label="Modo Sólido" icon={<>🔬</>} activeMode={mode} onClick={setMode} />
                    <ModeTab tabMode="liquid" label="Modo Líquido" icon={<>💧</>} activeMode={mode} onClick={setMode} />
                    <ModeTab tabMode="gas" label="Modo Gaseoso" icon={<>💨</>} activeMode={mode} onClick={setMode} />
                </nav>
            </div>
            
            <div className="flex-grow">
                {mode === 'solid' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                             <div className="flex items-end gap-4">
                                <div className="flex-grow">
                                    <FormSelect 
                                        label={t('assayManager.linkedMaterial')} 
                                        value={String(selectedSolidMaterialId)} 
                                        onChange={(e) => setSelectedSolidMaterialId(Number(e.target.value))}
                                        disabled={isLoading['solid']}
                                    >
                                        {solidMaterials.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                    </FormSelect>
                                </div>
                            </div>
                            <button onClick={handleGetSolidSuggestions} disabled={isLoading['solid'] || !selectedSolidMaterialId} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center">
                               {isLoading['solid'] ? <LoadingSpinner /> : 'Consultar Concilio (Helena y Marco)'}
                            </button>
                        </div>
                        {error['solid'] && <p className="text-red-500">{error['solid']}</p>}
                        
                        {(consejoDelDia || proposals.length > 0) && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                {consejoDelDia && (
                                     <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                        <p className="font-bold text-yellow-800">Consejo del Día de {consejoDelDia.agente}:</p>
                                        <p className="mt-1 text-yellow-700 italic">"{consejoDelDia.mensaje}"</p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {proposals.map((p) => {
                                        const isSelected = activeCritiqueId === p.id;
                                        return (
                                            <React.Fragment key={p.id}>
                                                <div className="grid grid-cols-10 gap-4 items-center bg-gray-50 p-4 rounded-lg border">
                                                    <div className="col-span-3"><strong className="text-gray-500 text-xs uppercase">Título</strong><p className="text-sm font-semibold">{p.title}</p></div>
                                                    <div className={`col-span-3 p-2 rounded ${flashingElement?.id === p.id && flashingElement.part === 'objective' ? 'flash-yellow' : ''}`}><strong className="text-gray-500 text-xs uppercase">Objetivo</strong><p className="text-sm">{p.objective}</p></div>
                                                    <div className={`col-span-3 p-2 rounded ${flashingElement?.id === p.id && flashingElement.part === 'methodology' ? 'flash-yellow' : ''}`}><strong className="text-gray-500 text-xs uppercase">Metodología</strong><p className="text-sm">{p.methodology}</p></div>
                                                    <div className="col-span-1 text-right">
                                                        {p.status === 'refined' ? (
                                                            <button onClick={() => createAssayTask(p.title, p.objective, p.methodology, { zone: 'Sólida', originSource: 'Concilio', linkedMaterialId: selectedSolidMaterialId, proposalIdToRemove: p.id })} className="w-full bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-xs hover:bg-green-700">Finalizar y Crear</button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setActiveCritiqueId(isSelected ? null : p.id)}
                                                                className={`w-full font-bold py-2 px-3 rounded-lg text-xs transition-colors duration-200 ease-in-out ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
                                                                        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 hover:border-blue-400'
                                                                }`}
                                                            >
                                                                {isSelected ? 'Ocultar Análisis' : 'Seleccionar y Refinar'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && p.critique && (
                                                    <div className={`-mt-2 p-4 rounded-b-lg border-x border-b animate-fade-in ${getVerdictColor(p.critique.status)}`}>
                                                        <h4 className="font-bold text-md flex items-center gap-2">
                                                            <span className="font-mono text-xs p-1 bg-white/50 rounded">⚖️</span> Análisis de Coherencia por Janus
                                                        </h4>
                                                        <p className="text-sm mt-2"><strong>Estado:</strong> {p.critique.status} (Puntuación: +{p.score})</p>
                                                        <p className="text-sm my-3">{p.critique.text}</p>
                                                        <div className="border-t border-current opacity-20 my-3"></div>
                                                        <h5 className="font-semibold text-sm mb-2">Acciones Sugeridas</h5>
                                                        <div className="flex gap-4">
                                                            {p.critique.actions.map(action => (
                                                                <button key={action.type} onClick={() => handleRefinementAction(p.id, action.type)} className="bg-white/80 hover:bg-white text-sm font-semibold py-2 px-4 rounded-md border border-current opacity-80 hover:opacity-100">{action.label}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {p.status === 'refined' && (
                                                    <div className={`-mt-2 p-4 rounded-b-lg border-x border-b animate-fade-in ${getVerdictColor('Propuesta Coherente y Robusta')}`}>
                                                        <h4 className="font-bold text-md flex items-center gap-2">
                                                            <span className="font-mono text-xs p-1 bg-white/50 rounded">✅</span> Análisis de Coherencia por Janus
                                                        </h4>
                                                        <p className="text-sm mt-2"><strong>Estado:</strong> Propuesta Coherente y Robusta (Puntuación: +{p.score})</p>
                                                        <p className="text-sm my-3">¡Excelente! La propuesta ahora presenta una alineación rigurosa. El ensayo está listo para ser planificado y ejecutado.</p>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {mode === 'liquid' && (
                     <div className="space-y-6">
                        <FormTextarea label="Objetivo del Ensayo" value={liquidObjective} onChange={e => setLiquidObjective(e.target.value)} rows={3} placeholder="Describe el objetivo claro y conciso del ensayo..."/>
                        <FormTextarea label="Metodología Propuesta" value={liquidMethodology} onChange={e => setLiquidMethodology(e.target.value)} rows={4} placeholder="Describe los pasos y técnicas a utilizar en la metodología..."/>
                        <button onClick={handleGetLiquidVerdict} disabled={isLoading['liquid'] || !liquidObjective || !liquidMethodology} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center">
                            {isLoading['liquid'] ? <LoadingSpinner /> : 'Solicitar Veredicto de Janus'}
                        </button>
                        {error['liquid'] && <p className="text-red-500">{error['liquid']}</p>}
                        {liquidVerdict && (
                             <div className={`mt-6 p-4 rounded-lg border-2 animate-fade-in ${getVerdictColor(liquidVerdict.estado)}`}>
                                <h4 className="font-bold text-lg">Veredicto de Janus: {liquidVerdict.estado}</h4>
                                <p className="mt-2">{liquidVerdict.mensaje}</p>
                                {(liquidVerdict.estado === 'OK' || liquidVerdict.estado === 'ADVERTENCIA') && (
                                    <div className="mt-4 pt-4 border-t border-current opacity-20">
                                        <button 
                                            onClick={() => createAssayTask(`Ensayo Líquido: ${liquidObjective.substring(0, 30)}...`, liquidObjective, liquidMethodology, { zone: 'Líquida', originSource: 'user' })} 
                                            className="w-full bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-green-700"
                                        >
                                            Finalizar y Crear Tarea
                                        </button>
                                    </div>
                                )}
                             </div>
                        )}
                    </div>
                )}
                {mode === 'gas' && (
                    <div className="space-y-6">
                        <FormTextarea label="Consulta para Prometeo" value={gasUserQuery} onChange={e => setGasUserQuery(e.target.value)} rows={3} placeholder="Describe tu idea o pregunta para un ensayo no convencional..."/>
                        <button onClick={handleGetGasProposals} disabled={isLoading['gas'] || !gasUserQuery} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center">
                           {isLoading['gas'] ? <LoadingSpinner /> : 'Consultar a Prometeo'}
                        </button>
                        {error['gas'] && <p className="text-red-500">{error['gas']}</p>}
                        {gasProposals.length > 0 && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                {gasProposals.map(p => (
                                     <div key={p.id} className={`p-4 rounded-lg border-l-4 ${p.isDreamInspired ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'}`}>
                                        {p.isDreamInspired && <p className="text-xs font-bold text-purple-600 uppercase mb-2">✨ Inspiración Onírica</p>}
                                        <h4 className="font-bold">{p.titulo}</h4>
                                        <p className="text-sm mt-1"><strong>Objetivo:</strong> {p.objetivo}</p>
                                        <p className="text-sm mt-1"><strong>Metodología:</strong> {p.metodologiaSugerida}</p>
                                        <div className="text-right mt-2">
                                            <button onClick={() => createAssayTask(p.titulo, p.objetivo, p.metodologiaSugerida, { zone: 'Gaseosa', originSource: 'Prometeo', proposalIdToRemove: String(p.id) })} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-bold py-2 px-4 rounded-lg">CREAR ENSAYO</button>
                                        </div>
                                     </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};