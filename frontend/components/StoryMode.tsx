

import React from 'react';
import { storyMissions } from '../data/storyMissions';

interface StoryModeProps {
  currentMissionIndex: number;
  setCurrentMissionIndex: (index: number) => void;
  onAcceptMission: () => void;
  onFinish: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ currentMissionIndex, setCurrentMissionIndex, onAcceptMission, onFinish }) => {
  const mission = storyMissions[currentMissionIndex];
  const isLastMission = currentMissionIndex === storyMissions.length - 2; // Second to last, as the last one is graduation.
  const isGraduation = currentMissionIndex === storyMissions.length - 1;

  if (!mission) return null;

  return (
    <div className="bg-gray-900 text-white p-8 rounded-lg min-h-full font-sans">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Modo Historia: Salva la Ciudad</h1>
        <p className="text-xl text-gray-400 mt-4">Completa la campaña para desbloquear todo el potencial del Nexo Sinérgico.</p>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm text-white p-6 border-2 border-cyan-500 z-50 shadow-2xl animate-fade-in rounded-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-6">
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">{mission.title}</h3>
              <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{mission.directorPrompt}</p>
              <div className="text-md font-semibold text-white bg-gray-900/50 p-3 rounded-md border border-gray-700">
                <strong>Objetivo:</strong>
                <p className="font-normal mt-1">{mission.objective}</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3 w-full md:w-64">
              <button
                onClick={onAcceptMission}
                disabled={isGraduation}
                className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isGraduation ? '¡Completado!' : 'Ir al Módulo →'}
              </button>
              <div className="flex w-full gap-2">
                <button
                  onClick={() => setCurrentMissionIndex(currentMissionIndex - 1)}
                  disabled={currentMissionIndex === 0}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  Anterior
                </button>
                {isGraduation ? (
                  <button onClick={onFinish} className="flex-1 bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg">Finalizar</button>
                ) : (
                  <button
                    onClick={() => setCurrentMissionIndex(currentMissionIndex + 1)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg"
                  >
                    {isLastMission ? 'Misión Final' : 'Siguiente'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">Misión {currentMissionIndex + 1} de {storyMissions.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};