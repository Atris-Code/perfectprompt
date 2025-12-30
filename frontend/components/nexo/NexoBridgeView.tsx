import React, { useState } from 'react';
import { PyrolysisHubPanel } from './PyrolysisHubPanel';
import { CreativeCanvasPanel } from './CreativeCanvasPanel';

// Define the context data here to pass to both panels
const BRIDGE_CONTEXT = {
  "meta": {
    "version": "1.0",
    "timestamp": new Date().toISOString(),
    "source": "PyrolysisHub"
  },
  "technical_core": {
    "efficiency": 78.4,
    "temperature": 550,
    "feedstock": "Microalgas (Spirulina)",
    "products": {
      "bio_oil": 55,
      "biochar": 25,
      "syngas": 20
    }
  },
  "semantic_bridge": {
    "primary_insight": "Rendimiento de Bio-oil excepcionalmente alto optimizado para biocombustibles.",
    "suggested_keywords": ["Biocombustible", "Sostenibilidad", "Innovación", "Energía Verde"],
    "visual_cues": {
      "color_palette": "Amber & Deep Green",
      "texture": "Viscous Fluid",
      "atmosphere": "High-Tech Organic",
      "elements": ["Burbujeo energético", "Fluido dorado"]
    }
  },
  "project_identity": {
    "name": "Valorización de Algas (Spirulina)",
    "id": "SIM-998877"
  }
};

export const NexoBridgeView: React.FC = () => {
  const [isCreativeMode, setIsCreativeMode] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string}[]>([]);

  const handleGenerateCreative = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger Animation
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Create particles
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: startX,
        y: startY,
        color: i % 2 === 0 ? '#f97316' : '#22d3ee' // Orange & Cyan
    }));
    setParticles(newParticles);

    // Start transition
    setTimeout(() => setIsCreativeMode(true), 100);

    // Clear particles after animation
    setTimeout(() => setParticles([]), 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full h-12 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md"></div>
            <span className="text-slate-200 font-bold tracking-wider">NEXO SINÉRGICO</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">👤 Dr. Nexo</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-cyan-400 border border-cyan-900">Académico</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-orange-400 border border-orange-900">Colaborador</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="pt-12 w-full h-full flex relative">
        
        {/* Left Panel (Scientific) */}
        <PyrolysisHubPanel 
            isTransferred={isCreativeMode} 
            onGenerateCreative={() => {
                // Hack to simulate event for particle origin (center of screen roughly)
                const fakeEvent = { currentTarget: { getBoundingClientRect: () => ({ left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 }) } } as any;
                handleGenerateCreative(fakeEvent);
            }}
        />

        {/* Right Panel (Creative AI) */}
        <CreativeCanvasPanel 
          isVisible={isCreativeMode} 
          contextData={BRIDGE_CONTEXT}
        />

        {/* Particle Layer */}
        {particles.map((p) => (
            <div 
                key={p.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none z-40 animate-ping"
                style={{
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    transition: 'all 1s ease-in-out',
                    transform: `translate(${Math.random() * 500 + 200}px, ${Math.random() * -200}px)`
                }}
            ></div>
        ))}

      </div>
    </div>
  );
};
