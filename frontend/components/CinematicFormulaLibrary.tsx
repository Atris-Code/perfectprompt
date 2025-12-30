import React, { useState } from 'react';
import { formulaData } from '../data/cinematicFormulas';

interface CinematicFormulaLibraryProps {
  onUseInLab: (promptText: string) => void;
}

export const CinematicFormulaLibrary: React.FC<CinematicFormulaLibraryProps> = ({ onUseInLab }) => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const formula = formulaData[0]; // Assuming only one formula for now

  const handleCopy = (promptText: string, promptTitle: string) => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPrompt(promptTitle);
      setTimeout(() => setCopiedPrompt(null), 2500);
    });
  };

  return (
    <section className="mt-12 pt-8 border-t">
      <h3 className="text-xl font-bold text-gray-800 mb-1">{formula.title}</h3>
      <p className="text-sm text-gray-600 mb-6">{formula.description}</p>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{formula.explanation.introduction}</h4>
        <div className="grid md:grid-cols-3 gap-6">
          {formula.explanation.phases.map((phase, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md border">
              <h5 className="font-bold text-blue-700 mb-2">{phase.title}</h5>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {phase.points.map((point, pIndex) => (
                  <li key={pIndex}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-6">Paquete de Prompts Cinematográficos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formula.prompts.map((prompt) => {
          const fullPrompt = `${prompt.ia_prompt}\n\n${prompt.phases.map(p => `${p.title}: ${p.description}`).join('\n\n')}`;
          return (
            <div key={prompt.title} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <h4 className="font-bold text-lg text-blue-700 mb-3">{prompt.title}</h4>
              <p className="text-sm text-gray-600 mb-1"><strong className="text-gray-700">Concepto:</strong> {prompt.concept}</p>
              <p className="text-sm text-gray-600 mb-4"><strong className="text-gray-700">IA Prompt:</strong> {prompt.ia_prompt}</p>
              
              <div className="space-y-3 mb-4 flex-grow">
                {prompt.phases.map((phase, index) => (
                  <div key={index}>
                    <h5 className="font-semibold text-sm text-gray-800">{phase.title}</h5>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto border-t pt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onUseInLab(fullPrompt)}
                  className="w-full inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                >
                  Usar en Laboratorio
                </button>
                <button
                  onClick={() => handleCopy(fullPrompt, prompt.title)}
                  className="w-full inline-flex items-center justify-center font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
                >
                  {copiedPrompt === prompt.title ? '¡Copiado!' : 'Copiar Prompt Completo'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};