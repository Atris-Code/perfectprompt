import React, { useState, useEffect } from 'react';

// Icons
const BeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <path d="M4.5 3h15" />
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
    <path d="M6 14h12" />
  </svg>
);

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5-2 4.5-2 4.5" />
    <path d="M14.5 14.5a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5-2 4.5-2 4.5" />
    <path d="M12 22v-4" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

interface EnergyBalanceSimulatorProps {
  onNavigateWithContext: (context: any) => void;
  generatedPrompts: Record<string, string>;
}

export const EnergyBalanceSimulator: React.FC<EnergyBalanceSimulatorProps> = ({ onNavigateWithContext }) => {
  // --- ESTADO DEL REACTOR (INPUTS) ---
  const [feedstock, setFeedstock] = useState('algae');
  const [temperature, setTemperature] = useState(500); // Celsius
  const [moisture, setMoisture] = useState(10); // %

  // --- ESTADO DE RESULTADOS (OUTPUTS CALCULADOS) ---
  const [yields, setYields] = useState({ oil: 0, char: 0, gas: 0 });
  const [efficiency, setEfficiency] = useState(0);

  // --- MOTOR DE SIMULACIÓN (CEREBRO CIENTÍFICO SIMULADO) ---
  useEffect(() => {
    // Esta lógica simula la ciencia real de la pirólisis
    // A mayor temperatura -> Más Gas, Menos Char
    // A mayor humedad -> Menor eficiencia
    
    let baseOil = 50; 
    let baseChar = 30;
    let baseGas = 20;

    // Modificadores por Temperatura (300-800°C)
    const tempFactor = (temperature - 500) / 10; 
    
    let newGas = baseGas + tempFactor;
    let newChar = baseChar - (tempFactor * 0.5);
    let newOil = 100 - (newGas + newChar);

    // Penalización por Humedad
    const effic = 85 - (moisture * 1.5) - (Math.abs(temperature - 550) / 20);

    setYields({
      oil: Math.max(0, Number(newOil.toFixed(1))),
      char: Math.max(0, Number(newChar.toFixed(1))),
      gas: Math.max(0, Number(newGas.toFixed(1)))
    });
    setEfficiency(Number(effic.toFixed(1)));

  }, [feedstock, temperature, moisture]);

  // --- FUNCIÓN DEL NEXO (CONEXIÓN CON IA) ---
  const handleTransferToCreative = () => {
    const payload = {
      source: "Pyrolysis Hub",
      data: { feedstock, temperature, yields, efficiency },
      insight: efficiency > 75 ? "Alta Eficiencia - Tono Triunfal" : "Optimización Requerida - Tono Analítico"
    };
    console.log("Enviando Payload al Creador de Prompt:", payload);
    onNavigateWithContext(payload);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* HEADER */}
      <div className="col-span-12 mb-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BeakerIcon /> Simulador de Biorefinería (Pyrolysis Hub)
        </h1>
        <p className="text-slate-500">Ajusta los parámetros termoquímicos para modelar el rendimiento.</p>
      </div>

      {/* COLUMNA IZQUIERDA: CONTROLES */}
      <div className="col-span-12 md:col-span-5 bg-white shadow-lg rounded-lg p-6 border-t-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <FireIcon /> Parámetros de Operación
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Materia Prima</label>
            <select 
              value={feedstock} 
              onChange={(e) => setFeedstock(e.target.value)}
              className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="algae">Microalgas (Spirulina)</option>
              <option value="wood">Residuos Forestales (Pino)</option>
              <option value="plastic">Plásticos Mixtos (RDF)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Temperatura de Reacción: <span className="text-blue-600 font-bold">{temperature}°C</span>
            </label>
            <input 
              type="range" min="300" max="800" step="10" 
              value={temperature} 
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>300°C (Torrefacción)</span>
              <span>800°C (Gasificación)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Humedad de Entrada: <span className="text-blue-600 font-bold">{moisture}%</span>
            </label>
            <input 
              type="range" min="0" max="50" step="1" 
              value={moisture} 
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: RESULTADOS VISUALES */}
      <div className="col-span-12 md:col-span-7 shadow-lg bg-slate-900 text-white rounded-lg p-6 border-none">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-300">
           <LeafIcon /> Proyección de Rendimiento
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* KPI PRINCIPAL */}
          <div className="col-span-2 p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Eficiencia Energética Global</p>
              <p className={`text-4xl font-bold ${Number(efficiency) > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                {efficiency}%
              </p>
            </div>
            {Number(efficiency) > 75 && <span className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Óptimo</span>}
          </div>

          {/* BARRAS DE RENDIMIENTO */}
          <div className="col-span-2 space-y-3">
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

        {/* ACCIÓN PRINCIPAL */}
        <button 
          onClick={handleTransferToCreative}
          className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white font-bold shadow-lg flex items-center justify-center gap-3 rounded-lg transition-all transform hover:scale-[1.02]"
        >
          <RocketIcon /> Sincronizar con Espacio Creativo
        </button>
        <p className="text-xs text-center text-slate-500 mt-3">
          Esto enviará los parámetros técnicos al motor de IA para la generación de narrativa.
        </p>

      </div>
    </div>
  );
};

export default EnergyBalanceSimulator;
