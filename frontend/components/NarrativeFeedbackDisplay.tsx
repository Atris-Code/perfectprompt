import React from 'react';
import type { NarrativeConsistencyFeedback } from '../types';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const isPositive = score >= 0;
  const colorClasses = score > 5 ? 'bg-green-100 text-green-800 border-green-300'
                     : score >= 0 ? 'bg-lime-100 text-lime-800 border-lime-300'
                     : score > -5 ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                     : 'bg-red-100 text-red-800 border-red-300';
  
  return (
    <div className={`text-center p-4 rounded-lg border-2 ${colorClasses} w-24 flex-shrink-0 flex flex-col items-center justify-center`}>
      <div className="text-3xl font-bold">{isPositive ? '+' : ''}{score}</div>
      <div className="text-xs font-semibold uppercase tracking-wider mt-1">Índice FCN</div>
    </div>
  );
};

interface NarrativeFeedbackDisplayProps {
  feedback: NarrativeConsistencyFeedback;
}

export const NarrativeFeedbackDisplay: React.FC<NarrativeFeedbackDisplayProps> = ({ feedback }) => {
  return (
    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg animate-fade-in">
      <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M17.32 9.32a4.5 4.5 0 010 6.36m-12.72-6.36a4.5 4.5 0 010 6.36M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Feedback de Consistencia Narrativa (FCN)
      </h3>
      <div className="space-y-4">
        <div className="flex gap-4 items-start bg-white p-4 rounded-md shadow-sm">
          <ScoreBadge score={feedback?.stylisticCohesion?.score ?? 0} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Cohesión Estilística</h4>
            <p className="text-sm text-gray-600 mt-1">{feedback?.stylisticCohesion?.analysis ?? 'Análisis no disponible.'}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start bg-white p-4 rounded-md shadow-sm">
          <ScoreBadge score={feedback?.emotionalIntensity?.score ?? 0} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Intensidad Emocional</h4>
            <p className="text-sm text-gray-600 mt-1">{feedback?.emotionalIntensity?.analysis ?? 'Análisis no disponible.'}</p>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};
