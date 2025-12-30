import React from 'react';

interface PyrolysisHubPanelProps {
  onGenerateCreative: () => void;
  isTransferred: boolean;
}

export const PyrolysisHubPanel: React.FC<PyrolysisHubPanelProps> = ({ onGenerateCreative, isTransferred }) => {
  return (
    <div className={`h-full bg-slate-900 text-cyan-100 p-6 transition-all duration-1000 overflow-y-auto ${isTransferred ? 'w-[60%]' : 'w-full'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">📂 Proyecto: Valorización de Algas (Spirulina)</h1>
          <span className="text-sm text-cyan-600">Fase 3 | ✅ Completado</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">ID: SIM-998877</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Metrics */}
        <div className="col-span-4 space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-900/50">
            <div className="text-slate-400 text-sm mb-1">Eficiencia Energética</div>
            <div className="text-4xl font-mono text-green-400 flex items-center">
              78.4% <span className="text-lg ml-2">↑</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-900/50">
            <div className="text-slate-400 text-sm mb-1">Temp. Proceso</div>
            <div className="text-4xl font-mono text-orange-400">
              550°C
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-900/50">
            <div className="text-slate-400 text-sm mb-1">Materia Prima</div>
            <div className="text-xl text-white">Microalgas (Spirulina)</div>
          </div>
        </div>

        {/* Right Column: Sankey Diagram Placeholder */}
        <div className="col-span-8 bg-slate-800 rounded-xl border border-slate-700 p-6 relative overflow-hidden">
          <div className="absolute top-2 left-4 text-xs text-slate-500">DISTRIBUCIÓN DE RENDIMIENTO</div>
          
          {/* Simulated Sankey Flow */}
          <div className="flex h-full items-center justify-between mt-4">
            {/* Input */}
            <div className="w-24 h-32 bg-green-900/80 rounded flex items-center justify-center border border-green-700">
              Biomasa
            </div>
            
            {/* Flows */}
            <div className="flex-1 h-32 flex flex-col justify-center mx-2 space-y-2">
               <div className="h-2 bg-gradient-to-r from-green-900 to-amber-600 w-full rounded-full opacity-80"></div>
               <div className="h-12 bg-gradient-to-r from-green-900 to-amber-500 w-full rounded-full animate-pulse"></div>
               <div className="h-4 bg-gradient-to-r from-green-900 to-slate-900 w-full rounded-full opacity-60"></div>
            </div>

            {/* Outputs */}
            <div className="space-y-2">
               <div className="w-24 h-8 bg-blue-900/50 rounded flex items-center justify-center text-xs border border-blue-800">Syngas (20%)</div>
               <div className="w-24 h-16 bg-amber-600 rounded flex items-center justify-center text-sm font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400">
                 Bio-oil (55%)
               </div>
               <div className="w-24 h-10 bg-slate-950 rounded flex items-center justify-center text-xs border border-slate-700">Biochar (25%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-12 flex justify-center">
        {!isTransferred && (
            <button 
                onClick={onGenerateCreative}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    ⚡ Generar Espacio Creativo
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        )}
      </div>
    </div>
  );
};
