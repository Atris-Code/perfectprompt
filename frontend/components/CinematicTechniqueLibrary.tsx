import React, { useState } from 'react';
import { CINEMATIC_TECHNIQUES } from '../data/cinematicTechniques';
import type { CinematicTechnique } from '../data/cinematicTechniques';

const TechniqueCard: React.FC<{ technique: CinematicTechnique }> = ({ technique }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(technique.prompt_block).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] transform flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-md text-blue-700">{technique.name}</h4>
        <span className="text-xs font-semibold uppercase bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">{technique.type}</span>
      </div>
      <p className="text-sm text-gray-600 flex-grow mb-3">{technique.purpose}</p>
      
      <div className="mt-auto border-t pt-3 space-y-2">
        <h5 className="text-xs font-semibold text-gray-500">Bloque de Prompt para IA:</h5>
        <pre className="text-xs bg-gray-100 text-gray-700 p-2 rounded-md whitespace-pre-wrap font-mono">{technique.prompt_block}</pre>
        <button
          onClick={handleCopy}
          className="w-full inline-flex items-center justify-center font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3H8zm0 2h4a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd" /></svg>
          {isCopied ? '¡Copiado!' : 'Copiar Prompt'}
        </button>
      </div>
    </div>
  );
};

export const CinematicTechniqueLibrary: React.FC = () => {
  return (
    <section className="mt-12 pt-8 border-t">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Biblioteca de Técnicas Cinematográficas</h3>
      <p className="text-sm text-gray-600 mb-6">Aprende y copia los bloques de construcción para dirigir tu prompt de video. Pégalos en el "Resumen del Guion" del Creador de Video.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CINEMATIC_TECHNIQUES.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </div>
    </section>
  );
};
