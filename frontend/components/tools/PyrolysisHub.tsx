import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PYROLYSIS_MATERIALS, SIMULATION_ENGINE } from '../../data/pyrolysisMaterials';
import type { PyrolysisMaterial, SolidMaterial, LiquidMaterial, GaseousMaterial, KnowledgeBaseData, View, Task, FormData } from '../../types';
import { ContentType } from '../../types';
import ProductYieldChart from './ProductYieldChart';
import { Accordion } from '../form/Accordion';
import { generateMaterialVisual, estimateThermalConductivity, generateDensificationVisualPrompt, generateNexoResponse } from '../../services/geminiService';
import { FormTextarea, FormSelect, FormInput } from '../form/FormControls';
import MaterialComparison from './MaterialComparison';

interface PyrolysisHubProps {
    onSimulateMixture: (materialIds: number[]) => void;
    onEditImage: (imageData: string) => void;
    initialSearch?: string | null;
    onCreateContentFromMaterial: (objective: string, rawData: string) => void;
    setView: (view: View) => void;
    virtualMaterial: PyrolysisMaterial | null;
    onVirtualMaterialConsumed: () => void;
    onSaveTask: (task: Task, navigate?: boolean) => void;
}

const NFU_KNOWLEDGE_DATA: KnowledgeBaseData = {
    id: 'trujillo_2024_nfu',
    studyTitle: "Análisis del Ciclo de Vida de Llantas (Trujillo, 2024)",
    summary: "El estudio analiza un proceso de pirólisis para llantas en Bogotá. La Tabla 11 muestra un balance de masa para 1000 kg de llantas, resultando en 313 kg de coque (sólido), 166 kg de aceite (líquido) y 135 kg de gas a partir de 636 kg de caucho triturado.",
    sensitivity: "El reciclaje del acero (chatarra metálica) es el factor que más contribuye a la reducción de impactos como la acidificación y la ecotoxicidad. La eficiencia de la separación de metales es una variable clave.",
    regulations: [
        "**Decreto 442 de 2015**: Crea el Programa de aprovechamiento de llantas usadas en Bogotá.",
        "**Resolución 1326 de 2017**: Establece los sistemas de recolección y gestión ambiental de llantas usadas."
    ],
    massBalance: {
        title: "Balance de Masa (Ejemplo para 1000 kg de llantas)",
        unit: "kg",
        inputs: [
            { name: "Llantas Usadas", value: 1000 }
        ],
        outputs: [
            { name: "Chatarra (Acero)", value: 269 },
            { name: "Residuos Textiles", value: 95 },
            { name: "Aceite de Pirólisis", value: 166 },
            { name: "Coque de Pirólisis (Sólido)", value: 313 },
            { name: "Gas de Pirólisis", value: 135 }
        ],
        notes: "El proceso intermedio de trituración genera 636 kg de caucho, que es la entrada real al reactor de pirólisis."
    }
};

