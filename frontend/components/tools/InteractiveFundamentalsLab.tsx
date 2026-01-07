import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { PeriodicElement, Task, View } from '../../types';
import { ContentType, EventType } from '../../types';
import { Accordion } from '../form/Accordion';
import { AtomVisualizer } from './AtomVisualizer';

const categoryColors: Record<string, string> = {
    'No metales': 'bg-green-200 text-green-900 border-green-400',
    'Gases nobles': 'bg-violet-200 text-violet-900 border-violet-400',
    'Metales alcalinos': 'bg-red-200 text-red-900 border-red-400',
    'Metales alcalinotérreos': 'bg-orange-200 text-orange-900 border-orange-400',
    'Metaloides': 'bg-yellow-200 text-yellow-900 border-yellow-400',
    'Halógenos': 'bg-sky-200 text-sky-900 border-sky-400',
    'Otros metales': 'bg-gray-300 text-gray-900 border-gray-500',
    'Metales de transición': 'bg-pink-200 text-pink-900 border-pink-400',
    'Lantánidos': 'bg-teal-200 text-teal-900 border-teal-400',
    'Actínidos': 'bg-indigo-200 text-indigo-900 border-indigo-400',
};

const DetailItem: React.FC<{ label: string; value: string | number | null | undefined; unit?: string }> = ({ label, value, unit }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div>
            <dt className="text-sm font-medium text-gray-400">{label}</dt>
            <dd className="mt-1 text-base text-white font-mono">
                {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
                {unit && <span className="text-gray-400 ml-1">{unit}</span>}
            </dd>
        </div>
    );
};

