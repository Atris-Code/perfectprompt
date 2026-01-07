import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PeriodicElement, Task } from '../../types';
import { ContentType, EventType } from '../../types';
import { Accordion } from '../form/Accordion';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface AtomVisualizerProps {
    element: PeriodicElement;
    onSaveTask: (task: Task, navigate?: boolean) => void;
}

// Using PubChem CIDs for reliability
const ELEMENT_STRUCTURE_MAP: Record<string, { cid?: number; special?: 'noble' | 'diatomic' }> = {
    'Hidrógeno': { special: 'diatomic' },
    'Helio': { special: 'noble' },
    'Carbono': { cid: 5460634 },   // Diamond
    'Nitrógeno': { special: 'diatomic' },
    'Oxígeno': { special: 'diatomic' },
    'Neón': { special: 'noble' },
    'Sodio': { cid: 102404453 }, // Sodium (bcc)
    'Hierro': { cid: 102410332 },  // Iron (bcc)
    'Cobre': { cid: 9051433 },    // Copper (fcc)
    'Oro': { cid: 16213797 },     // Gold (fcc)
    'Aluminio': { cid: 16213454 }, // Aluminum (fcc)
    'Silicio': { cid: 5461123 },   // Silicon (diamond cubic)
    'Argón': { special: 'noble' },
    'Kriptón': { special: 'noble' },
    'Xenón': { special: 'noble' },
    'Radón': { special: 'noble' },
    'Oganesón': { special: 'noble' },
};