const EcohornetYields = () => (
    <div>
        <h6 className="font-semibold text-gray-800 mb-2">Rendimientos Típicos por Temperatura (Biomasa Genérica)</h6>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase">
                    <tr>
                        <th className="p-2 border border-gray-300">Rango de Temp.</th>
                        <th className="p-2 border border-gray-300">Bio-aceite</th>
                        <th className="p-2 border border-gray-300">Biochar</th>
                        <th className="p-2 border border-gray-300">Gas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-200"><td className="p-2 border border-gray-300">Baja (150-450°C)</td><td className="p-2 border border-gray-300 font-mono">50%</td><td className="p-2 border border-gray-300 font-mono">35%</td><td className="p-2 border border-gray-300 font-mono">15%</td></tr>
                    <tr className="border-b border-gray-200"><td className="p-2 border border-gray-300">Media (450-650°C)</td><td className="p-2 border border-gray-300 font-mono">30%</td><td className="p-2 border border-gray-300 font-mono">25%</td><td className="p-2 border border-gray-300 font-mono">45%</td></tr>
                    <tr className="border-b border-gray-200"><td className="p-2 border border-gray-300">Alta (650-900°C)</td><td className="p-2 border border-gray-300 font-mono">15%</td><td className="p-2 border border-gray-300 font-mono">15%</td><td className="p-2 border border-gray-300 font-mono">70%</td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

const emissionData = {
  pollutants: [
    { name: 'CO', unit: 'mg/Nm³', max: 500 },
    { name: 'Partículas', unit: 'mg/Nm³', max: 50 },
    { name: 'VOCs', unit: 'mg/Nm³', max: 50 },
  ],
  limits: [
    {
      source: 'ecoHORNET',
      color: '#4ade80', // green-400
      values: { CO: 250, Partículas: 7, VOCs: 10 },
    },
    {
      source: 'Directiva CE',
      color: '#fbbf24', // amber-400
      values: { CO: 500, Partículas: 50, VOCs: 50 },
    },
    {
      source: 'TA-Luft (Alemania)',
      color: '#f87171', // red-400
      values: { CO: 150, Partículas: 20, VOCs: 20 },
    },
  ],
};

const EmissionComparisonChart = () => {
  return (
    <div className="space-y-8">
      {emissionData.pollutants.map(pollutant => (
        <div key={pollutant.name}>
          <h5 className="text-sm font-bold text-gray-800 mb-3">{pollutant.name} ({pollutant.unit})</h5>
          <div className="space-y-3">
            {emissionData.limits.map(limit => {
              const value = limit.values[pollutant.name as keyof typeof limit.values];
              const percentage = Math.min((value / pollutant.max) * 100, 100);
              return (
                <div key={limit.source} className="grid grid-cols-4 items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 col-span-1">{limit.source}</span>
                  <div className="col-span-3 bg-gray-200 rounded-full h-5">
                    <div
                      className="h-5 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${percentage}%`, backgroundColor: limit.color }}
                    >
                      <span className="text-xs font-bold text-black">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
       <div className="mt-6 flex justify-center gap-4 text-xs">
        {emissionData.limits.map(limit => (
          <div key={limit.source} className="flex items-center">
            <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: limit.color }}></span>
            <span>{limit.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const ECOHORNET_KNOWLEDGE_DATA: KnowledgeBaseData = {
    id: 'ecohornet_2024',
    studyTitle: "Tecnología de Pirólisis ecoHORNET",
    summary: "ecoHORNET es una tecnología patentada de pirólisis que procesa pellets de biomasa a diferentes temperaturas para optimizar la producción de bio-aceite, biochar o syngas. Su reactor patentado es versátil y puede trabajar con materiales en fase sólida, líquida y gaseosa.",
    sensitivity: "La tecnología ecoHORNET es sensible a la temperatura del reactor. Temperaturas bajas maximizan el bio-aceite, mientras que temperaturas altas maximizan el syngas. La eficiencia de combustión del quemador (>1200°C) es clave para la autosostenibilidad del proceso.",
    customContent: (
      <div className="space-y-6">
        <EcohornetYields />
        <div className="pt-6 border-t border-gray-200">
            <h5 className="text-lg font-bold text-gray-800 mb-4">Límites de Emisión Legales y Comparativa</h5>
            <EmissionComparisonChart />
        </div>
      </div>
    )
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode; unit?: string }> = ({ label, value, unit }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="py-2.5 px-4 odd:bg-gray-50 even:bg-white rounded-md text-sm">
            <span className="font-semibold text-gray-600">{label}:</span>
            <span className="float-right text-gray-900 font-mono">{value}{unit && <span className="text-gray-500 ml-1">{unit}</span>}</span>
        </div>
    );
};

// Based on the user's provided document for dynamic queries
const PROPERTIES_BY_PHASE: Record<string, { label: string; value: string }[]> = {
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
};

// Helper to get nested property values safely
const getProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((o, key) => (o && typeof o[key] !== 'undefined' ? o[key] : undefined), obj);
};

const formatMaterialPropertiesForTxt = (material: PyrolysisMaterial): string => {
    let content = `PROPIEDADES DEL MATERIAL: ${material.nombre}\n`;
    content += `=========================================\n\n`;
    content += `ID: ${material.id}\n`;
    content += `Categoría: ${material.categoria}\n`;
    content += `Fase: ${material.fase}\n\n`;

    const traverseAndFormat = (obj: any, prefix = ''): string => {
        let text = '';
        for (const key in obj) {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                text += `\n--- ${prefix}${formattedKey} ---\n`;
                text += traverseAndFormat(obj[key], '');
            } else if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                const label = prefix + formattedKey;
                text += `${label.padEnd(40)}: ${obj[key]}\n`;
            }
        }
        return text;
    };

    if ('propiedades' in material) {
        content += traverseAndFormat(material.propiedades);
    }

    return content;
};

const formatMaterialPropertiesForCSV = (material: PyrolysisMaterial): string => {
    const rows: string[] = ['"Categoría","Propiedad","Valor","Unidad"'];

    const addRow = (category: string, property: string, value: any, unit: string) => {
        if (value !== undefined && value !== null && value !== '') {
            rows.push(`"${category}","${property}","${String(value).replace(/"/g, '""')}","${unit}"`);
        }
    };

    addRow('General', 'Nombre', material.nombre, '');
    addRow('General', 'Categoría', material.categoria, '');
    addRow('General', 'Fase', material.fase, '');

    const traverseAndAdd = (obj: any, category: string, prefix = '') => {
        for (const key in obj) {
            const formattedKey = prefix + key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                traverseAndAdd(obj[key], category, `${formattedKey} - `);
            } else {
                const [propName, unit] = formattedKey.split('(');
                addRow(category, propName.trim(), obj[key], unit ? unit.replace(')', '').trim() : '');
            }
        }
    };
    
    if (material.fase === 'Sólido') {
        const solid = material as SolidMaterial;
        traverseAndAdd(solid.propiedades.composicion, 'Composición Lignocelulósica');
        traverseAndAdd(solid.propiedades.analisisElemental, 'Análisis Elemental');
        traverseAndAdd(solid.propiedades.analisisInmediato, 'Análisis Inmediato');
        addRow('Propiedades Energéticas', 'Poder Calorífico Superior', solid.propiedades.poderCalorificoSuperior, 'MJ/kg');
    } else if (material.fase === 'Líquido') {
        const liquid = material as LiquidMaterial;
        traverseAndAdd(liquid.propiedades.propiedadesFisicas, 'Propiedades Físicas');
        traverseAndAdd(liquid.propiedades.analisisElemental, 'Análisis Elemental');
        addRow('Propiedades Generales', 'Contenido de Agua', liquid.propiedades.contenidoAgua_porcentaje, '%');
        addRow('Propiedades Generales', 'Poder Calorífico Superior', liquid.propiedades.poderCalorificoSuperior_MJ_kg, 'MJ/kg');
    } else if (material.fase === 'Gaseoso') {
        const gas = material as GaseousMaterial;
        traverseAndAdd(gas.propiedades.composicion_vol_porcentaje, 'Composición Volumétrica');
        addRow('Propiedades del Syngas', 'Poder Calorífico Inferior', gas.propiedades.poderCalorificoInferior_MJ_Nm3, 'MJ/Nm³');
        addRow('Propiedades del Syngas', 'Relación H₂/CO', gas.propiedades.relacion_H2_CO, '');
        traverseAndAdd(gas.propiedades.contaminantes, 'Contaminantes');
    }

    return rows.join('\n');
};

const KpiCard: React.FC<{ title: string; value: string; unit: string; justification: string; alert?: boolean }> = ({ title, value, unit, justification, alert }) => (
    <div className={`p-4 rounded-lg ${alert ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-200'} border transition-all`}>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        <p className={`text-3xl font-bold mt-1 ${alert ? 'text-red-700' : 'text-gray-800'}`}>
            {value} <span className="text-xl font-medium">{unit}</span>
        </p>
        <p className="text-xs text-gray-600 mt-2">{justification}</p>
    </div>
);

const ParameterSlider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; field: string; onParamChange: (field: string, value: number) => void; }> = ({ label, value, min, max, step, unit, field, onParamChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded-md">{value.toFixed(2)} {unit}</span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step} value={value}
            onChange={(e) => onParamChange(field, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
    </div>
);

const DensificationPlantSimulator: React.FC<{ selectedMaterial: PyrolysisMaterial | undefined }> = ({ selectedMaterial }) => {
    const [params, setParams] = useState({
        initialMoisture: 45,
        targetMoisture: 10,
        biomassCost: 60, // $/ton
        logisticCost: 25, // $/ton
        electricityCost: 0.12, // $/kWh
        heatCost: 0.04, // $/kWh
        fixedAndLaborCost: 15, // $/ton
    });
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isPromptLoading, setIsPromptLoading] = useState(false);
    const [promptError, setPromptError] = useState('');

    useEffect(() => {
        if (selectedMaterial && selectedMaterial.fase === 'Sólido') {
            const moisture = (selectedMaterial as SolidMaterial).propiedades.analisisInmediato.humedad;
            if(moisture) {
                setParams(p => ({ ...p, initialMoisture: moisture }));
            }
        }
    }, [selectedMaterial]);

    const handleParamChange = (field: keyof typeof params, value: number) => {
        setParams(p => ({ ...p, [field]: value }));
    };

    const calculations = useMemo(() => {
        const { initialMoisture, targetMoisture, electricityCost, heatCost, biomassCost, logisticCost, fixedAndLaborCost } = params;

        // Calculations per 1 ton of final pellet
        const dryMatterPerTonPellet = 1 * (1 - targetMoisture / 100);
        const initialBiomassNeeded = dryMatterPerTonPellet / (1 - initialMoisture / 100);
        const initialWater = initialBiomassNeeded * (initialMoisture / 100);
        const finalWater = 1 * (targetMoisture / 100);
        const waterToEvaporate = initialWater - finalWater;

        const THERMAL_ENERGY_FOR_DRYING_KWH_PER_TON = 750;
        const MILLING_ENERGY_KWH_PER_TON = 55;

        const dryingEnergy = waterToEvaporate * THERMAL_ENERGY_FOR_DRYING_KWH_PER_TON;
        const dryingCost = dryingEnergy * heatCost;
        const millingCost = MILLING_ENERGY_KWH_PER_TON * electricityCost;
        
        const energiaConsumida = dryingEnergy + MILLING_ENERGY_KWH_PER_TON;
        const costoOperativoPeletizado = dryingCost + millingCost + fixedAndLaborCost;
        const costoRecepcion = initialBiomassNeeded * (biomassCost + logisticCost);
        
        const isMoistureAlert = initialMoisture > 60;
        const isBiomassCostAlert = biomassCost > 60;

        return {
            energiaConsumida,
            costoOperativoPeletizado,
            costoRecepcion,
            isMoistureAlert,
            isBiomassCostAlert,
        };
    }, [params]);

    const handleGeneratePrompt = async () => {
        setIsPromptLoading(true);
        setPromptError('');
        setGeneratedPrompt('');
        try {
            const prompt = await generateDensificationVisualPrompt(params.initialMoisture);
            setGeneratedPrompt(prompt);
        } catch (err) {
            setPromptError(err instanceof Error ? err.message : 'Error al generar prompt');
        } finally {
            setIsPromptLoading(false);
        }
    };

    return (
         <Accordion title="Módulo de Producción de Pellet: 'La Planta de Densificación'" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- CONFIGURATION PANEL --- */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-bold text-lg mb-2">Parámetros de Simulación</h3>
                    <ParameterSlider label="Humedad Inicial Materia Prima" value={params.initialMoisture} min={10} max={80} step={1} unit="%" field="initialMoisture" onParamChange={handleParamChange}/>
                    <ParameterSlider label="Humedad Final Pellet (Objetivo)" value={params.targetMoisture} min={5} max={20} step={0.5} unit="%" field="targetMoisture" onParamChange={handleParamChange}/>
                    <hr />
                    <ParameterSlider label="Costo Biomasa" value={params.biomassCost} min={20} max={200} step={5} unit="US$/ton" field="biomassCost" onParamChange={handleParamChange}/>
                    <ParameterSlider label="Costo Logístico" value={params.logisticCost} min={5} max={100} step={5} unit="US$/ton" field="logisticCost" onParamChange={handleParamChange}/>
                    <ParameterSlider label="Costo Electricidad" value={params.electricityCost} min={0.05} max={0.5} step={0.01} unit="US$/kWh" field="electricityCost" onParamChange={handleParamChange}/>
                    <ParameterSlider label="Costo Calor" value={params.heatCost} min={0.01} max={0.2} step={0.005} unit="US$/kWh" field="heatCost" onParamChange={handleParamChange}/>
                    <ParameterSlider label="Costos Fijos y Mano de Obra" value={params.fixedAndLaborCost} min={5} max={50} step={1} unit="US$/ton" field="fixedAndLaborCost" onParamChange={handleParamChange}/>
                </div>
                {/* --- KPI DASHBOARD --- */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <KpiCard title="Costo Recepción y Almacén" value={calculations.costoRecepcion.toFixed(2)} unit="US$/ton" justification="Costo de materia prima y logística por tonelada de pellet final." alert={calculations.isBiomassCostAlert} />
                        <KpiCard title="Energía Consumida" value={calculations.energiaConsumida.toFixed(2)} unit="kWh/ton" justification="Energía total (térmica + eléctrica) por tonelada de pellet final." alert={calculations.isMoistureAlert}/>
                        <KpiCard title="Costo Operativo de Peletizado" value={calculations.costoOperativoPeletizado.toFixed(2)} unit="US$/ton" justification="Costo energético, fijos y mano de obra por tonelada de pellet final." alert={calculations.isMoistureAlert} />
                    </div>
                    {calculations.isMoistureAlert && (
                         <div role="alert" className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                             <p className="font-bold">Advertencia Analítica: Sobrecosto Operativo</p>
                             <p>La humedad inicial es superior al 60%, lo que dispara el consumo energético y los costos de producción.</p>
                         </div>
                    )}
                    {calculations.isBiomassCostAlert && (
                         <div role="alert" className="p-4 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                             <p className="font-bold">Advertencia Analítica: Costo Elevado de Biomasa</p>
                             <p>El costo de la biomasa supera los 60 US$/ton, impactando directamente el costo de recepción y la rentabilidad del proceso.</p>
                         </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-bold mb-2">Generador de Prompts (Agente Creativo)</h4>
                        <p className="text-xs text-gray-600 mb-3">Genera una metáfora visual para ilustrar la eficiencia (o ineficiencia) del proceso actual.</p>
                        <button onClick={handleGeneratePrompt} disabled={isPromptLoading} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                            {isPromptLoading ? 'Generando...' : '✨ Generar Prompt Visual'}
                        </button>
                        {promptError && <p className="text-xs text-red-500 mt-2">{promptError}</p>}
                        {generatedPrompt && (
                             <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500">Prompt Generado:</label>
                                <pre className="text-xs bg-gray-200 text-gray-700 p-3 rounded-md whitespace-pre-wrap font-mono mt-1">{generatedPrompt}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Accordion>
    );
};


export const PyrolysisHub: React.FC<PyrolysisHubProps> = ({ onSimulateMixture, onEditImage, initialSearch, onCreateContentFromMaterial, setView, virtualMaterial, onVirtualMaterialConsumed, onSaveTask }) => {
    const [materials, setMaterials] = useState<PyrolysisMaterial[]>(PYROLYSIS_MATERIALS);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(1);
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [categoriaFilter, setCategoriaFilter] = useState('Todas');
    const [faseFilter, setFaseFilter] = useState('Todas');
    const [visualRepresentationImage, setVisualRepresentationImage] = useState<string | null>(null);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const [visualizeError, setVisualizeError] = useState('');
    const [thermalConductivity, setThermalConductivity] = useState<{ conductivity: string; reasoning: string } | null>(null);
    const [isEstimatingConductivity, setIsEstimatingConductivity] = useState(false);
    const [conductivityError, setConductivityError] = useState('');
    const [knowledgeData, setKnowledgeData] = useState<KnowledgeBaseData[]>([]);
    const [aiCriteria, setAiCriteria] = useState('');
    const [selectionList, setSelectionList] = useState<number[]>([]);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

    // Phase 5: Data Fusion State
    const [isCreativeMode, setIsCreativeMode] = useState(false);
    const [creativeChatHistory, setCreativeChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [creativeInput, setCreativeInput] = useState('');
    const [isCreativeLoading, setIsCreativeLoading] = useState(false);

    // State for Intelligent Search
    const [advancedPhase, setAdvancedPhase] = useState('');
    const [dynamicFilters, setDynamicFilters] = useState<{ field: string; operator: string; value: string }[]>([]);
    const [sort, setSort] = useState<{ field: string; direction: 'ASC' | 'DESC' }>({ field: 'nombre', direction: 'ASC' });

    const handleCreativeSubmit = async () => {
        if (!creativeInput.trim() || !selectedMaterial) return;

        const userMessage = creativeInput;
        setCreativeChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setCreativeInput('');
        setIsCreativeLoading(true);

        try {
            // Construct Context Payload (Phase 4 Bridge)
            const contextPayload = {
                meta: {
                    version: "1.0",
                    timestamp: new Date().toISOString(),
                    origin_system: "PyrolysisHub_Frontend"
                },
                project_identity: {
                    project_name: `Análisis de ${selectedMaterial.nombre}`,
                    user_role: "Colaborador"
                },
                technical_core: {
                    material_data: selectedMaterial,
                    // If we had simulation results, we would add them here
                },
                semantic_bridge: {
                    primary_insight: `Material ${selectedMaterial.fase} de categoría ${selectedMaterial.categoria}.`,
                    visual_cues: {
                        dominant_color: selectedMaterial.fase === 'Sólido' ? 'Tierra/Marrón' : 'Fluido/Oscuro',
                        process_state: selectedMaterial.fase
                    }
                }
            };

            const response = await generateNexoResponse(contextPayload, userMessage);
            
            setCreativeChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setCreativeChatHistory(prev => [...prev, { role: 'assistant', content: "Error al conectar con Nexo Bridge." }]);
        } finally {
            setIsCreativeLoading(false);
        }
    };

    useEffect(() => {
        if (virtualMaterial) {
            setMaterials(prev => {
                // Avoid adding duplicates if the user navigates back and forth
                if (prev.some(m => m.id === virtualMaterial.id)) {
                    return prev;
                }
                return [virtualMaterial, ...prev];
            });
            setSelectedMaterialId(virtualMaterial.id);
            onVirtualMaterialConsumed();
        }
    }, [virtualMaterial, onVirtualMaterialConsumed]);


    useEffect(() => {
        if (initialSearch) {
            setSearchTerm(initialSearch);
        }
    }, [initialSearch]);


    const categorias = useMemo(() => ['Todas', ...Array.from(new Set(materials.map(m => m.categoria)))], [materials]);
    const fases = useMemo(() => ['Todas', ...Array.from(new Set(materials.map(m => m.fase)))], [materials]);

    const filteredMaterials = useMemo(() => {
        let currentMaterials = [...materials];

        // 1. Basic Filters
        if (searchTerm) {
            currentMaterials = currentMaterials.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (categoriaFilter !== 'Todas') {
            currentMaterials = currentMaterials.filter(m => m.categoria === categoriaFilter);
        }
        if (faseFilter !== 'Todas') {
            currentMaterials = currentMaterials.filter(m => m.fase === faseFilter);
        }
        if (advancedPhase) {
            currentMaterials = currentMaterials.filter(m => m.fase === advancedPhase);
        }
        
        // 2. Dynamic Property Filters
        const activeFilters = dynamicFilters.filter(f => f.field && f.value);
        if (activeFilters.length > 0) {
            currentMaterials = currentMaterials.filter(material => {
                return activeFilters.every(filter => {
                    const materialValue = getProperty(material, filter.field);
                    const filterValue = parseFloat(filter.value);
                    
                    if (typeof materialValue !== 'number' || isNaN(filterValue)) {
                        return false;
                    }

                    switch (filter.operator) {
                        case '>': return (materialValue as number) > filterValue;
                        case '<': return (materialValue as number) < filterValue;
                        case '=': return (materialValue as number) == filterValue;
                        default: return true;
                    }
                });
            });
        }
        
        // 3. Sorting
        currentMaterials.sort((a, b) => {
            const valA = getProperty(a, sort.field);
            const valB = getProperty(b, sort.field);

            if (valA === undefined || valB === undefined) return 0;

            const directionMultiplier = sort.direction === 'ASC' ? 1 : -1;

            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * directionMultiplier;
            }
            if (typeof valA === 'string' && typeof valB === 'string') {
                return valA.localeCompare(valB) * directionMultiplier;
            }
            return 0;
        });


        return currentMaterials;
    }, [searchTerm, categoriaFilter, faseFilter, advancedPhase, dynamicFilters, sort, materials]);

    const selectedMaterial = useMemo(() => {
        return materials.find(m => m.id === selectedMaterialId);
    }, [selectedMaterialId, materials]);

    const handleClearVisual = () => {
        setVisualRepresentationImage(null);
        setVisualizeError('');
        setIsVisualizing(false);
    };
    
    useEffect(() => {
        const data: KnowledgeBaseData[] = [];
        if (selectedMaterial) {
            if (selectedMaterial.id === 53) { // ID for "Neumáticos Fuera de Uso (NFU)"
                data.push(NFU_KNOWLEDGE_DATA);
            }
            // When Pine or Oak is selected, allow user to consult a knowledge base on 'Life Cycle Analysis'.
            if (selectedMaterial.id === 1 || selectedMaterial.id === 2) { // Pino or Roble
                const woodLcaData: KnowledgeBaseData = {
                    id: 'wood_lca',
                    studyTitle: "Análisis de Ciclo de Vida de Biomasa Forestal",
                    summary: "Estudio sobre la valorización de biomasa forestal mediante pirólisis. Se evalúan los impactos ambientales (huella de carbono, uso del suelo) y se comparan con el uso de combustibles fósiles, destacando el potencial de secuestro de carbono del biochar.",
                    sensitivity: "La humedad inicial de la madera y la eficiencia del proceso de secado son las variables más sensibles que afectan el balance energético neto del ciclo de vida.",
                    customContent: (
                        <p className="text-sm text-gray-700">
                            La integración de la pirólisis en la gestión forestal puede crear un ciclo de carbono negativo. El biochar producido secuestra carbono en el suelo durante siglos, mejorando al mismo tiempo su fertilidad.
                        </p>
                    )
                };
                 if (!data.some(d => d.id === woodLcaData.id)) {
                    data.push(woodLcaData);
                 }
            }
            if (SIMULATION_ENGINE.biomass_materials.includes(selectedMaterial.id) || selectedMaterial.id === 53) {
                 if (!data.some(d => d.id === ECOHORNET_KNOWLEDGE_DATA.id)) {
                    data.push(ECOHORNET_KNOWLEDGE_DATA);
                 }
            }
        }
        setKnowledgeData(data);
        handleClearVisual();
        setThermalConductivity(null);
        setConductivityError('');
        setIsEstimatingConductivity(false);
        setAiCriteria('');
    }, [selectedMaterial]);
    
    // --- Intelligent Search Handlers ---
    const handleAddFilter = () => {
        setDynamicFilters([...dynamicFilters, { field: '', operator: '=', value: '' }]);
    };
    const handleUpdateFilter = (index: number, part: 'field' | 'operator' | 'value', value: string) => {
        const newFilters = [...dynamicFilters];
        newFilters[index][part] = value;
        setDynamicFilters(newFilters);
    };
    const handleRemoveFilter = (index: number) => {
        setDynamicFilters(dynamicFilters.filter((_, i) => i !== index));
    };
    const handleResetAdvancedSearch = () => {
        setAdvancedPhase('');
        setDynamicFilters([]);
        setSort({ field: 'nombre', direction: 'ASC' });
    };

    const sortableProperties = useMemo(() => {
        const base = [{ label: 'Nombre', value: 'nombre' }, { label: 'Categoría', value: 'categoria' }];
        if (advancedPhase && PROPERTIES_BY_PHASE[advancedPhase]) {
            return [...base, ...PROPERTIES_BY_PHASE[advancedPhase]];
        }
        return base;
    }, [advancedPhase]);
    
    const handleAddToList = (materialId: number) => {
        if (!selectionList.includes(materialId)) {
            setSelectionList(prev => [...prev, materialId]);
        }
    };
    const handleRemoveFromSelection = (idToRemove: number) => {
        setSelectionList(prev => prev.filter(id => id !== idToRemove));
    };
    const handleClearSelection = () => {
        setSelectionList([]);
    };
    const handleSimulateMixture = () => {
        if (selectionList.length > 0) {
            onSimulateMixture(selectionList);
        }
    };

    const handleGenerateVisual = async () => {
        if (!selectedMaterial) return;
        setIsVisualizing(true);
        setVisualizeError('');
        setVisualRepresentationImage(null);
        try {
            const imageData = await generateMaterialVisual(selectedMaterial, aiCriteria);
            setVisualRepresentationImage(imageData);
        } catch (error) {
            setVisualizeError(error instanceof Error ? error.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsVisualizing(false);
        }
    };
    
    const handleDownloadVisual = () => {
        if (!visualRepresentationImage || !selectedMaterial) return;
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${visualRepresentationImage}`;
        link.download = `${selectedMaterial.nombre.replace(/[\s(),]/g, '_') || 'material'}_visual.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditInProfessionalEditor = () => {
        if (visualRepresentationImage) {
            onEditImage(visualRepresentationImage);
        }
    };

    const handleDownloadProperties = (format: 'txt' | 'csv') => {
        if (!selectedMaterial) return;
        
        let content: string;
        let fileExtension: string;
        let mimeType: string;

        if (format === 'csv') {
            content = formatMaterialPropertiesForCSV(selectedMaterial);
            fileExtension = 'csv';
            mimeType = 'text/csv;charset=utf-8;';
        } else {
            content = formatMaterialPropertiesForTxt(selectedMaterial);
            fileExtension = 'txt';
            mimeType = 'text/plain;charset=utf-8';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedMaterial.nombre.replace(/[\s(),]/g, '_')}_properties.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCreateVisualCampaign = () => {
        if (!selectedMaterial) return;

        const materialName = selectedMaterial.nombre;
        const materialCategory = selectedMaterial.categoria;

        const scene1_narration = `El viaje comienza con nuestra materia prima: ${materialName}. Vemos de cerca su textura, su origen en la categoría de ${materialCategory}, un recurso esperando ser transformado.`;
        const scene2_narration = `Ingresa al corazón del sistema: el reactor de pirólisis. En un ambiente sin oxígeno, el calor intenso descompone la materia, rompiendo sus cadenas moleculares.`;
        const scene3_narration = `De la transformación surgen tres productos valiosos: el bio-aceite energético, el biochar rico en carbono, y el syngas, cerrando el ciclo de la economía circular.`;
        const scene4_narration = `El resultado final: residuos convertidos en valor. Una solución sostenible para un futuro más limpio, demostrando el poder de la innovación.`;

        const newFormData: Partial<FormData> = {
            objective: `Crear una campaña visual cinematográfica sobre el proceso de pirólisis de ${materialName}.`,
            tone: 'Cinematográfico / Inspiracional',
            specifics: {
                [ContentType.Video]: {
                    videoCreationMode: 'text-to-video',
                    aspectRatio: '16:9',
                    visualStyle: 'Realismo Industrial / Macrofotografía',
                    soundDesign: 'Ambiente Industrial Eficiente',
                    musicGenre: 'Score Orquestal Minimalista',
                    audiovisualSequence: [
                        {
                            id: `scene-1-${Date.now()}`,
                            sceneTitle: 'La Materia Prima',
                            narration: scene1_narration,
                            duration: 8,
                            visualPromptPreset: 'Detalle Simbólico (Symbolic Detail)',
                            visualPromptFreeText: `Extreme close-up shots of ${materialName}, showcasing its unique texture. Slow-motion, macro photography. Clean, studio lighting.`,
                            soundDesign: 'Sonidos naturales suaves asociados al material, música minimalista inicia.'
                        },
                        {
                            id: `scene-2-${Date.now()}`,
                            sceneTitle: 'El Corazón del Reactor',
                            narration: scene2_narration,
                            duration: 12,
                            visualPromptPreset: 'Proceso en Acción (Process Shot)',
                            visualPromptFreeText: `A 3D infographic cross-section of a pyrolysis reactor. The material is fed inside. The interior glows with intense orange heat. Animated molecules break apart. Style of Kurzgesagt.`,
                            soundDesign: 'Low-frequency hum of the reactor builds. Rhythmic mechanical clicks. Music becomes more tense and orchestral.'
                        },
                        {
                            id: `scene-3-${Date.now()}`,
                            sceneTitle: 'Los Productos de Valor',
                            narration: scene3_narration,
                            duration: 12,
                            visualPromptPreset: 'Proceso en Acción (Process Shot)',
                            visualPromptFreeText: `A sequence of three clean, cinematic shots: 1. Dark, viscous bio-oil flowing into a glass container. 2. Porous, black biochar being discharged. 3. A clean, controlled flame representing the syngas being burned for energy.`,
                            soundDesign: 'Sounds of dripping liquid, solid material falling, and a clean gas flare. Music resolves into a hopeful, uplifting theme.'
                        },
                        {
                            id: `scene-4-${Date.now()}`,
                            sceneTitle: 'Cierre: Economía Circular',
                            narration: scene4_narration,
                            duration: 6,
                            visualPromptPreset: 'Escena Atmosférica (Atmospheric Scene)',
                            visualPromptFreeText: `A stylized shot of the three final products arranged artfully. Text overlay: 'Residuos a Valor'. Clean, bright, optimistic lighting.`,
                            soundDesign: 'Music reaches a crescendo and fades out with a final resonant chord.'
                        }
                    ]
                },
                [ContentType.Texto]: {}, [ContentType.Imagen]: {}, [ContentType.Audio]: {}, [ContentType.Codigo]: {}
            }
        };

        const newTask: Task = {
            id: `task-visual-campaign-${Date.now()}`,
            title: `Campaña Visual: Pirólisis de ${materialName}`,
            createdAt: Date.now(),
            status: 'Por Hacer',
            contentType: ContentType.Video,
            formData: newFormData,
            isIntelligent: true,
            agentId: 'Orquestador',
            eventType: 'VisualCampaign',
            subTasks: [
                { name: 'Análisis de Guion y Estilo', status: 'pending' },
                { name: 'Generación de Escenas Visuales', status: 'pending' },
                { name: 'Diseño de Sonido y Sincronización', status: 'pending' },
                { name: 'Renderizado y Compilación Final', status: 'pending' },
            ],
        };

        onSaveTask(newTask, true);
    };

    const handleEstimateConductivity = async () => {
        if (!selectedMaterial || selectedMaterial.fase !== 'Sólido') return;

        setIsEstimatingConductivity(true);
        setConductivityError('');
        setThermalConductivity(null);

        try {
            const result = await estimateThermalConductivity(selectedMaterial as SolidMaterial & { id: number, nombre: string, categoria: string });
            setThermalConductivity(result);
        } catch (error) {
            setConductivityError(error instanceof Error ? error.message : 'Error al estimar la conductividad.');
        } finally {
            setIsEstimatingConductivity(false);
        }
    };

    const CompositionBar: React.FC<{ label: string; value: number; color: string; maxValue: number }> = ({ label, value, color, maxValue }) => (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold text-gray-600">{label}</span>
                <span className="font-mono text-gray-900">{value.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full" style={{ width: `${Math.max(0, value / maxValue) * 100}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );

    const renderPhaseSpecificDetails = (material: PyrolysisMaterial) => {
        switch (material.fase) {
            case 'Sólido':
                const solid = material as SolidMaterial & { id: number, nombre: string, categoria: string };
                const comp = solid.propiedades.composicion;
                const elemental = solid.propiedades.analisisElemental;
                const inmediato = solid.propiedades.analisisInmediato;
                const propiedadesFisicas = (solid.propiedades as any).propiedadesFisicas;
                return (
                    <>
                        {(comp.celulosa || comp.hemicellulosa || comp.lignina) && (
                            <Accordion title="Composición Lignocelulósica" defaultOpen>
                                <div className="space-y-2">
                                    <DetailItem label="Celulosa" value={comp.celulosa} unit="%" />
                                    <DetailItem label="Hemicelulosa" value={comp.hemicellulosa} unit="%" />
                                    <DetailItem label="Lignina" value={comp.lignina} unit="%" />
                                </div>
                            </Accordion>
                        )}
                         {propiedadesFisicas && (
                            <Accordion title="Análisis de Propiedades Físicas" defaultOpen>
                                <div className="space-y-2">
                                <DetailItem label="Densidad aparente (kg/m³)" value={propiedadesFisicas.densidad_kg_m3} />
                                <div className="p-2">
                                    <div className="flex justify-between items-center text-sm py-2.5 px-2">
                                        <span className="font-semibold text-gray-600">Conductividad Térmica (W/m·K):</span>
                                        {isEstimatingConductivity ? (
                                            <span className="text-gray-500">Estimando...</span>
                                        ) : conductivityError ? (
                                            <span className="text-red-500 text-xs">{conductivityError}</span>
                                        ) : thermalConductivity ? (
                                             <span className="font-mono text-gray-900">{thermalConductivity.conductivity}</span>
                                        ) : propiedadesFisicas.conductividad_W_mK ? (
                                            <span className="font-mono text-gray-900">{propiedadesFisicas.conductividad_W_mK}</span>
                                        ) : (
                                            <button onClick={handleEstimateConductivity} className="text-xs font-semibold text-blue-600 hover:underline">✨ Estimar con IA</button>
                                        )}
                                    </div>
                                    {thermalConductivity && (
                                         <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded">
                                            <strong>Justificación IA:</strong> {thermalConductivity.reasoning}
                                        </div>
                                    )}
                                </div>
                                <DetailItem label="Poder Calorífico Inferior (MJ/kg)" value={propiedadesFisicas.poderCalorificoInferior_MJ_kg} />
                                </div>
                            </Accordion>
                        )}
                        <Accordion title="Análisis Elemental (Base Seca)" defaultOpen>
                           <div className="space-y-2">
                                <DetailItem label="Carbono" value={elemental.carbono} unit="%" />
                                <DetailItem label="Hidrógeno" value={elemental.hidrogeno} unit="%" />
                                <DetailItem label="Oxígeno" value={elemental.oxigeno} unit="%" />
                                <DetailItem label="Nitrógeno" value={elemental.nitrogeno} unit="%" />
                                <DetailItem label="Azufre" value={elemental.azufre} unit="%" />
                           </div>
                        </Accordion>
                        <Accordion title="Análisis Inmediato" defaultOpen>
                            <div className="space-y-2">
                                <DetailItem label="Humedad" value={inmediato.humedad} unit="%" />
                                <DetailItem label="Cenizas" value={inmediato.cenizas} unit="%" />
                                <DetailItem label="Materia Volátil" value={inmediato.materiaVolatil} unit="%" />
                                <DetailItem label="Carbono Fijo" value={inmediato.carbonoFijo} unit="%" />
                            </div>
                        </Accordion>
                         <Accordion title="Propiedades Energéticas" defaultOpen>
                             <div className="space-y-2">
                                <DetailItem label="Poder Calorífico Superior" value={solid.propiedades.poderCalorificoSuperior} unit="MJ/kg" />
                             </div>
                        </Accordion>
                        {knowledgeData.map(kd => (
                            <Accordion key={kd.id} title={`Base de Conocimiento: ${kd.studyTitle}`} defaultOpen>
                                <div className="space-y-4 text-sm">
                                    <p className="text-gray-700 italic">{kd.summary}</p>
                                    
                                    {kd.massBalance && (
                                        <div>
                                            <h6 className="font-semibold text-gray-800 mb-2">{kd.massBalance.title}</h6>
                                            <div className="bg-gray-50 p-4 rounded-lg border">
                                                {kd.massBalance.notes && <p className="text-xs text-gray-500 mb-2">{kd.massBalance.notes}</p>}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h6 className="font-semibold">Entradas</h6>
                                                        <ul className="list-disc list-inside">
                                                            {kd.massBalance.inputs.map(item => (
                                                                <li key={item.name}>{item.name}: <span className="font-mono">{item.value} {kd.massBalance?.unit}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-semibold">Salidas</h6>
                                                        <ul className="list-disc list-inside">
                                                            {kd.massBalance.outputs.map(item => (
                                                                <li key={item.name}>{item.name}: <span className="font-mono">{item.value} {kd.massBalance?.unit}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {kd.customContent && <div>{kd.customContent}</div>}

                                    {kd.sensitivity && (
                                        <div>
                                            <h6 className="font-semibold text-gray-800 mb-2">Análisis de Sensibilidad (Insight)</h6>
                                            <p className="text-gray-700">{kd.sensitivity}</p>
                                        </div>
                                    )}
                                    
                                    {kd.regulations && kd.regulations.length > 0 && (
                                        <div>
                                            <h6 className="font-semibold text-gray-800 mb-2">Regulaciones Aplicables</h6>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                {kd.regulations.map((reg, i) => <li key={i} dangerouslySetInnerHTML={{ __html: reg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Accordion>
                        ))}
                        {solid.propiedades.rendimientoProductos && (
                            <Accordion title="Rendimiento de Productos vs. Temperatura" defaultOpen>
                                <ProductYieldChart data={solid.propiedades.rendimientoProductos} title={`Rendimiento para ${solid.nombre}`} />
                            </Accordion>
                        )}
                    </>
                );
            case 'Líquido': {
                const liquid = material as LiquidMaterial;
                const fisicas = liquid.propiedades.propiedadesFisicas;
                const elementalLiquid = liquid.propiedades.analisisElemental;
                const generales = liquid.propiedades;
                
                const chemicalCompData = liquid.propiedades.composicionQuimica_porcentaje
                    ? Object.entries(liquid.propiedades.composicionQuimica_porcentaje)
                        .filter(([, value]) => value !== undefined && value > 0)
                        .map(([key, value]) => ({ label: key.replace(/_/g, ' '), value: value! }))
                    : [];
                const maxValueChemComp = chemicalCompData.length > 0 ? Math.max(...chemicalCompData.map(d => d.value)) : 0;
                const chemCompColors = ['#38bdf8', '#fb923c', '#a78bfa', '#facc15', '#fb7185', '#4ade80', '#9ca3af'];

                const hydroComp = liquid.propiedades.composicionHidrocarburos_porcentaje;
                const hydrocarbonData = (material.nombre.toLowerCase().includes('pirólisis') && hydroComp)
                    ? [
                        { label: 'Alifáticos', value: hydroComp.alifaticos, color: '#3b82f6' },
                        { label: 'Aromáticos', value: hydroComp.aromaticos, color: '#ec4899' },
                        { label: 'Otros', value: hydroComp.otros, color: '#8b5cf6' },
                        ...(hydroComp.estireno_monomero ? [{ label: 'Estireno Monómero', value: hydroComp.estireno_monomero, color: '#f97316' }] : []),
                        ...(hydroComp.tolueno ? [{ label: 'Tolueno', value: hydroComp.tolueno, color: '#eab308' }] : []),
                        ...(hydroComp.etilbenceno ? [{ label: 'Etilbenceno', value: hydroComp.etilbenceno, color: '#84cc16' }] : []),
                        ...(hydroComp.otros_aromaticos ? [{ label: 'Otros Aromáticos', value: hydroComp.otros_aromaticos, color: '#14b8a6' }] : []),
                    ].filter(item => item.value !== undefined && item.value > 0)
                    : [];
                const maxValueHydroComp = hydrocarbonData.length > 0 ? Math.max(...hydrocarbonData.map(d => d.value!)) : 0;

                return (
                    <>
                        <Accordion title="Propiedades Físicas" defaultOpen>
                             <div className="space-y-2">
                                <DetailItem label="Densidad" value={fisicas.densidad_kg_m3} unit="kg/m³" />
                                <DetailItem label="Viscosidad a 50°C" value={fisicas.viscosidad_cSt_a_50C} unit="cSt" />
                                <DetailItem label="pH" value={fisicas.ph} />
                             </div>
                        </Accordion>
                         <Accordion title="Análisis Elemental y Propiedades Generales" defaultOpen>
                           <div className="space-y-2">
                                <DetailItem label="Carbono" value={elementalLiquid.carbono} unit="%" />
                                <DetailItem label="Hidrógeno" value={elementalLiquid.hidrogeno} unit="%" />
                                <DetailItem label="Oxígeno" value={elementalLiquid.oxigeno} unit="%" />
                                <DetailItem label="Nitrógeno" value={elementalLiquid.nitrogeno} unit="%" />
                                <DetailItem label="Azufre" value={elementalLiquid.azufre} unit="%" />
                                {elementalLiquid.cloro_porcentaje !== undefined && <DetailItem label="Cloro" value={elementalLiquid.cloro_porcentaje} unit="%" />}
                                <hr className="border-gray-200"/>
                                <DetailItem label="Contenido de Agua" value={generales.contenidoAgua_porcentaje} unit="%" />
                                <DetailItem label="Poder Calorífico Superior" value={generales.poderCalorificoSuperior_MJ_kg} unit="MJ/kg" />
                           </div>
                        </Accordion>
                         {chemicalCompData.length > 0 && (
                            <Accordion title="Composición Química" defaultOpen>
                                <div className="space-y-4">
                                    {chemicalCompData.map((item, index) => (
                                        <CompositionBar 
                                            key={item.label}
                                            label={item.label.charAt(0).toUpperCase() + item.label.slice(1)} 
                                            value={item.value} 
                                            color={chemCompColors[index % chemCompColors.length]} 
                                            maxValue={maxValueChemComp} 
                                        />
                                    ))}
                                </div>
                            </Accordion>
                        )}
                        {hydrocarbonData.length > 0 && (
                             <Accordion title="Composición de Hidrocarburos" defaultOpen>
                                <div className="space-y-4">
                                    {hydrocarbonData.map((item) => (
                                        <CompositionBar 
                                            key={item.label}
                                            label={item.label} 
                                            value={item.value!} 
                                            color={item.color} 
                                            maxValue={maxValueHydroComp} 
                                        />
                                    ))}
                                </div>
                            </Accordion>
                        )}
                    </>
                );
            }
            case 'Gaseoso': {
                const gaseous = material as GaseousMaterial;
                const gasComp = gaseous.propiedades.composicion_vol_porcentaje;
                const gasComponents = [
                    { label: 'H₂', value: gasComp.H2, color: '#60a5fa' }, // blue-400
                    { label: 'CO', value: gasComp.CO, color: '#fb923c' }, // orange-400
                    { label: 'CO₂', value: gasComp.CO2, color: '#9ca3af' }, // gray-400
                    { label: 'CH₄', value: gasComp.CH4, color: '#f87171' }, // red-400
                    { label: 'C₂-C₄', value: gasComp.C2_C4, color: '#a78bfa' }, // violet-400
                    { label: 'N₂', value: gasComp.N2, color: '#a3a3a3' } // neutral-400
                ].filter(item => item.value > 0);
                
                const maxValue = Math.max(...gasComponents.map(item => item.value), 1);

                return (
                    <>
                        <Accordion title="Composición Volumétrica" defaultOpen>
                            <div className="space-y-4">
                                {gasComponents.map(gas => (
                                    <CompositionBar key={gas.label} {...gas} maxValue={maxValue} />
                                ))}
                            </div>
                        </Accordion>
                        <Accordion title="Propiedades del Syngas" defaultOpen>
                           <div className="space-y-2">
                                <DetailItem label="Poder Calorífico Inferior" value={gaseous.propiedades.poderCalorificoInferior_MJ_Nm3.toFixed(2)} unit="MJ/Nm³" />
                                <DetailItem label="Relación H₂/CO" value={gaseous.propiedades.relacion_H2_CO.toFixed(2)} unit="" />
                           </div>
                        </Accordion>
                        <Accordion title="Contaminantes" defaultOpen>
                            <div className="space-y-2">
                                <DetailItem label="Alquitrán" value={gaseous.propiedades.contaminantes.alquitran_g_Nm3} unit="g/Nm³" />
                                <DetailItem label="Azufre" value={gaseous.propiedades.contaminantes.azufre_ppm} unit="ppm" />
                                {gaseous.propiedades.contaminantes.HCI_ppm !== undefined && (
                                     <DetailItem label="HCI" value={gaseous.propiedades.contaminantes.HCI_ppm} unit="ppm" />
                                )}
                            </div>
                        </Accordion>
                    </>
                );
            }
        }
    };
    
    return (
        <div className="bg-gray-100 text-gray-900 p-8 rounded-2xl shadow-lg w-full mx-auto font-sans relative pb-40">
             {isComparisonModalOpen && (
                <MaterialComparison
                    materials={selectionList.map(id => materials.find(m => m.id === id)).filter((m): m is PyrolysisMaterial => !!m)}
                    onClose={() => setIsComparisonModalOpen(false)}
                />
            )}
            <header className="text-center mb-10">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Pyrolysis Hub: Explorador de Materiales</h2>
                 <div className="mt-6 flex justify-center gap-4">
                    <button 
                        onClick={() => setView('comparative-lab')}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                        Ir al Laboratorio de Escenarios Comparativos →
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-md">
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="search-name" className="text-sm font-medium text-gray-700 mb-1 block">Búsqueda por Nombre</label>
                            <input
                                id="search-name"
                                type="text"
                                placeholder="Ej: Pino, Cáscara de Arroz..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="filter-category" className="text-sm font-medium text-gray-700 mb-1 block">Filtro por Categoría</label>
                            <select id="filter-category" value={categoriaFilter} onChange={e => setCategoriaFilter(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter-fase" className="text-sm font-medium text-gray-700 mb-1 block">Filtro por Fase</label>
                            <select id="filter-fase" value={faseFilter} onChange={e => setFaseFilter(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                {fases.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <Accordion title="Buscador Inteligente de Propiedades" defaultOpen={true}>
                        <div className="grid grid-cols-1 gap-4">
                            <FormSelect label="Fase" id="advancedPhase" name="advancedPhase" value={advancedPhase} onChange={(e) => { setAdvancedPhase(e.target.value); setDynamicFilters([]); }}>
                                <option value="">Todas</option>
                                <option value="Sólido">Sólido</option>
                                <option value="Líquido">Líquido</option>
                                <option value="Gaseoso">Gaseoso</option>
                            </FormSelect>

                            {advancedPhase && (
                                <div className="space-y-3">
                                    {dynamicFilters.map((filter, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-md">
                                            <select value={filter.field} onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)} className="col-span-5 p-2 bg-white border border-gray-300 rounded-md text-xs">
                                                <option value="">Propiedad...</option>
                                                {PROPERTIES_BY_PHASE[advancedPhase]?.map(prop => <option key={prop.value} value={prop.value}>{prop.label}</option>)}
                                            </select>
                                            <select value={filter.operator} onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)} className="col-span-2 p-2 bg-white border border-gray-300 rounded-md text-sm">
                                                <option value=">">&gt;</option>
                                                <option value="<">&lt;</option>
                                                <option value="=">=</option>
                                            </select>
                                            <input type="number" value={filter.value} onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)} placeholder="Valor" className="col-span-4 p-2 bg-white border border-gray-300 rounded-md text-sm" />
                                            <button onClick={() => handleRemoveFilter(index)} className="col-span-1 text-red-500 hover:text-red-700">&times;</button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddFilter} className="text-sm font-semibold text-blue-600 hover:text-blue-800">+ Añadir Filtro</button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                                <FormSelect label="Ordenar por" id="sortField" name="sortField" value={sort.field} onChange={e => setSort({ ...sort, field: e.target.value })}>
                                    {sortableProperties.map(prop => <option key={prop.value} value={prop.value}>{prop.label}</option>)}
                                </FormSelect>
                                <FormSelect label="Dirección" id="sortDirection" name="sortDirection" value={sort.direction} onChange={e => setSort({ ...sort, direction: e.target.value as 'ASC' | 'DESC' })}>
                                    <option value="ASC">Ascendente</option>
                                    <option value="DESC">Descendente</option>
                                </FormSelect>
                            </div>
                            <button onClick={handleResetAdvancedSearch} className="text-xs font-semibold text-gray-600 hover:text-red-600 w-full text-right mt-2">Restablecer Búsqueda</button>
                        </div>
                    </Accordion>

                    <div className="mt-6">
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Materiales ({filteredMaterials.length})</label>
                        <div className="h-96 overflow-y-auto pr-2 border-t border-gray-200 pt-2">
                            <ul className="space-y-1">
                                {filteredMaterials.map(material => (
                                    <li key={material.id} className={`flex items-center justify-between p-1 rounded-md transition-colors ${selectedMaterialId === material.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                                        <button
                                            onClick={() => setSelectedMaterialId(material.id)}
                                            className="flex-grow text-left p-2"
                                            aria-label={`Ver detalles de ${material.nombre}`}
                                        >
                                            <p className={`font-semibold truncate ${selectedMaterialId === material.id ? 'text-white' : 'text-gray-800'}`}>{material.nombre}</p>
                                            <span className={`text-xs ${selectedMaterialId === material.id ? 'text-blue-200' : 'text-gray-500'}`}>{material.categoria}</span>
                                        </button>
                                        <button
                                            onClick={() => handleAddToList(material.id)}
                                            disabled={selectionList.includes(material.id)}
                                            className={`p-2 rounded-full transition-colors flex-shrink-0 mr-1 ${selectedMaterialId === material.id ? 'hover:bg-blue-700' : 'hover:bg-gray-200'} disabled:opacity-30 disabled:cursor-not-allowed`}
                                            title={selectionList.includes(material.id) ? "Ya en la selección" : "Añadir a la selección"}
                                            aria-label={`Añadir ${material.nombre} a la selección`}
                                        >
                                            {selectionList.includes(material.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-md">
                    {/* --- PHASE 5: DATA FUSION TOGGLE --- */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsCreativeMode(!isCreativeMode)}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                isCreativeMode 
                                ? 'bg-purple-600 text-white shadow-lg scale-105' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {isCreativeMode ? '✨ Modo Creativo Activo' : '👁️ Activar Espacio Creativo'}
                        </button>
                    </div>

                    {isCreativeMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                            {/* LEFT PANEL: DATA CONTEXT */}
                            <div className="overflow-y-auto border-r pr-4">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">Contexto Científico</h4>
                                {selectedMaterial ? (
                                    <div className="space-y-4 text-sm">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="font-semibold">Material Base:</p>
                                            <p>{selectedMaterial.nombre} ({selectedMaterial.fase})</p>
                                        </div>
                                        <DensificationPlantSimulator selectedMaterial={selectedMaterial} />
                                        {renderPhaseSpecificDetails(selectedMaterial)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Selecciona un material para ver su contexto.</p>
                                )}
                            </div>

                            {/* RIGHT PANEL: CREATIVE CHAT */}
                            <div className="flex flex-col h-full">
                                <h4 className="text-lg font-bold text-purple-800 mb-4">Nexo Creative Bridge</h4>
                                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-3 border border-gray-200">
                                    {creativeChatHistory.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm mt-10">
                                            El puente está listo. Envía una solicitud para transformar los datos en narrativa o visuales.
                                        </p>
                                    )}
                                    {creativeChatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                                msg.role === 'user' 
                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isCreativeLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none animate-pulse text-xs text-gray-500">
                                                Nexo está analizando el contexto...
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={creativeInput}
                                        onChange={(e) => setCreativeInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreativeSubmit()}
                                        placeholder="Ej: 'Crea una metáfora visual sobre la eficiencia...'"
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm"
                                    />
                                    <button
                                        onClick={handleCreativeSubmit}
                                        disabled={isCreativeLoading || !creativeInput.trim()}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                    selectedMaterial ? (
                        <div className="space-y-6">
                             <DensificationPlantSimulator selectedMaterial={selectedMaterial} />
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{selectedMaterial.nombre}</h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     <div className="flex items-center gap-1 bg-gray-100 rounded-md">
                                        <button
                                            onClick={() => handleDownloadProperties('txt')}
                                            title="Descargar todas las propiedades como archivo .txt"
                                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 px-3 py-2 rounded-l-md transition-colors"
                                        >
                                            .txt
                                        </button>
                                        <div className="w-px h-4 bg-gray-300"></div>
                                        <button
                                            onClick={() => handleDownloadProperties('csv')}
                                            title="Descargar todas las propiedades como archivo .csv"
                                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 px-3 py-2 rounded-r-md transition-colors"
                                        >
                                            .csv
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleCreateVisualCampaign}
                                        title="Generar una tarea de campaña visual cinematográfica"
                                        className="text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Crear Campaña Visual
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-800">{selectedMaterial.categoria}</span>
                                <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${selectedMaterial.fase === 'Sólido' ? 'bg-orange-100 text-orange-800' : selectedMaterial.fase === 'Líquido' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'}`}>{selectedMaterial.fase}</span>
                            </div>
                            
                            {renderPhaseSpecificDetails(selectedMaterial)}
                            
                            <Accordion title="Criterios de IA para Generación Visual (Opcional)" defaultOpen>
                                <FormTextarea
                                    label="Instrucciones Adicionales para la IA"
                                    id="aiCriteria"
                                    name="aiCriteria"
                                    rows={4}
                                    placeholder="Ej: Estilo de arte cinemático, evocando una sensación de innovación y poder. Nivel de detalle fotorrealista. Iluminación dramática."
                                    value={aiCriteria}
                                    onChange={(e) => setAiCriteria(e.target.value)}
                                />
                            </Accordion>

                            <Accordion title="Representación Visual" defaultOpen={true}>
                                <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
                                    {isVisualizing ? (
                                        <div className="text-center">
                                            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <p className="mt-4 text-sm text-gray-500">ecoSolution está generando...</p>
                                        </div>
                                    ) : visualizeError ? (
                                        <div className="text-center text-red-600">
                                            <p>Error: {visualizeError}</p>
                                            <button onClick={handleGenerateVisual} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                                                Intentar de Nuevo
                                            </button>
                                        </div>
                                    ) : visualRepresentationImage ? (
                                        <div className="w-full text-center">
                                            <img src={`data:image/jpeg;base64,${visualRepresentationImage}`} alt={`Representación visual de ${selectedMaterial.nombre}`} className="rounded-lg shadow-lg mb-4 w-full" />
                                            <div className="flex flex-wrap justify-center gap-4">
                                                <button onClick={handleGenerateVisual} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Generar de Nuevo</button>
                                                <button onClick={handleEditInProfessionalEditor} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Editar en PEP</button>
                                                <button onClick={handleDownloadVisual} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Descargar</button>
                                                <button onClick={handleClearVisual} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Limpiar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-500 text-center">Generar una representación visual para {selectedMaterial.nombre}.</p>
                                            <button onClick={handleGenerateVisual} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                                🖼️ Generar Imagen con IA
                                            </button>
                                        </>
                                    )}
                                </div>
                            </Accordion>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Selecciona un material de la lista para ver sus detalles.</p>
                        </div>
                    )
                    )}
                </div>
            </div>
            <div className="fixed bottom-0 left-64 right-0 bg-gray-800 text-white p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1),0_-4px_6px_-2px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold">Panel de Selección ({selectionList.length})</h3>
                        <div className="flex items-center gap-4">
                            <button onClick={handleClearSelection} disabled={selectionList.length === 0} className="text-sm font-semibold text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">Limpiar</button>
                            <button onClick={() => setIsComparisonModalOpen(true)} disabled={selectionList.length < 2} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                                Comparar Materiales
                            </button>
                            <button onClick={handleSimulateMixture} disabled={selectionList.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Simular Mezcla
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 min-h-[40px] items-center">
                        {selectionList.length > 0 ? (
                            selectionList.map(id => {
                                const material = materials.find(m => m.id === id);
                                if (!material) return null;
                                return (
                                    <div key={id} className="bg-gray-700 p-2 rounded-md flex items-center gap-2 flex-shrink-0">
                                        <span className="text-sm">{material.nombre}</span>
                                        <button onClick={() => handleRemoveFromSelection(id)} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1 rounded-full hover:bg-gray-600">&times;</button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-400 italic">Añade materiales para empezar a comparar o simular.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}