const ElementDetailModal: React.FC<{
    element: PeriodicElement;
    onClose: () => void;
    onAnalyze: (element: PeriodicElement) => void;
    onSynergyAction: (action: 'informe' | 'visual' | 'mercado', element: PeriodicElement) => void;
    onSaveTask: (task: Task, navigate?: boolean) => void;
}> = ({ element, onClose, onAnalyze, onSynergyAction, onSaveTask }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'visualize'>('visualize');

    const TabButton: React.FC<{ tabId: 'details' | 'visualize', label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`whitespace-nowrap py-3 px-4 font-semibold text-sm rounded-t-lg border-b-2 ${
                activeTab === tabId
                    ? 'border-cyan-400 text-white'
                    : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`bg-gray-800 text-white rounded-xl shadow-2xl max-w-4xl w-full border-t-8 ${categoryColors[element.serie_quimica]?.replace('bg-', 'border-') || 'border-gray-500'} flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 flex justify-between items-start border-b border-gray-700">
                    <div>
                        <h2 className="text-4xl font-bold">{element.nombre} ({element.simbolo})</h2>
                        <p className="text-lg text-gray-400 capitalize">{element.serie_quimica}</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-700 text-3xl leading-none">&times;</button>
                </header>
                 <nav className="flex space-x-2 px-6 border-b border-gray-700">
                    <TabButton tabId="details" label="Ficha Técnica" />
                    <TabButton tabId="visualize" label="Visualizar" />
                </nav>
                <main className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                    {activeTab === 'details' && (
                         <>
                            {element.descripcion_metaforica && (
                                <blockquote className="mb-6 p-4 bg-gray-900/50 rounded-lg border-l-4 border-cyan-400">
                                    <p className="text-lg italic text-cyan-200">"{element.descripcion_metaforica}"</p>
                                    <footer className="text-right text-sm text-cyan-400 mt-2">- Protio, el 'primero'</footer>
                                </blockquote>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <DetailItem label="Número Atómico" value={element.numero_atomico} />
                                <DetailItem label="Masa Atómica" value={element.masa_atomica} unit="u" />
                                <DetailItem label="Fase (en STP)" value={element.fase_stp} />
                                <DetailItem label="Punto de Fusión" value={element.punto_fusion_k} unit="K" />
                                <DetailItem label="Punto de Ebullición" value={element.punto_ebullicion_k} unit="K" />
                                <DetailItem label="Densidad" value={element.densidad_g_cm3 || element.densidad_g_l} unit={element.densidad_g_cm3 ? 'g/cm³' : 'g/L'} />
                                <DetailItem label="Electronegatividad" value={element.electronegatividad_pauling} />
                                <div className="md:col-span-2"><DetailItem label="Config. Electrónica" value={element.configuracion_electronica} /></div>
                                <div className="md:col-span-2"><DetailItem label="Estados de Oxidación" value={Array.isArray(element.estados_oxidacion) ? element.estados_oxidacion.join(', ') : element.estados_oxidacion} /></div>
                                <div className="md:col-span-3"><DetailItem label="Descubierto por" value={element.descubierto_por} /></div>
                            </div>
                             <div className="mt-6 pt-6 border-t border-gray-700">
                                <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Acciones de Sinergia</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => onAnalyze(element)}
                                        className="p-4 bg-indigo-600 text-white rounded-lg text-left hover:bg-indigo-700 transition-colors"
                                    >
                                        <p className="font-bold">Analizar Potencial Catalítico</p>
                                        <p className="text-xs mt-1">Asignar a Dr. Pirolis para un análisis específico.</p>
                                    </button>
                                     <button onClick={() => onSynergyAction('informe', element)} className="p-4 bg-blue-600 text-white rounded-lg text-left hover:bg-blue-700 transition-colors">
                                        <p className="font-bold">Generar Informe Técnico</p>
                                        <p className="text-xs mt-1">Asignar a Dr. Pirolis para analizar propiedades y aplicaciones.</p>
                                    </button>
                                    <button onClick={() => onSynergyAction('visual', element)} className="p-4 bg-purple-600 text-white rounded-lg text-left hover:bg-purple-700 transition-colors">
                                        <p className="font-bold">Crear Campaña Visual</p>
                                        <p className="text-xs mt-1">Asignar a Marco para crear un guion de video cinematográfico.</p>
                                    </button>
                                    <button onClick={() => onSynergyAction('mercado', element)} className="p-4 bg-green-600 text-white rounded-lg text-left hover:bg-green-700 transition-colors">
                                        <p className="font-bold">Evaluar Oportunidad de Mercado</p>
                                        <p className="text-xs mt-1">Asignar a Helena para un análisis de viabilidad económica.</p>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'visualize' && (
                        <AtomVisualizer element={element} onSaveTask={onSaveTask} />
                    )}
                </main>
            </div>
        </div>,
        document.body
    );
};

const ElementCard: React.FC<{ element: PeriodicElement; onSelect: () => void; isVisible: boolean; onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => void; onMouseLeave: () => void }> = ({ element, onSelect, isVisible, onMouseEnter, onMouseLeave }) => (
    <button
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`p-2 rounded-md text-left transition-all duration-300 transform hover:scale-125 hover:z-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white ${categoryColors[element.serie_quimica] || 'bg-gray-700'} ${isVisible ? 'opacity-100' : 'opacity-20'} `}
        style={{ gridColumnStart: element.xpos, gridRowStart: element.ypos }}
        aria-label={`${element.nombre} (${element.simbolo})`}
        tabIndex={isVisible ? 0 : -1}
        title={`${element.nombre} - Nº ${element.numero_atomico}`}
    >
        <p className="text-3xl font-bold text-center">{element.simbolo}</p>
    </button>
);


const RangeSlider: React.FC<{ label: string, min: number, max: number, value: {min: number, max: number}, onChange: (newRange: {min: number, max: number}) => void, step?: number }> = ({ label, min, max, value, onChange, step = 1 }) => (
    <div>
        <label className="block text-sm font-medium text-slate-800">{label}</label>
        <div className="flex items-center gap-2 mt-1 text-slate-800">
            <span className="text-xs">{min.toFixed(0)}</span>
            <input type="range" min={min} max={max} step={step} value={value.min} onChange={(e) => onChange({ ...value, min: Math.min(Number(e.target.value), value.max) })} className="w-full accent-blue-600" />
            <input type="range" min={min} max={max} step={step} value={value.max} onChange={(e) => onChange({ ...value, max: Math.max(Number(e.target.value), value.min) })} className="w-full accent-blue-600" />
            <span className="text-xs">{max.toFixed(0)}</span>
        </div>
        <div className="text-center text-xs mt-1 text-slate-800 font-mono">
            {value.min.toFixed(0)} - {value.max.toFixed(0)}
        </div>
    </div>
);

interface InteractiveFundamentalsLabProps {
  onSaveTask: (task: Task, navigate?: boolean) => void;
  setView: (view: View) => void;
  onAnalyze: (element: PeriodicElement) => void;
}


export const InteractiveFundamentalsLab: React.FC<InteractiveFundamentalsLabProps> = ({ onSaveTask, setView, onAnalyze }) => {
    const [elements, setElements] = useState<PeriodicElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    
    // Min/max for the entire dataset
    const [massLimits, setMassLimits] = useState({ min: 0, max: 300 });
    const [fusionLimits, setFusionLimits] = useState({ min: 0, max: 4000 });
    const [negativityLimits, setNegativityLimits] = useState({ min: 0, max: 4 });

    // Current slider values
    const [massRange, setMassRange] = useState({ min: 0, max: 300 });
    const [fusionRange, setFusionRange] = useState({ min: 0, max: 4000 });
    const [negativityRange, setNegativityRange] = useState({ min: 0, max: 4 });
    
    // Tooltip State
    const [hoveredElement, setHoveredElement] = useState<PeriodicElement | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);


    useEffect(() => {
        const fetchElements = async () => {
            try {
                const response = await fetch('/data/periodic_table.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                const allElements = data.elements as PeriodicElement[];
                setElements(allElements);
                
                const masses = allElements.map(e => e.masa_atomica).filter(v => v !== null) as number[];
                const fusions = allElements.map(e => e.punto_fusion_k).filter(v => v !== null) as number[];
                const negativities = allElements.map(e => e.electronegatividad_pauling).filter(v => v !== null) as number[];
                
                const newMassLimits = { min: Math.floor(Math.min(...masses)), max: Math.ceil(Math.max(...masses)) };
                const newFusionLimits = { min: Math.floor(Math.min(...fusions)), max: Math.ceil(Math.max(...fusions)) };
                const newNegativityLimits = { min: Math.floor(Math.min(...negativities)), max: Math.ceil(Math.max(...negativities)) };

                setMassLimits(newMassLimits);
                setFusionLimits(newFusionLimits);
                setNegativityLimits(newNegativityLimits);

                setMassRange(newMassLimits);
                setFusionRange(newFusionLimits);
                setNegativityRange(newNegativityLimits);

            } catch (err) {
                setError('No se pudo cargar la base de datos de elementos.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchElements();
    }, []);

    const chemicalSeries = useMemo(() => [...new Set(elements.map(el => el.serie_quimica))], [elements]);

    useEffect(() => {
        if (selectedSeries.length === 1) {
            setSelectedGroup(selectedSeries[0]);
            setSelectedElement(null); // Ensure only one is active at a time
            setIsFilterAccordionOpen(false);
        } else {
            setSelectedGroup(null);
        }
    }, [selectedSeries]);

    const handleSeriesChange = (series: string) => {
        setSelectedSeries(prev => prev.includes(series) ? prev.filter(s => s !== series) : [...prev, series]);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedSeries([]);
        setSelectedBlock(null);
        setSelectedState(null);
        setMassRange(massLimits);
        setFusionRange(fusionLimits);
        setNegativityRange(negativityLimits);
    };

    const filteredElementNumbers = useMemo(() => {
        const filtered = elements.filter(el => {
            const searchMatch = searchTerm === '' || el.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || el.simbolo.toLowerCase().includes(searchTerm.toLowerCase());
            const seriesMatch = selectedSeries.length === 0 || selectedSeries.includes(el.serie_quimica);
            const blockMatch = !selectedBlock || el.block === selectedBlock;
            const stateMatch = !selectedState || el.fase_stp === selectedState;
            
            const massMatch = el.masa_atomica >= massRange.min && el.masa_atomica <= massRange.max;
            const fusionMatch = el.punto_fusion_k === null ? fusionRange.min === fusionLimits.min : (el.punto_fusion_k >= fusionRange.min && el.punto_fusion_k <= fusionRange.max);
            const negativityMatch = el.electronegatividad_pauling === null ? negativityRange.min === negativityLimits.min : (el.electronegatividad_pauling >= negativityRange.min && el.electronegatividad_pauling <= negativityRange.max);

            return searchMatch && seriesMatch && blockMatch && stateMatch && massMatch && fusionMatch && negativityMatch;
        });
        return new Set(filtered.map(el => el.numero_atomico));
    }, [elements, searchTerm, selectedSeries, selectedBlock, selectedState, massRange, fusionRange, negativityRange, fusionLimits, negativityLimits]);

    const handleCreateSynergyTaskForElement = (action: 'informe' | 'visual' | 'mercado', element: PeriodicElement) => {
        if (!element) return;

        const elementData = `- ${element.nombre} (${element.simbolo}): Masa=${element.masa_atomica}, Fusión=${element.punto_fusion_k || 'N/A'}K, Electroneg.=${element.electronegatividad_pauling || 'N/A'}`;
        const rawData = `Análisis del elemento: ${element.nombre}\n\nDatos Clave:\n${elementData}`;

        const baseTaskData = (() => {
            switch (action) {
                case 'informe':
                    return {
                        title: `Informe Técnico: ${element.nombre}`,
                        agentId: 'Dr. Pirolis',
                        eventType: 'ExecutiveReport' as EventType,
                        contentType: ContentType.Texto,
                        formData: { objective: `Generar un informe técnico detallado sobre las propiedades, aplicaciones y potencial catalítico de ${element.nombre}.` }
                    };
                case 'visual':
                    return {
                        title: `Campaña Visual: ${element.nombre}`,
                        agentId: 'Marco, el Narrador',
                        eventType: 'VisualCampaign' as EventType,
                        contentType: ContentType.Video,
                        formData: { objective: `Crear una campaña visual inspiradora que resalte la importancia y belleza de ${element.nombre}.` }
                    };
                case 'mercado':
                    return {
                        title: `Análisis de Mercado: ${element.nombre}`,
                        agentId: 'Helena, la Estratega',
                        eventType: 'MarketOpportunityAnalysis' as EventType,
                        contentType: ContentType.Texto,
                        formData: { objective: `Evaluar la oportunidad de mercado y el potencial de inversión para ${element.nombre}, enfocándose en aplicaciones de alto valor.` }
                    };
            }
        })();

        const fullTask: Task = {
            id: `task-synergy-element-${Date.now()}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            isIntelligent: true,
            subTasks: [
                { name: 'Análisis de contexto', status: 'pending' },
                { name: 'Generación de borrador', status: 'pending' },
                { name: 'Revisión y refinamiento', status: 'pending' },
            ],
            ...baseTaskData,
            formData: {
                ...baseTaskData.formData,
                tone: 'Profesional',
                specifics: {
                    [ContentType.Texto]: baseTaskData.contentType === ContentType.Texto ? { rawData, type: action === 'informe' ? 'Informe Técnico' : 'Análisis de Oportunidad de Mercado' } : {},
                    [ContentType.Video]: baseTaskData.contentType === ContentType.Video ? { scriptSummary: `Una secuencia cinemática mostrando las propiedades únicas de ${element.nombre}.`, artisticStyle: ['Realismo Científico / Infografía 3D'] } : {},
                    [ContentType.Imagen]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {},
                }
            }
        };

        onSaveTask(fullTask, true);
    };
    
    const handleCreateSynergyTaskForGroup = (action: 'informe' | 'visual' | 'mercado', groupName: string) => {
        const rawData = `Análisis del grupo químico: ${groupName}`;
        
        const baseTaskData = (() => {
            switch (action) {
                case 'informe':
                    return {
                        title: `Informe Técnico: ${groupName}`,
                        agentId: 'Dr. Pirolis',
                        eventType: 'ExecutiveReport' as EventType,
                        contentType: ContentType.Texto,
                        formData: { objective: `Generar un informe técnico que resuma las propiedades comunes, tendencias y aplicaciones del grupo de ${groupName}.` }
                    };
                case 'visual':
                     return {
                        title: `Campaña Visual: ${groupName}`,
                        agentId: 'Marco, el Narrador',
                        eventType: 'VisualCampaign' as EventType,
                        contentType: ContentType.Video,
                        formData: { objective: `Crear un video explicativo sobre la importancia y las características del grupo de ${groupName}.` }
                    };
                case 'mercado':
                    return {
                        title: `Análisis de Mercado: ${groupName}`,
                        agentId: 'Helena, la Estratega',
                        eventType: 'MarketOpportunityAnalysis' as EventType,
                        contentType: ContentType.Texto,
                        formData: { objective: `Evaluar el mercado de los ${groupName}, identificando oportunidades de inversión y aplicaciones industriales clave.` }
                    };
            }
        })();

         const fullTask: Task = {
            id: `task-synergy-group-${Date.now()}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            isIntelligent: true,
            subTasks: [
                { name: 'Análisis de contexto', status: 'pending' },
                { name: 'Generación de borrador', status: 'pending' },
                { name: 'Revisión y refinamiento', status: 'pending' },
            ],
            ...baseTaskData,
            formData: {
                ...baseTaskData.formData,
                tone: 'Profesional',
                 specifics: {
                    [ContentType.Texto]: baseTaskData.contentType === ContentType.Texto ? { rawData, type: 'Informe Técnico' } : {},
                    [ContentType.Video]: baseTaskData.contentType === ContentType.Video ? { scriptSummary: `Un video sobre las propiedades de los ${groupName}.` } : {},
                    [ContentType.Imagen]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {},
                }
            }
        };
        onSaveTask(fullTask, true);
    };
    
    const handleElementSelect = (element: PeriodicElement) => {
        setSelectedElement(element);
        setIsDetailModalOpen(true);
        setSelectedSeries([]);
        setIsFilterAccordionOpen(false);
    };

    const handleElementCardMouseEnter = (element: PeriodicElement, e: React.MouseEvent<HTMLButtonElement>) => {
        setHoveredElement(element);
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            top: rect.top + window.scrollY - 80,
            left: rect.left + window.scrollX + (rect.width / 2) - 100
        });
    };

    if (isLoading) return <div className="text-center p-8">Cargando Explorador Elemental...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
            `}</style>
            {isDetailModalOpen && selectedElement && <ElementDetailModal 
                element={selectedElement} 
                onClose={() => setIsDetailModalOpen(false)} 
                onAnalyze={onAnalyze}
                onSynergyAction={handleCreateSynergyTaskForElement}
                onSaveTask={onSaveTask}
            />}
            
            {hoveredElement && tooltipPosition && ReactDOM.createPortal(
                <div
                  className="fixed bg-gray-700 text-white text-sm rounded-md p-2 shadow-lg z-50 pointer-events-none animate-fade-in"
                  style={{ top: tooltipPosition.top, left: tooltipPosition.left, maxWidth: '200px' }}
                  role="tooltip"
                >
                  <p className="font-bold text-base border-b border-gray-600 pb-1 mb-1">{hoveredElement.nombre}</p>
                  <p><span className="font-semibold text-gray-400">N°:</span> {hoveredElement.numero_atomico}</p>
                  <p><span className="font-semibold text-gray-400">Masa:</span> {hoveredElement.masa_atomica > 0 ? hoveredElement.masa_atomica.toFixed(3) : ''} u</p>
                </div>,
                document.body
            )}

            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Explorador Elemental Interactivo</h1>
                <p className="text-gray-400 mt-2">Una herramienta de análisis de materiales profesional.</p>
            </header>

            <Accordion 
                title="Panel de Control (Buscadores Inteligentes)"
                isOpen={isFilterAccordionOpen}
                onToggle={() => setIsFilterAccordionOpen(!isFilterAccordionOpen)}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-4">
                        <input type="text" placeholder="Búsqueda Rápida..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-200 border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:border-blue-500" />
                        <div className="space-y-2">
                             <h4 className="font-semibold text-slate-800">Filtros por Bloque</h4>
                            <div className="flex gap-2">
                                {['s', 'p', 'd', 'f'].map(block => <button key={block} onClick={() => setSelectedBlock(selectedBlock === block ? null : block)} className={`w-full py-1 rounded transition-colors ${selectedBlock === block ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-800 hover:bg-slate-400'}`}>{block}</button>)}
                            </div>
                        </div>
                         <div className="space-y-2">
                             <h4 className="font-semibold text-slate-800">Filtros por Estado (STP)</h4>
                             <div className="flex gap-2">
                                {['Sólido', 'Líquido', 'Gas'].map(state => <button key={state} onClick={() => setSelectedState(selectedState === state ? null : state)} className={`w-full py-1 rounded text-xs transition-colors ${selectedState === state ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-800 hover:bg-slate-400'}`}>{state}</button>)}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="font-semibold text-slate-800">Filtros de Grupo (Serie Química)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm max-h-48 overflow-y-auto pr-2">
                            {chemicalSeries.map(series => (
                                <label key={series} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-slate-100">
                                    <input type="checkbox" checked={selectedSeries.includes(series)} onChange={() => handleSeriesChange(series)} className="rounded bg-slate-200 border-slate-400 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-slate-800">{series}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800">Filtros Avanzados (Especialistas)</h4>
                        <RangeSlider label="Masa Atómica" min={massLimits.min} max={massLimits.max} value={massRange} onChange={setMassRange} />
                        <RangeSlider label="Punto de Fusión (K)" min={fusionLimits.min} max={fusionLimits.max} value={fusionRange} onChange={setFusionRange} />
                        <RangeSlider label="Electronegatividad" min={negativityLimits.min} max={negativityLimits.max} value={negativityRange} onChange={setNegativityRange} step={0.1} />
                    </div>
                </div>
                <div className="mt-4 text-right">
                    <button onClick={resetFilters} className="text-sm font-semibold text-slate-500 hover:text-blue-500">Limpiar Filtros</button>
                </div>
            </Accordion>

            {selectedGroup && (
                <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold text-cyan-400">Acciones Sinérgicas (Nexo Sinérgico)</h3>
                    <p className="text-sm text-gray-300 mb-4">Grupos seleccionados: {selectedGroup}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => handleCreateSynergyTaskForGroup('informe', selectedGroup)} className="p-4 bg-blue-600 text-white rounded-lg text-left hover:bg-blue-700 transition-colors">
                            <p className="font-bold">Generar Informe Técnico</p>
                            <p className="text-xs mt-1">Asignar a Dr. Pirolis para analizar propiedades y aplicaciones.</p>
                        </button>
                        <button onClick={() => handleCreateSynergyTaskForGroup('visual', selectedGroup)} className="p-4 bg-purple-600 text-white rounded-lg text-left hover:bg-purple-700 transition-colors">
                            <p className="font-bold">Crear Campaña Visual</p>
                            <p className="text-xs mt-1">Asignar a Marco para crear un guion de video cinematográfico.</p>
                        </button>
                        <button onClick={() => handleCreateSynergyTaskForGroup('mercado', selectedGroup)} className="p-4 bg-green-600 text-white rounded-lg text-left hover:bg-green-700 transition-colors">
                            <p className="font-bold">Evaluar Oportunidad de Mercado</p>
                            <p className="text-xs mt-1">Asignar a Helena para un análisis de viabilidad económica.</p>
                        </button>
                    </div>
                </div>
            )}

            <div 
                className="mt-8 grid grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(10,minmax(0,1fr))] gap-1 mx-auto max-w-7xl aspect-[18/10]"
                onMouseLeave={() => {
                    setHoveredElement(null);
                    setTooltipPosition(null);
                }}
            >
                {elements.map(element => (
                    <ElementCard 
                        key={element.numero_atomico} 
                        element={element} 
                        onSelect={() => handleElementSelect(element)} 
                        isVisible={filteredElementNumbers.has(element.numero_atomico)}
                        onMouseEnter={(e) => handleElementCardMouseEnter(element, e)}
                        onMouseLeave={() => {
                            setHoveredElement(null);
                            setTooltipPosition(null);
                        }}
                    />
                ))}
            </div>
            <div className="text-center mt-4 text-xs text-gray-500">
                <p>Mostrando {filteredElementNumbers.size} de {elements.length} elementos.</p>
            </div>
        </div>
    );
};