export const AtomVisualizer: React.FC<AtomVisualizerProps> = ({ element, onSaveTask }) => {
    const viewerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Control States
    const [atomStyle, setAtomStyle] = useState<'line' | 'stick' | 'ballAndStick' | 'sphere'>('ballAndStick');
    const [surfaceStyle, setSurfaceStyle] = useState<'none' | 'dots' | 'vdw' | 'sas' | 'ms'>('none');
    const [bgColor, setBgColor] = useState('#111827'); // gray-900

    // Helper function to render fallback models (memoized)
    const renderFallbackModel = useCallback((viewer: any, elem: PeriodicElement, special: 'noble' | 'diatomic' | null) => {
        try {
            if (!viewer || !elem) return;
            
            const elementColor = window.$3Dmol?.elementColors?.Jmol?.[elem.simbolo] || 0x808080;
            
            if (special === 'noble') {
                // Noble gas: show as sphere with outer shell
                viewer.addSphere({ center: { x: 0, y: 0, z: 0 }, radius: 1.8, color: elementColor });
                viewer.addSphere({ center: { x: 0, y: 0, z: 0 }, radius: 2.5, color: 'white', opacity: 0.2 });
            } else if (special === 'diatomic') {
                // Diatomic molecule
                const model = viewer.addModel();
                model.addAtom({ elem: elem.simbolo, x: -0.6, y: 0, z: 0 });
                model.addAtom({ elem: elem.simbolo, x: 0.6, y: 0, z: 0 });
                model.addBond({ start: 0, end: 1 });
                viewer.setStyle({}, { sphere: { scale: 0.8 }, stick: { colorscheme: 'Jmol' } });
            } else {
                // Generic atom representation
                viewer.addSphere({ center: { x: 0, y: 0, z: 0 }, radius: 1.5, color: elementColor });
            }
        } catch (err) {
            console.error("Error rendering fallback model:", err);
            try {
                viewer.addSphere({ center: { x: 0, y: 0, z: 0 }, radius: 1.5, color: 0x999999 });
            } catch (e) {
                console.error("Critical error:", e);
            }
        }
    }, []);

    // Effect for creating viewer and loading model data
    useEffect(() => {
        if (!element || !containerRef.current) return;

        let isMounted = true;
        let viewer: any = null;

        const initViewer = () => {
            if (!isMounted) return;

            // Wait for container dimensions
            if (containerRef.current && (containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0)) {
                setTimeout(initViewer, 100);
                return;
            }

            // Double check for library availability
            if (typeof window.$3Dmol === 'undefined') {
                setError("La librería de visualización 3D no se ha cargado. Por favor, recarga la página.");
                setIsLoading(false);
                return;
            }

            try {
                if (containerRef.current) {
                    containerRef.current.innerHTML = ''; // Clear previous viewer
                }

                // Initialize viewer with try-catch
                try {
                    viewer = window.$3Dmol.createViewer(containerRef.current, {
                        defaultcolors: window.$3Dmol.elementColors.Jmol,
                        backgroundColor: bgColor,
                    });
                } catch (creationError) {
                    console.error("Error creating 3D viewer:", creationError);
                    setError("Error al inicializar el visualizador 3D.");
                    setIsLoading(false);
                    return;
                }

                viewerRef.current = viewer;
                setError('');
                setIsLoading(true);

                const structureInfo = ELEMENT_STRUCTURE_MAP[element.nombre];
                const cid = structureInfo?.cid;
                const special = structureInfo?.special;
                
                const finishLoading = () => {
                    if (!isMounted) return;
                    setTimeout(() => {
                        try {
                            if (viewer) {
                                viewer.resize(); // Ensure canvas matches container dimensions
                                viewer.zoomTo();
                                viewer.render();
                            }
                        } catch (err) {
                            console.error("Error in viewer zoom/render:", err);
                        }
                        if (isMounted) setIsLoading(false);
                    }, 100);
                };

                if (cid) {
                    // Start download
                    const downloadPromise = window.$3Dmol.download(`cid:${cid}`, viewer, {format: 'sdf'});
                    
                    // Handle output which might be a Promise or undefined depending on version
                    if (downloadPromise && typeof downloadPromise.then === 'function') {
                        downloadPromise
                            .then(() => {
                                if (!isMounted) return;
                                try {
                                    viewer.addUnitCell();
                                } catch (err) {
                                    console.warn("Could not add unit cell:", err);
                                }
                                finishLoading();
                            })
                            .catch((err: any) => {
                                if (!isMounted) return;
                                console.error("Failed to load model by CID", err);
                                renderFallbackModel(viewer, element, special);
                                finishLoading();
                            });
                    } else {
                        // If logic is synchronous or returns void (older versions)
                        // Wait a tick and then finish
                        finishLoading();
                    }
                } else {
                    renderFallbackModel(viewer, element, special);
                    finishLoading();
                }

            } catch (globalError) {
                console.error("Critical error in AtomVisualizer:", globalError);
                if (isMounted) {
                    setError("Error crítico en el componente de visualización.");
                    setIsLoading(false);
                }
            }
        };

        // Helper to wait for container layout
        const timer = setTimeout(initViewer, 100); 

        // Add ResizeObserver to handle dynamic layout changes
        const resizeObserver = new ResizeObserver(() => {
            if (viewerRef.current) {
                viewerRef.current.resize();
            }
        });
        
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            isMounted = false;
            clearTimeout(timer);
            resizeObserver.disconnect();
            if (viewerRef.current) {
                viewerRef.current = null;
            }
        };
        
    }, [element, bgColor, renderFallbackModel]);

    // Effect for updating styles
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || isLoading) return;
        
        // Clear everything before applying new styles
        viewer.removeAllSurfaces();
        viewer.setStyle({}, {});

        // 1. Apply Atomic Style
        switch (atomStyle) {
            case 'line':
                viewer.setStyle({}, { line: {} });
                break;
            case 'stick':
                viewer.setStyle({}, { stick: {} });
                break;
            case 'ballAndStick':
                viewer.setStyle({}, { stick: { radius: 0.1 }, sphere: { scale: 0.4 } });
                break;
            case 'sphere':
                viewer.setStyle({}, { sphere: {} });
                break;
        }

        // 2. Apply Surface Style (if any)
        if (surfaceStyle !== 'none') {
            const surfaceOptions = { opacity: 0.85, colorscheme: 'Jmol' };
            let surfaceType;

            switch (surfaceStyle) {
                case 'dots':
                    viewer.addSurface(window.$3Dmol.SurfaceType.VDW, { style: 'dots' });
                    break;
                case 'vdw':
                    surfaceType = window.$3Dmol.SurfaceType.VDW;
                    break;
                case 'sas':
                    surfaceType = window.$3Dmol.SurfaceType.SAS;
                    break;
                case 'ms':
                    surfaceType = window.$3Dmol.SurfaceType.MS;
                    break;
            }
            if (surfaceType) {
                viewer.addSurface(surfaceType, surfaceOptions);
            }
        }
        
        viewer.render();

    }, [atomStyle, surfaceStyle, isLoading]); // depends on styles and loading state

    const handleExportImage = () => {
        if (viewerRef.current) {
            const canvas = viewerRef.current.getCanvas();
            const imageDataUri = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imageDataUri;
            link.download = `${element.nombre}_structure.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const handleSendToCreator = useCallback(async () => {
        if (!viewerRef.current) {
            alert('El visualizador no está listo.');
            return;
        }
        try {
            const canvas = viewerRef.current.getCanvas();
            const imageDataUri = canvas.toDataURL('image/png');
            const task: Task = {
                id: `visualizer-task-${Date.now()}`,
                title: `Visualización 3D: ${element.nombre}`,
                createdAt: Date.now(),
                status: 'Por Hacer',
                contentType: ContentType.Imagen,
                formData: {
                    objective: `Crear una imagen que muestre la estructura atómica de ${element.nombre}, con estilo atómico '${atomStyle}' y una superficie tipo '${surfaceStyle}'.`,
                    specifics: {
                        [ContentType.Imagen]: {
                            uploadedImage: {
                                data: imageDataUri,
                                name: `${element.nombre.toLowerCase()}_structure.png`,
                                type: 'image/png',
                            },
                            elements: `Estructura cristalina de ${element.nombre}`,
                            lighting: 'Iluminación de estudio',
                            shotType: 'Plano Detalle (Macro)',
                        },
                        [ContentType.Texto]: {}, [ContentType.Video]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {}
                    }
                },
                eventType: 'VisualCampaign'
            };
            onSaveTask(task, true);
        } catch (e) {
            console.error("Error al enviar al creador:", e);
            alert("No se pudo capturar la imagen para enviar.");
        }
    }, [element, onSaveTask, atomStyle, surfaceStyle]);
    
    const atomStyles = [
        { id: 'line', label: 'Line' },
        { id: 'stick', label: 'Stick' },
        { id: 'ballAndStick', label: 'Ball & Stick' },
        { id: 'sphere', label: 'Sphere (CPK)' }
    ];

    const surfaceStyles = [
        { id: 'none', label: 'Ninguna' },
        { id: 'dots', label: 'Puntos (Dots)' },
        { id: 'vdw', label: 'VDW Surface' },
        { id: 'sas', label: 'SAS Surface (Canales)' },
        { id: 'ms', label: 'MS Surface (Canales)' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 w-full h-[600px] relative bg-black rounded-lg" ref={containerRef}>
                {(isLoading || error) && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/70 p-4 text-center rounded-lg">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
                                <p>Cargando modelo 3D...</p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold text-red-400 mb-2">Advertencia</p>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <Accordion title="Estilo Atómico" defaultOpen>
                    <div className="space-y-2">
                        {atomStyles.map(style => (
                            <label key={style.id} className="flex items-center">
                                <input
                                    type="radio"
                                    name="atomStyle"
                                    value={style.id}
                                    checked={atomStyle === style.id}
                                    onChange={() => setAtomStyle(style.id as any)}
                                    className="mr-2"
                                />
                                {style.label}
                            </label>
                        ))}
                    </div>
                </Accordion>
                <Accordion title="Representación de Superficie" defaultOpen>
                    <div className="space-y-2">
                        {surfaceStyles.map(style => (
                            <label key={style.id} className="flex items-center">
                                <input
                                    type="radio"
                                    name="surfaceStyle"
                                    value={style.id}
                                    checked={surfaceStyle === style.id}
                                    onChange={() => setSurfaceStyle(style.id as any)}
                                    className="mr-2"
                                />
                                {style.label}
                            </label>
                        ))}
                    </div>
                </Accordion>
                <Accordion title="Ajustes Estéticos" defaultOpen>
                     <div>
                        <label className="block text-sm font-medium">Color de Fondo</label>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setBgColor('#111827')} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-500"></button>
                            <button onClick={() => setBgColor('#f3f4f6')} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-400"></button>
                            <button onClick={() => setBgColor('#000000')} className="w-8 h-8 rounded-full bg-black border-2 border-gray-500"></button>
                        </div>
                    </div>
                </Accordion>
                 <Accordion title="Utilidades y Sinergia" defaultOpen>
                    <div className="space-y-3">
                        <button onClick={handleExportImage} className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Exportar Imagen (PNG)</button>
                        <button onClick={handleSendToCreator} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Enviar a Creador de Prompts</button>
                    </div>
                </Accordion>
            </div>
        </div>
    );
};