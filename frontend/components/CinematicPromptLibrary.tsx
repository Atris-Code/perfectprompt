import React, { useState } from 'react';
import { CINEMATIC_PROMPTS } from '../data/cinematicPrompts';
import type { CinematicPrompt } from '../data/cinematicPrompts';

interface PromptCardProps {
  prompt: CinematicPrompt;
  onUseInLab: (promptText: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onUseInLab }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt_cinematografico).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
      <h4 className="font-bold text-md text-blue-700 mb-2">{prompt.titulo}</h4>
      <p className="text-sm text-gray-600 flex-grow mb-4">{prompt.prompt_cinematografico}</p>
      
      <div className="mt-auto border-t pt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onUseInLab(prompt.prompt_cinematografico)}
          className="w-full inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          Usar en Laboratorio
        </button>
        <button
          onClick={handleCopy}
          className="w-full inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 003 3h4a3 3 0 003-3V7a3 3 0 00-3-3H8zm0 2h4a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd" /></svg>
          {isCopied ? '¡Copiado!' : 'Copiar Prompt'}
        </button>
      </div>
    </div>
  );
};


export const CinematicPromptLibrary: React.FC<{ onUseInLab: (promptText: string) => void }> = ({ onUseInLab }) => {
  return (
    <section className="mt-12 pt-8 border-t">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Biblioteca de Prompts Cinematográficos</h3>
      <p className="text-sm text-gray-600 mb-6">Usa estas plantillas como punto de partida en el Laboratorio de Experimentación.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CINEMATIC_PROMPTS.map((prompt) => (
          <PromptCard key={prompt.titulo} prompt={prompt} onUseInLab={onUseInLab} />
        ))}
      </div>
    </section>
  );
};