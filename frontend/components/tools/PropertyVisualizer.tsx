

import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import path for types.
import type { View, Task, PyrolysisMaterial } from '../../types';
import { ContentType, EventType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';
import { PYROLYSIS_MATERIALS } from '../../data/pyrolysisMaterials';

interface Material extends PyrolysisMaterial {
    [key: string]: any; 
}

interface SchemaProperty {
    type: string;
    description: string;
    enum?: string[];
}

interface Schema {
    properties: Record<string, SchemaProperty>;
    filterable: Record<'Sólido' | 'Líquido' | 'Gaseoso', { label: string; value: string }[]>;
}

const UseMaterialModal: React.FC<{
    materialName: string;
    onClose: () => void;
    onSelectDestination: (destination: View) => void;
}> = ({ materialName, onClose, onSelectDestination }) => {
    const { t } = useTranslations();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl text-gray-800" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">{t('materialExplorer.useMaterialModal.title')}</h3>
                <p className="mb-4"><strong>{t('materialExplorer.table.name')}:</strong> {materialName}</p>
                <div className="flex gap-4">
                    <button onClick={() => onSelectDestination('comparative-lab')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">{t('materialExplorer.useMaterialModal.comparativeLab')}</button>
                    <button onClick={() => onSelectDestination('process-optimizer')} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">{t('materialExplorer.useMaterialModal.processOptimizer')}</button>
                </div>
                <div className="text-right mt-4">
                    <button onClick={onClose} className="text-sm text-gray-600">{t('materialExplorer.useMaterialModal.close')}</button>
                </div>
            </div>
        </div>
    );
};

const getNestedValue = (obj: any, path: string): any => {
    if (!path) return undefined;
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

export const PropertyVisualizer: React.FC<{
    setView: (view: View) => void;
    setInitialLabMaterialIds: (ids: number[] | null) => void;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}> = ({ setView, setInitialLabMaterialIds, setTasks }) => {
    const { t } = useTranslations();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [phase, setPhase] = useState('');
    const [prop1, setProp1] = useState('');
    const [min1, setMin1] = useState('');
    const [max1, setMax1] = useState('');
    const [prop2, setProp2] = useState('');
    const [min2, setMin2] = useState('');
    const [max2, setMax2] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalResults, setTotalResults] = useState(0);

    const [showUseMaterialModal, setShowUseMaterialModal] = useState<Material | null>(null);

    const schema: Schema = useMemo(() => ({
        properties: {
            fase: { type: 'string', description: 'Phase of the material', enum: ['Sólido', 'Líquido', 'Gaseoso'] }
        },
        filterable: {
            'Sólido': [
                { label: 'Humedad (%)', value: 'propiedades.analisisInmediato.humedad' },
                { label: 'Cenizas (%)', value: 'propiedades.analisisInmediato.cenizas' },
                { label: 'Poder Calorífico (MJ/kg)', value: 'propiedades.poderCalorificoSuperior' },
                { label: 'Celulosa (%)', value: 'propiedades.composicion.celulosa' },
                { label: 'Lignina (%)', value: 'propiedades.composicion.lignina' }
            ],
            'Líquido': [
                { label: 'pH', value: 'propiedades.propiedadesFisicas.ph' },
                { label: 'Viscosidad (cSt)', value: 'propiedades.propiedadesFisicas.viscosidad_cSt_a_50C' },
                { label: 'Densidad (kg/m³)', value: 'propiedades.propiedadesFisicas.densidad_kg_m3' },
                { label: 'Poder Calorífico (MJ/kg)', value: 'propiedades.poderCalorificoSuperior_MJ_kg' },
                { label: 'Contenido de Agua (%)', value: 'propiedades.contenidoAgua_porcentaje' }
            ],
            'Gaseoso': [
                { label: 'Poder Calorífico (MJ/Nm³)', value: 'propiedades.poderCalorificoInferior_MJ_Nm3' },
                { label: 'H₂ (%)', value: 'propiedades.composicion_vol_porcentaje.H2' },
                { label: 'CO (%)', value: 'propiedades.composicion_vol_porcentaje.CO' },
                { label: 'CH₄ (%)', value: 'propiedades.composicion_vol_porcentaje.CH4' },
                { label: 'Relación H₂/CO', value: 'propiedades.relacion_H2_CO' }
            ]
        }
    }), []);

    const filterAndPaginate = (page: number) => {
        setLoading(true);
        setError('');

        if (min1 && max1 && parseFloat(min1) > parseFloat(max1)) {
            setError(t('materialExplorer.minMaxError'));
            setLoading(false);
            return;
        }
        if (min2 && max2 && parseFloat(min2) > parseFloat(max2)) {
            setError(t('materialExplorer.minMaxError'));
            setLoading(false);
            return;
        }

        let filtered = [...PYROLYSIS_MATERIALS];

        if (phase) {
            filtered = filtered.filter(m => m.fase === phase);
        }

        if (prop1 && (min1 || max1)) {
            const min = min1 ? parseFloat(min1) : -Infinity;
            const max = max1 ? parseFloat(max1) : Infinity;
            filtered = filtered.filter(m => {
                const value = getNestedValue(m, prop1);
                return typeof value === 'number' && value >= min && value <= max;
            });
        }
        
        if (prop2 && (min2 || max2)) {
            const min = min2 ? parseFloat(min2) : -Infinity;
            const max = max2 ? parseFloat(max2) : Infinity;
            filtered = filtered.filter(m => {
                const value = getNestedValue(m, prop2);
                return typeof value === 'number' && value >= min && value <= max;
            });
        }
        
        setTotalResults(filtered.length);
        const startIndex = (page - 1) * pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pageSize);
        setMaterials(paginated as Material[]);
        setCurrentPage(page);
        setLoading(false);
    };

    useEffect(() => {
        filterAndPaginate(1);
    }, []);

    useEffect(() => {
      setProp1('');
      setProp2('');
      setMin1('');
      setMax1('');
      setMin2('');
      setMax2('');
    }, [phase]);

    const handleSearch = () => {
        filterAndPaginate(1);
    };

    const handleSendToEditorial = () => {
        const queryParams = { phase, prop1, min1, max1, prop2, min2, max2 };
        
        const prop1Info = schema.filterable[phase as keyof Schema['filterable']]?.find(p => p.value === prop1);
        const prop2Info = schema.filterable[phase as keyof Schema['filterable']]?.find(p => p.value === prop2);
        
        const prop1Label = prop1Info?.label || (prop1 ? prop1.split('.').pop() : 'Propiedad 1');
        const prop2Label = prop2Info?.label || (prop2 ? prop2.split('.').pop() : 'Propiedad 2');

        const resultsTable = materials.map(m => {
            const prop1Value = getNestedValue(m, prop1);
            const prop2Value = getNestedValue(m, prop2);
            return `| ${m.id} | ${m.nombre} | ${prop1Value !== undefined ? prop1Value : 'N/A'} | ${prop2Value !== undefined ? prop2Value : 'N/A'} |`;
        }).join('\n');

        const rawData = `
### Búsqueda Realizada
${Object.entries(queryParams).filter(([, val]) => val).map(([key, val]) => `- **${key}:** ${val}`).join('\n')}

### Resultados
| ID | Nombre | ${prop1Label} | ${prop2Label} |
|----|--------|---------|---------|
${resultsTable}
`;

        const newTask: Task = {
            id: `material-search-${Date.now()}`,
            title: `Informe de Búsqueda: ${phase || 'Todos'} - ${prop1Label}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Texto,
            formData: {
                specifics: {
                    [ContentType.Texto]: {
                        narrativeCatalyst: 'Informe de Comparativa de Materiales',
                        rawData,
                    },
                    [ContentType.Imagen]: {},
                    [ContentType.Video]: {},
                    [ContentType.Audio]: {},
                    [ContentType.Codigo]: {},
                }
            },
            isIntelligent: true,
            agentId: 'Helena, la Estratega',
            // FIX: 'EventType' only refers to a type, but is being used as a value here.
            eventType: 'MaterialSearchReport'
        };

        setTasks(prev => [...prev, newTask]);
        alert("Tarea creada con la búsqueda y resultados. Cárgala desde el Gestor de Tareas para usarla en el Creador de Prompts.");
        setView('tasks');
    };
    
    const handleUseMaterial = (material: Material) => {
        setShowUseMaterialModal(material);
    };

    const handleSelectDestination = (destination: View) => {
        if (showUseMaterialModal) {
            setInitialLabMaterialIds([showUseMaterialModal.id]);
            setView(destination);
            setShowUseMaterialModal(null);
        }
    };
    
    const phases = schema?.properties?.fase?.enum || [];
    const propertiesForPhase = (phase && schema) ? schema.filterable[phase as keyof Schema['filterable']] : [];

    const totalPages = Math.ceil(totalResults / pageSize);

    const getEnergyValue = (material: Material) => {
        const value = material.fase === 'Sólido' ? getNestedValue(material, 'propiedades.poderCalorificoSuperior')
                    : material.fase === 'Líquido' ? getNestedValue(material, 'propiedades.poderCalorificoSuperior_MJ_kg')
                    : material.fase === 'Gaseoso' ? getNestedValue(material, 'propiedades.poderCalorificoInferior_MJ_Nm3')
                    : 'N/A';
        const unit = material.fase === 'Gaseoso' ? 'MJ/Nm³' : 'MJ/kg';
        return value !== 'N/A' && value !== undefined ? `${value} ${unit}` : '—';
    };

    const getDensity = (material: Material) => {
        const value = getNestedValue(material, 'propiedades.propiedadesFisicas.densidad_kg_m3');
        return value !== undefined ? `${value} kg/m³` : '—';
    };


    return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-md">
             {showUseMaterialModal && (
                <UseMaterialModal
                    materialName={showUseMaterialModal.nombre}
                    onClose={() => setShowUseMaterialModal(null)}
                    onSelectDestination={handleSelectDestination}
                />
            )}
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('materialExplorer.title')}</h2>
                <p className="mt-2 text-md text-gray-600">{t('materialExplorer.subtitle')}</p>
            </header>

            <div className="bg-white p-6 rounded-lg border mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div><label className="text-sm font-medium">{t('materialExplorer.phase')}</label><select value={phase} onChange={e => setPhase(e.target.value)} className="w-full mt-1 p-2 border rounded"><option value="">Todas</option>{phases.map((p:string) => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.mainProperty')}</label><select value={prop1} onChange={e => setProp1(e.target.value)} className="w-full mt-1 p-2 border rounded" disabled={!phase}><option value="">{phase ? 'Selecciona una propiedad...' : t('materialExplorer.selectPhaseFirst')}</option>{propertiesForPhase.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.min')}</label><input type="number" value={min1} onChange={e => setMin1(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="min" /></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.max')}</label><input type="number" value={max1} onChange={e => setMax1(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="max" /></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.secondaryProperty')}</label><select value={prop2} onChange={e => setProp2(e.target.value)} className="w-full mt-1 p-2 border rounded" disabled={!phase}><option value="">Sin filtro adicional</option>{propertiesForPhase.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                    <div></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.min')} 2</label><input type="number" value={min2} onChange={e => setMin2(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="min" /></div>
                    <div><label className="text-sm font-medium">{t('materialExplorer.max')} 2</label><input type="number" value={max2} onChange={e => setMax2(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="max" /></div>
                </div>
                <div className="flex justify-between items-end mt-4">
                     <div><label className="text-sm font-medium">{t('materialExplorer.pageSize')}</label><input type="number" value={pageSize} onChange={e => setPageSize(Number(e.target.value))} min="1" max="200" className="w-24 mt-1 p-2 border rounded" /></div>
                    <button onClick={handleSearch} className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg">{t('materialExplorer.search')}</button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">{t('materialExplorer.pageInfo', {currentPage, totalPages: totalPages > 0 ? totalPages : 1, totalResults})}</p>
                <div className="flex gap-2">
                    <button onClick={() => filterAndPaginate(currentPage - 1)} disabled={currentPage <= 1 || loading} className="px-4 py-2 bg-white border rounded disabled:opacity-50">◀ {t('materialExplorer.previous')}</button>
                    <button onClick={() => filterAndPaginate(currentPage + 1)} disabled={currentPage >= totalPages || loading} className="px-4 py-2 bg-white border rounded disabled:opacity-50">{t('materialExplorer.next')} ▶</button>
                </div>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
            
            <div className="flex gap-4 mb-4">
                <button onClick={() => {}} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg">{t('materialExplorer.exportPage')}</button>
                <button onClick={handleSendToEditorial} className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg">{t('materialExplorer.sendToEditorial')}</button>
            </div>
            
            {loading ? <p className="text-center p-4">Cargando...</p> : materials.length === 0 && !error ? <p className="text-center p-4">{t('materialExplorer.noResults')}</p> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="p-3">{t('materialExplorer.table.id')}</th><th className="p-3">{t('materialExplorer.table.phase')}</th><th className="p-3">{t('materialExplorer.table.name')}</th>
                                {prop1 && <th className="p-3">{(schema.filterable[phase as keyof Schema['filterable']]?.find(p => p.value === prop1)?.label || prop1.split('.').pop())}</th>}
                                {prop2 && <th className="p-3">{(schema.filterable[phase as keyof Schema['filterable']]?.find(p => p.value === prop2)?.label || prop2.split('.').pop())}</th>}
                                <th className="p-3">{t('materialExplorer.table.energy')}</th><th className="p-3">{t('materialExplorer.table.density')}</th><th className="p-3">{t('materialExplorer.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map(m => (
                                <tr key={m.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono">{m.id}</td><td className="p-3">{m.fase}</td><td className="p-3 font-semibold">{m.nombre}</td>
                                    {prop1 && <td className="p-3 font-mono">{getNestedValue(m, prop1) ?? 'N/A'}</td>}
                                    {prop2 && <td className="p-3 font-mono">{getNestedValue(m, prop2) ?? 'N/A'}</td>}
                                    <td className="p-3 font-mono">{getEnergyValue(m)}</td><td className="p-3 font-mono">{getDensity(m)}</td>
                                    <td className="p-3"><button onClick={() => handleUseMaterial(m)} className="bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full text-xs">{t('materialExplorer.useMaterial')}</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
