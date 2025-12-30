import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SynthesizedCatalyst } from '../../types';
import { getAiCatalystAnalysis } from '../../services/geminiService';
import { TaskManager, type COPRESETPayload } from '../../services/taskManager';
import { Accordion } from '../form/Accordion';
import { FormInput } from '../form/FormControls';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase';

declare global {
    interface Window {
        $3Dmol: any;
    }
}

type FrameworkType = 'AEL' | 'AST' | 'MFI' | null;

interface ZeoliteViewerProps {
    frameworkType: FrameworkType;
}

const ZeoliteViewer: React.FC<ZeoliteViewerProps> = ({ frameworkType }) => {
    const viewerContainerRef = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<any>(null);
    const sphereInstance = useRef<any>(null);
    const surfaceInstance = useRef<any>(null);

    const [displayStyle, setDisplayStyle] = useState<'siOnly' | 'siAndO'>('siOnly');
    const [stickStyle, setStickStyle] = useState<'stick' | 'wireframe' | 'ballAndStick'>('stick');
    const [surfaceDisplay, setSurfaceDisplay] = useState<'noSurface' | 'cages' | 'channels'>('noSurface');
    const [showSphere, setShowSphere] = useState(true);
    const [sphereDiameter, setSphereDiameter] = useState(7.2);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect for creating/destroying viewer and loading model data
    useEffect(() => {
        if (!frameworkType || !viewerContainerRef.current) {
            if (viewerInstance.current) {
                viewerInstance.current.clear();
                viewerInstance.current = null;
            }
            setIsLoading(false);
            setError(null);
            return;
        }

        if (typeof (window as any).$3Dmol === 'undefined') {
            setError("La librería de visualización 3D (3Dmol.js) no se pudo cargar. Comprueba tu conexión e inténtalo de nuevo.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        let viewer = (window as any).$3Dmol.createViewer(viewerContainerRef.current, {
            defaultcolors: (window as any).$3Dmol.elementColors.Jmol
        });
        viewerInstance.current = viewer;

        let cifData: string | undefined;
        switch (frameworkType) {
            case 'AEL': cifData = KNOWLEDGE_BASE.ZEOLITE_FRAMEWORK_AEL; break;
            case 'AST': cifData = KNOWLEDGE_BASE.ZEOLITE_FRAMEWORK_AST; break;
            case 'MFI': cifData = KNOWLEDGE_BASE.ZEOLITE_FRAMEWORK_MFI; break;
        }

        if (cifData) {
            try {
                viewer.addModel(cifData.trim(), 'cif');
                viewer.zoomTo();
                viewer.render();
            } catch (err) {
                console.error("Error adding CIF model from local data:", err);
                setError(`Error al procesar la estructura para ${frameworkType}.`);
            }
        } else {
            setError(`No se encontró la estructura para ${frameworkType}.`);
        }
        setIsLoading(false);

        return () => {
            if (viewerInstance.current) {
                viewerInstance.current.clear();
                viewerInstance.current = null;
            }
        };
    }, [frameworkType]);

    // Effect for updating styles on the existing viewer
    useEffect(() => {
        const viewer = viewerInstance.current;
        if (!viewer) return;

        viewer.setStyle({}, {});

        const styleSpec: any = {};
        if (stickStyle === 'wireframe') styleSpec.wireframe = { radius: 0.05 };
        else if (stickStyle === 'stick') styleSpec.stick = {};

        const atomsToStyle = displayStyle === 'siOnly' ? { elem: ['Si', 'Al', 'P'] } : {};

        viewer.setStyle(atomsToStyle, styleSpec);

        if (stickStyle === 'ballAndStick') {
            viewer.setStyle(atomsToStyle, { stick: { radius: 0.1 } });
            viewer.addStyle(atomsToStyle, { sphere: { scale: 0.3 } });
        }

        if (surfaceInstance.current) {
            viewer.removeSurface(surfaceInstance.current);
            surfaceInstance.current = null;
        }
        if (surfaceDisplay !== 'noSurface') {
            const surfaceOptions = {
                opacity: 0.6,
                color: surfaceDisplay === 'cages' ? '#a78bfa' : '#67e8f9',
                probeRadius: 1.4 // Use a probe to detect pore surfaces
            };
            // Use Solvent Accessible Surface to visualize channels/cages, based on all atoms.
            surfaceInstance.current = viewer.addSurface((window as any).$3Dmol.SurfaceType.SAS, surfaceOptions, {});
        }

        if (sphereInstance.current) {
            viewer.removeSphere(sphereInstance.current);
            sphereInstance.current = null;
        }
        if (showSphere) {
            sphereInstance.current = viewer.addSphere({
                radius: sphereDiameter / 2.0,
                color: '#f87171', // red-400
                alpha: 0.75
            });
        }

        viewer.render();
    }, [displayStyle, stickStyle, surfaceDisplay, showSphere, sphereDiameter, frameworkType]); // Rerun on frameworkType change to style the new model

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div ref={viewerContainerRef} className="md:col-span-2 relative w-full aspect-square bg-black rounded-lg">
                {(isLoading || error) && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span className="ml-3">Cargando Estructura...</span>
                            </>
                        ) : (
                            <span className="text-red-400 p-4">{error}</span>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-4 text-sm text-slate-300">
                <h4 className="font-bold text-lg text-white">Zeolite Viewer</h4>
                <div>
                    <h5 className="font-semibold mb-2">Display Style</h5>
                    <div className="space-y-1">
                        <label className="flex items-center"><input type="radio" name="displayStyle" value="siOnly" checked={displayStyle === 'siOnly'} onChange={e => setDisplayStyle(e.target.value as any)} className="mr-2" /> Si only (T atoms)</label>
                        <label className="flex items-center"><input type="radio" name="displayStyle" value="siAndO" checked={displayStyle === 'siAndO'} onChange={e => setDisplayStyle(e.target.value as any)} className="mr-2" /> Si and O</label>
                    </div>
                </div>

                <div>
                    <h5 className="font-semibold mb-2">Style</h5>
                    <div className="space-y-1">
                        <label className="flex items-center"><input type="radio" name="stickStyle" value="wireframe" checked={stickStyle === 'wireframe'} onChange={e => setStickStyle(e.target.value as any)} className="mr-2" /> Wireframe</label>
                        <label className="flex items-center"><input type="radio" name="stickStyle" value="stick" checked={stickStyle === 'stick'} onChange={e => setStickStyle(e.target.value as any)} className="mr-2" /> Stick</label>
                        <label className="flex items-center"><input type="radio" name="stickStyle" value="ballAndStick" checked={stickStyle === 'ballAndStick'} onChange={e => setStickStyle(e.target.value as any)} className="mr-2" /> Ball and Stick</label>
                    </div>
                </div>

                <div>
                    <h5 className="font-semibold mb-2">Surface Display</h5>
                    <div className="space-y-1">
                        <label className="flex items-center"><input type="radio" name="surface" value="noSurface" checked={surfaceDisplay === 'noSurface'} onChange={e => setSurfaceDisplay(e.target.value as any)} className="mr-2" /> No Surface</label>
                        <label className={`flex items-center ${frameworkType !== 'AST' ? 'opacity-50' : ''}`}><input type="radio" name="surface" value="cages" checked={surfaceDisplay === 'cages'} onChange={e => setSurfaceDisplay(e.target.value as any)} className="mr-2" disabled={frameworkType !== 'AST'} /> Cages</label>
                        <label className={`flex items-center ${frameworkType !== 'AEL' && frameworkType !== 'MFI' ? 'opacity-50' : ''}`}><input type="radio" name="surface" value="channels" checked={surfaceDisplay === 'channels'} onChange={e => setSurfaceDisplay(e.target.value as any)} className="mr-2" disabled={frameworkType !== 'AEL' && frameworkType !== 'MFI'} /> Channels</label>
                    </div>
                </div>

                <div>
                    <h5 className="font-semibold mb-2">Molecule Superposition</h5>
                    <label className="flex items-center mb-2"><input type="checkbox" checked={showSphere} onChange={e => setShowSphere(e.target.checked)} className="mr-2" /> Show Molecule Sphere</label>
                    {showSphere && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-medium">Diámetro</label>
                                <span className="font-mono text-xs bg-slate-600 px-2 py-0.5 rounded-md">{sphereDiameter.toFixed(1)} Å</span>
                            </div>
                            <input type="range" min="2.0" max="10.0" step="0.1" value={sphereDiameter} onChange={e => setSphereDiameter(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const Panel: React.FC<React.PropsWithChildren<{ title: string; }>> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-slate-700 pb-3">{title}</h3>
        <div className="space-y-6">{children}</div>
    </div>
);

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group inline-block">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full mb-2 w-64 bg-slate-700 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip: string; recommended?: { min: number; max: number } }> = ({ label, value, min, max, step, unit, onChange, tooltip, recommended }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {label}
                <InfoTooltip text={tooltip} />
            </label>
            <span className="font-mono text-sm bg-slate-600 text-white px-2 py-0.5 rounded-md">{value.toFixed(1)} {unit}</span>
        </div>
        <div className="relative">
            <input
                type="range"
                min={min} max={max} step={step} value={value}
                onChange={onChange}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            {recommended && (
                <div 
                    className="absolute top-0 h-2 bg-green-500/30 rounded-lg pointer-events-none"
                    style={{
                        left: `${((recommended.min - min) / (max - min)) * 100}%`,
                        width: `${((recommended.max - recommended.min) / (max - min)) * 100}%`
                    }}
                />
            )}
        </div>
        {recommended && (
            <p className="text-xs text-green-400 mt-1">Rango recomendado: {recommended.min}-{recommended.max} {unit}</p>
        )}
    </div>
);

const ResultsTable: React.FC<{ catalyst: SynthesizedCatalyst }> = ({ catalyst }) => {
    const { properties, frameworkType } = catalyst;

    const getSelectivityClass = (selectivity: string) => {
        if (selectivity === 'Alta') return 'text-green-400';
        if (selectivity === 'Media') return 'text-yellow-400';
        return 'text-red-400';
    };

    // Threshold-based color coding
    const getValueClass = (value: number, thresholds: { good: number, warning: number }) => {
        if (value >= thresholds.good) return 'text-green-400';
        if (value >= thresholds.warning) return 'text-yellow-300';
        return 'text-red-400';
    };

    // Critical value detection
    const hasCriticalMesopore = properties.mesoporeVolume < 0.05;
    const hasLowCokeResistance = properties.cokeResistance < 60;

    return (
        <div className="space-y-2">
            {/* Critical issues banner */}
            {(hasCriticalMesopore || hasLowCokeResistance) && (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm">
                            <p className="font-semibold text-red-300 mb-1">Advertencias Críticas:</p>
                            <ul className="list-disc list-inside space-y-1 text-red-200">
                                {hasCriticalMesopore && <li>Volumen de mesoporo insuficiente - Limitaciones severas de transporte</li>}
                                {hasLowCokeResistance && <li>Baja resistencia al coque - Desactivación rápida esperada</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-semibold text-slate-400">Propiedad</div>
                <div className="font-semibold text-slate-400 text-right">Valor</div>

                <div className="text-slate-300">Framework Type</div>
                <div className="text-right font-mono font-bold text-cyan-400">{frameworkType}</div>

                <div className="text-slate-300">Acidez</div>
                <div className={`text-right font-mono font-bold ${getValueClass(properties.acidity, { good: 40, warning: 20 })}`}>
                    {properties.acidity.toFixed(1)}
                </div>

                <div className="text-slate-300">Estabilidad Térmica</div>
                <div className={`text-right font-mono font-bold ${getValueClass(properties.thermalStability, { good: 80, warning: 60 })}`}>
                    {properties.thermalStability.toFixed(1)}
                </div>

                <div className="text-slate-300 flex items-center gap-1">
                    <span>Resistencia al Coque</span>
                    {hasLowCokeResistance && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-300">
                            ⚠
                        </span>
                    )}
                </div>
                <div className={`text-right font-mono font-bold ${getValueClass(properties.cokeResistance, { good: 70, warning: 50 })}`}>
                    {properties.cokeResistance.toFixed(1)}
                </div>

                <div className="text-slate-300">Selectividad de Forma</div>
                <div className={`text-right font-mono font-bold ${getSelectivityClass(properties.shapeSelectivity)}`}>
                    {properties.shapeSelectivity}
                </div>

                <div className="text-slate-300">Tamaño de Cristal</div>
                <div className="text-right font-mono">{properties.crystalSize.toFixed(0)} nm</div>

                <div className="text-slate-300">Volumen de Microporo</div>
                <div className="text-right font-mono">{properties.microporeVolume.toFixed(3)} cm³/g</div>

                <div className="text-slate-300 flex items-center gap-1">
                    <span>Volumen de Mesoporo</span>
                    {hasCriticalMesopore && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-300">
                            CRÍTICO
                        </span>
                    )}
                </div>
                <div className={`text-right font-mono font-bold ${hasCriticalMesopore ? 'text-red-400' : getValueClass(properties.mesoporeVolume * 100, { good: 5, warning: 2 })}`}>
                    {properties.mesoporeVolume.toFixed(3)} cm³/g
                </div>
            </div>
        </div>
    );
};


interface CatalystLabProps {
    onSendToCreator?: (payload: COPRESETPayload) => void;
}

export const CatalystLab: React.FC<CatalystLabProps> = ({ onSendToCreator }) => {
    const [name, setName] = useState('Zeolita Avanzada Z-2');
    const [siAlRatio, setSiAlRatio] = useState(27.0);
    const [templateType, setTemplateType] = useState<'Orgánico (TPAOH)' | 'Inorgánico (Na+)' | 'Sin Plantilla'>('Orgánico (TPAOH)');
    const [crystallizationTime, setCrystallizationTime] = useState(48.0);
    const [calcinationTemp, setCalcinationTemp] = useState(580.0);

    const [synthesizedCatalyst, setSynthesizedCatalyst] = useState<SynthesizedCatalyst | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSynthesize = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setSynthesizedCatalyst(null);
        setAiAnalysis('');

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Step 1: Simulate Catalyst Properties
            let frameworkType: FrameworkType;
            if (siAlRatio > 40) frameworkType = 'MFI';
            else if (siAlRatio > 15) frameworkType = 'AEL';
            else frameworkType = 'AST';

            let acidity = 100 - (siAlRatio * 1.8);
            if (calcinationTemp > 550) acidity -= (calcinationTemp - 550) * 0.05;

            const thermalStability = siAlRatio * 1.5 + (calcinationTemp / 10);

            let microporeVolume = 0.18 - (siAlRatio / 500);
            if (templateType === 'Orgánico (TPAOH)') microporeVolume *= 1.15;
            if (templateType === 'Inorgánico (Na+)') microporeVolume *= 0.9;
            if (frameworkType === 'AST') microporeVolume *= 0.1; // AST has smaller pores generally

            let mesoporeVolume = 0.01;
            if (calcinationTemp > 600) mesoporeVolume += (calcinationTemp - 600) * 0.0005;
            if (frameworkType === 'AEL') mesoporeVolume *= 1.2;

            const crystalSize = 80 + crystallizationTime * 4;

            const cokeResistance = thermalStability * 0.4 + (100 - acidity) * 0.3 + (mesoporeVolume * 1000) * 0.3;

            let shapeSelectivity: 'Alta' | 'Media' | 'Baja';
            if (frameworkType === 'MFI') shapeSelectivity = 'Alta';
            else if (frameworkType === 'AEL') shapeSelectivity = 'Media';
            else shapeSelectivity = 'Baja';

            const catalyst: SynthesizedCatalyst = {
                name,
                siAlRatio,
                templateType,
                crystallizationTime,
                calcinationTemp,
                properties: {
                    acidity: Math.max(5, Math.min(95, acidity)),
                    thermalStability: Math.max(10, Math.min(98, thermalStability)),
                    cokeResistance: Math.max(10, Math.min(95, cokeResistance)),
                    shapeSelectivity,
                    microporeVolume: Math.max(0.001, microporeVolume),
                    mesoporeVolume: Math.max(0.001, mesoporeVolume),
                    crystalSize: Math.max(50, crystalSize),
                },
                frameworkType,
            };
            setSynthesizedCatalyst(catalyst);

            // Step 2: Get AI Analysis (with error handling)
            try {
                const analysis = await getAiCatalystAnalysis(catalyst);
                setAiAnalysis(analysis);
            } catch (aiError) {
                console.error('Error getting AI analysis:', aiError);
                setAiAnalysis('**Análisis no disponible**\n\nEl Dr. Pirolis no pudo generar el análisis en este momento. Las propiedades del catalizador se han calculado correctamente y se muestran arriba.');
            }

        } catch (e) {
            console.error('Error in handleSynthesize:', e);
            setError(e instanceof Error ? e.message : 'Error desconocido durante la simulación.');
        } finally {
            setIsLoading(false);
        }
    }, [name, siAlRatio, templateType, crystallizationTime, calcinationTemp]);

    const handleSaveToHub = () => {
        alert('Funcionalidad para guardar catalizadores en el Hub estará disponible próximamente.');
    };

    const handleSendToCreator = () => {
        if (!synthesizedCatalyst || !aiAnalysis) {
            return;
        }

        // Generate COPRESET payload
        const payload = TaskManager.generateCatalystCOPRESET(synthesizedCatalyst, aiAnalysis);
        TaskManager.logPayload(payload);

        // Trigger callback
        if (onSendToCreator) {
            onSendToCreator(payload);
        }
    };

    return (
        <div className="bg-slate-900 text-white p-8 rounded-lg min-h-full font-sans">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold">Laboratorio de Catalizadores (Avanzado)</h1>
                <p className="text-slate-400 mt-2">Diseña, sintetiza y evalúa catalizadores de zeolita virtuales con asistencia de IA.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Panel title="Configuración de Síntesis">
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                        <p className="text-sm text-blue-300">
                            💡 <strong>Guía rápida:</strong> Para catalizadores de alta selectividad usa Si/Al alto (40-100) con plantilla orgánica. 
                            Para máxima acidez usa Si/Al bajo (5-15) pero sacrificarás estabilidad.
                        </p>
                    </div>
                    <FormInput
                        label="Nombre del Catalizador"
                        id="catalystName"
                        name="catalystName"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                    />

                    <Accordion title="Síntesis Hidrotermal" defaultOpen>
                        <Slider label="Relación Si/Al" value={siAlRatio} min={5} max={100} step={1} unit="" onChange={e => setSiAlRatio(Number(e.target.value))} tooltip="Controla la acidez y estabilidad. Valores bajos (5-15) = alta acidez pero baja estabilidad. Valores altos (40-100) = baja acidez pero alta estabilidad y selectividad." recommended={{ min: 15, max: 50 }} />
                        <div>
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                Tipo de Plantilla (SDA) 
                                <InfoTooltip text="El Agente Director de Estructura guía la formación de poros. TPAOH crea poros más grandes y ordenados, Na+ es más económico pero menos preciso, y sin plantilla resulta en materiales menos estructurados." />
                            </label>
                            <select value={templateType} onChange={e => setTemplateType(e.target.value as any)} className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md">
                                <option value="Orgánico (TPAOH)">🧪 Orgánico (TPAOH) - Mejor estructura, más caro</option>
                                <option value="Inorgánico (Na+)">⚗️ Inorgánico (Na+) - Económico, estructura básica</option>
                                <option value="Sin Plantilla">🔬 Sin Plantilla - Materiales amorfos, bajo costo</option>
                            </select>
                        </div>
                        <Slider label="Tiempo de Cristalización" value={crystallizationTime} min={6} max={120} step={1} unit="horas" onChange={e => setCrystallizationTime(Number(e.target.value))} tooltip="Cuánto tiempo se deja cristalizar. Más tiempo = cristales más grandes y mejor orden, pero mayor costo energético." recommended={{ min: 24, max: 72 }} />
                    </Accordion>

                    <Accordion title="Tratamiento Post-Síntesis" defaultOpen>
                        <Slider label="Temperatura de Calcinación" value={calcinationTemp} min={400} max={800} step={10} unit="°C" onChange={e => setCalcinationTemp(Number(e.target.value))} tooltip="Quema la plantilla orgánica y activa el catalizador. 550-600°C es óptimo. Temperaturas >650°C pueden dañar la estructura." recommended={{ min: 550, max: 600 }} />
                    </Accordion>


                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSynthesize();
                        }}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-500 transition-colors"
                    >
                        {isLoading ? 'Sintetizando...' : 'Sintetizar y Evaluar'}
                    </button>
                </Panel>

                <Panel title="Evaluación del Catalizador">
                    {isLoading && <div className="flex justify-center items-center h-full"><p className="text-slate-400 animate-pulse">Calculando propiedades y consultando al Dr. Pirolis...</p></div>}
                    {error && <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md text-sm">{error}</div>}
                    {synthesizedCatalyst && (
                        <div className="space-y-6 animate-fade-in">
                            <h4 className="text-center font-bold text-lg">{synthesizedCatalyst.name}</h4>

                            <ResultsTable catalyst={synthesizedCatalyst} />

                            <div className="mt-4 p-3 bg-slate-800/50 border border-slate-600 rounded-md">
                                <p className="text-xs text-slate-400">
                                    📊 <strong>Interpretación:</strong> Acidez alta = buena actividad catalítica. Estabilidad térmica alta = durabilidad. 
                                    Resistencia al coque alta = menos mantenimiento. Selectividad alta = productos más puros.
                                </p>
                            </div>

                            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                {/* ZeoliteViewer temporarily disabled due to 3D library issues */}
                                <div className="text-center py-8 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p className="font-semibold">Visualizador 3D ({synthesizedCatalyst.frameworkType})</p>
                                    <p className="text-sm mt-1">Las propiedades del catalizador se han calculado correctamente</p>
                                </div>
                            </div>

                            {aiAnalysis && (
                                <div className="pt-4 border-t border-slate-700">
                                    <h4 className="font-semibold text-lg text-cyan-400 mb-2">Análisis de Dr. Pirolis</h4>
                                    <div className="prose prose-sm prose-invert bg-slate-900/50 p-4 rounded-md border border-slate-700 max-w-none max-h-96 overflow-y-auto">
                                        {aiAnalysis.split('\n').map((line, idx) => {
                                            // Basic markdown rendering
                                            if (line.startsWith('###')) {
                                                return <h3 key={idx} className="text-lg font-bold text-cyan-300 mt-4 mb-2">{line.replace(/^###\s*/, '')}</h3>;
                                            } else if (line.startsWith('##')) {
                                                return <h2 key={idx} className="text-xl font-bold text-cyan-200 mt-4 mb-2">{line.replace(/^##\s*/, '')}</h2>;
                                            } else if (line.startsWith('**') && line.endsWith('**')) {
                                                return <p key={idx} className="font-bold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
                                            } else if (line.startsWith('- ')) {
                                                return <li key={idx} className="ml-4 text-slate-300">{line.substring(2)}</li>;
                                            } else if (line.trim() === '') {
                                                return <br key={idx} />;
                                            } else {
                                                return <p key={idx} className="text-slate-300 my-1">{line}</p>;
                                            }
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleSendToCreator}
                                    className="flex-1 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    Enviar al Creador de Prompts
                                </button>
                                <button onClick={handleSaveToHub} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                    Guardar Catalizador en el Hub
                                </button>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && !synthesizedCatalyst && (
                        <div className="flex justify-center items-center h-full text-slate-500">
                            <p>Los resultados de la síntesis aparecerán aquí.</p>
                        </div>
                    )}
                </Panel>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};