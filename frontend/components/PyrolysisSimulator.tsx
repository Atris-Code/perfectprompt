import React, { useState, useEffect } from 'react';
import { Card, Button, Slider, Select, Badge, InputNumber, Progress, Alert } from 'antd';
import { Rocket, Flame, Leaf, Beaker, Settings, Database, AlertTriangle } from 'lucide-react';

interface PyrolysisSimulatorProps {
  onNavigateWithContext: (payload: any) => void;
}

interface Material {
  id: string;
  name: string;
  type: string;
  properties: any;
}

interface MixtureItem {
  id: string;
  name: string;
  percent: number;
}

const PyrolysisSimulator: React.FC<PyrolysisSimulatorProps> = ({ onNavigateWithContext }) => {
  // --- ESTADO 1: MEZCLA DE MATERIALES (FEEDSTOCK) ---
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [mixture, setMixture] = useState<MixtureItem[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // --- ESTADO 2: PARÁMETROS DE REACTOR (INGENIERÍA) ---
  const [reactorType, setReactorType] = useState('FIXED_BED');
  const [pyrolysisMode, setPyrolysisMode] = useState('FAST');
  const [atmosphere, setAtmosphere] = useState('NITROGEN');
  const [residenceTime, setResidenceTime] = useState(2.5); // Segundos
  const [temperature, setTemperature] = useState(500); // Celsius

  // --- ESTADO DE RESULTADOS (OUTPUTS CALCULADOS) ---
  const [yields, setYields] = useState({ oil: 0, char: 0, gas: 0 });
  const [efficiency, setEfficiency] = useState(0);
  const [analysis, setAnalysis] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Cargar materiales al inicio
  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';
    fetch(`${BASE_URL}/api/materials`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setMaterialsList(data);
            // Set default mixture if empty
            if (data.length > 0 && mixture.length === 0) {
                setMixture([{ id: data[0].id, name: data[0].name, percent: 100 }]);
            }
        } else {
            console.error("Expected array of materials, got:", data);
            setMaterialsList([]);
        }
      })
      .catch(err => console.error("Error loading materials:", err));
  }, []);

  // Cálculo del Total de la Mezcla en tiempo real
  const totalMix = mixture.reduce((acc, item) => acc + item.percent, 0);
  const isMixValid = Math.abs(totalMix - 100) < 0.1;

  // --- FUNCIÓN PARA AGREGAR MATERIAL A LA MEZCLA ---
  const addMaterialToMix = () => {
    if (!selectedMaterialId) return;
    if (mixture.find(m => m.id === selectedMaterialId)) return; // Ya existe

    const material = materialsList.find(m => m.id === selectedMaterialId);
    if (!material) return;

    // Lógica inteligente: Reducir proporcionalmente los otros para hacer espacio (simple: añadir con 0% y dejar que usuario ajuste, o ajustar el último)
    // Aquí simplemente añadimos con 0% para que el usuario ajuste
    setMixture([...mixture, { id: material.id, name: material.name, percent: 0 }]);
    setSelectedMaterialId(null);
  };

  const updatePercent = (idx: number, val: number | null) => {
      if (val === null) return;
      const newMixture = [...mixture];
      newMixture[idx].percent = val;
      setMixture(newMixture);
  };

  const removeMaterial = (idx: number) => {
      const newMixture = [...mixture];
      newMixture.splice(idx, 1);
      setMixture(newMixture);
  };

  // --- MOTOR DE SIMULACIÓN (BACKEND) ---
  const runSimulation = () => {
      if (!isMixValid) return;

      const payload = {
          mixture: mixture.map(m => ({ id: m.id, percent: m.percent })),
          reactorType,
          pyrolysisMode,
          atmosphere,
          residenceTime
      };

      const BASE_URL = import.meta.env.VITE_NEXO_BACKEND_URL || 'http://localhost:8000';
      fetch(`${BASE_URL}/api/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
          setYields(data.yields);
          setEfficiency(data.efficiency);
          setAnalysis(data.analysis);
          setWarnings(data.warnings || []);
          
          // Si el backend ajustó el modo (ej: FAST -> SLOW), deberíamos reflejarlo?
          // Por ahora solo mostramos warnings.
      })
      .catch(err => console.error("Error running simulation:", err));
  };

  // Ejecutar simulación cuando cambian parámetros válidos
  useEffect(() => {
      if (isMixValid && mixture.length > 0) {
          runSimulation();
      }
  }, [mixture, reactorType, pyrolysisMode, atmosphere, residenceTime]);


  // --- FUNCIÓN DEL NEXO (CONEXIÓN CON IA) ---
  const handleTransferToCreative = () => {
    const payload = {
      source: "Pyrolysis Hub (Advanced)",
      data: { mixture, reactorType, pyrolysisMode, yields, efficiency },
      insight: analysis
    };
    console.log("Enviando Payload al Creador de Prompt:", payload);
    onNavigateWithContext(payload);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* HEADER */}
      <div className="col-span-12 mb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Beaker className="text-blue-600" /> Simulador de Biorefinería Avanzado
        </h1>
        <p className="text-slate-500">Ingeniería de Procesos: Configura la mezcla y el reactor.</p>
      </div>

      {/* COLUMNA IZQUIERDA: CONTROLES */}
      <div className="col-span-12 md:col-span-7 space-y-6">
        
        {/* 1. MEZCLADOR DE PRECISIÓN */}
        <Card title={<><Database className="inline mr-2" size={18}/> Mezcla de Alimentación (Feedstock)</>} className="shadow-md border-t-4 border-blue-500">
            <div className="space-y-4">
                {mixture.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-100 p-2 rounded">
                        <span className="flex-1 font-medium text-slate-700">{item.name}</span>
                        <Slider 
                            className="w-1/2"
                            value={item.percent}
                            max={100}
                            onChange={(val) => updatePercent(idx, val)}
                        />
                        <span className="font-mono font-bold text-blue-700 w-12 text-right">{item.percent}%</span>
                        <Button danger size="small" shape="circle" onClick={() => removeMaterial(idx)}>x</Button>
                    </div>
                ))}

                {/* BARRA DE VALIDACIÓN DEL 100% */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span>Total Mezcla en Reactor</span>
                        <span className={isMixValid ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{totalMix.toFixed(1)}%</span>
                    </div>
                    <Progress percent={totalMix} status={isMixValid ? "success" : "exception"} showInfo={false} />
                    {!isMixValid && <p className="text-red-500 text-xs mt-1">La mezcla debe sumar exactamente 100%.</p>}
                </div>

                <div className="flex gap-2 mt-4">
                    <Select 
                        className="flex-1" 
                        placeholder="Seleccionar material..."
                        value={selectedMaterialId}
                        onChange={setSelectedMaterialId}
                    >
                        {materialsList.map(m => (
                            <Select.Option key={m.id} value={m.id}>{m.name} ({m.type})</Select.Option>
                        ))}
                    </Select>
                    <Button type="dashed" icon={<Database size={14}/>} onClick={addMaterialToMix}>
                        + Añadir
                    </Button>
                </div>
            </div>
        </Card>

        {/* 2. PARÁMETROS OPERATIVOS AVANZADOS */}
        <Card title={<><Settings className="inline mr-2" size={18}/> Condiciones de Operación</>} className="shadow-md">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">TIPO DE PIROLISIS</label>
                    <Select className="w-full" value={pyrolysisMode} onChange={setPyrolysisMode}>
                        <Select.Option value="SLOW">Lenta (Carbonización)</Select.Option>
                        <Select.Option value="FAST">Rápida (Bio-oil)</Select.Option>
                        <Select.Option value="FLASH">Flash (Alto Rendimiento)</Select.Option>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">TIPO DE REACTOR</label>
                    <Select className="w-full" value={reactorType} onChange={setReactorType}>
                        <Select.Option value="FIXED_BED">Lecho Fijo</Select.Option>
                        <Select.Option value="FLUIDIZED">Lecho Fluidizado</Select.Option>
                        <Select.Option value="ROTARY">Horno Rotatorio</Select.Option>
                        <Select.Option value="AUGER">Tornillo Sin Fin (Auger)</Select.Option>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">ATMÓSFERA</label>
                    <Select className="w-full" value={atmosphere} onChange={setAtmosphere}>
                        <Select.Option value="NITROGEN">Inerte (N2)</Select.Option>
                        <Select.Option value="VACUUM">Vacío</Select.Option>
                        <Select.Option value="STEAM">Vapor (Activación)</Select.Option>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">TIEMPO DE RESIDENCIA (s)</label>
                    <InputNumber 
                        className="w-full" 
                        min={0.1} max={3600} step={0.1} 
                        value={residenceTime} 
                        addonAfter="seg"
                        onChange={(val) => setResidenceTime(val || 0)}
                    />
                </div>
            </div>
        </Card>
      </div>

      {/* COLUMNA DERECHA: RESULTADOS VISUALES */}
      <div className="col-span-12 md:col-span-5">
        <Card className="bg-slate-900 text-white h-full border-l-4 border-green-500 shadow-xl">
            <h3 className="text-xl mb-4 text-green-400 flex items-center gap-2">
                <Leaf size={20}/> Predicción Profesional
            </h3>
            
            <p className="text-slate-400 text-sm mb-6">
                Basado en {mixture?.length || 0} materiales y reactor {reactorType}.
            </p>

            {/* WARNINGS */}
            {warnings?.length > 0 && (
                <div className="mb-6 bg-yellow-900/30 border border-yellow-600 p-3 rounded text-yellow-200 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1"><AlertTriangle size={14}/> Alertas del Sistema:</div>
                    <ul className="list-disc pl-4">
                        {warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* KPI PRINCIPAL */}
                <div className="col-span-2 p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-sm">Eficiencia Global</p>
                        <p className={`text-4xl font-bold ${Number(efficiency) > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {efficiency}%
                        </p>
                    </div>
                    {Number(efficiency) > 75 && <Badge count="Óptimo" style={{ backgroundColor: '#52c41a' }} />}
                </div>

                {/* BARRAS DE RENDIMIENTO */}
                <div className="col-span-2 space-y-4">
                    {/* Bio-oil */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-amber-400">Bio-oil (Líquido)</span>
                            <span>{yields.oil}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${yields.oil}%` }}></div>
                        </div>
                    </div>

                    {/* Biochar */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Biochar (Sólido)</span>
                            <span>{yields.char}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-gray-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${yields.char}%` }}></div>
                        </div>
                    </div>

                    {/* Syngas */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-cyan-400">Syngas (Gas)</span>
                            <span>{yields.gas}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${yields.gas}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-3 rounded text-xs text-slate-300 mb-6 italic">
                "{analysis}"
            </div>

            {/* ACCIÓN PRINCIPAL */}
            <Button 
                type="primary"
                size="large"
                onClick={handleTransferToCreative}
                disabled={!isMixValid}
                className="w-full py-6 text-lg font-bold shadow-lg flex items-center justify-center gap-3"
                icon={<Rocket size={24} />}
                style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', border: 'none', height: 'auto' }}
            >
               Sincronizar con Espacio Creativo
            </Button>
        </Card>
      </div>

    </div>
  );
};

export default PyrolysisSimulator;
