import React from 'react';
import type { AgentSolution } from '../types';

interface AgentSolutionDisplayProps {
    solutions: AgentSolution[];
    onApply: (solution: AgentSolution) => void;
}

const AgentSolutionDisplay: React.FC<AgentSolutionDisplayProps> = ({ solutions, onApply }) => {
    if (!solutions || solutions.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg animate-fade-in">
            <h3 className="text-xl font-bold text-yellow-900 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Soluciones del Super-Agente Híbrido (SAH)
            </h3>
            <p className="text-sm text-yellow-800 mb-6">El FCN Score fue bajo. Basado en los agentes activados, aquí hay algunas soluciones proactivas para mejorar tu prompt.</p>
            <div className="space-y-4">
                {solutions.map((solution, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800">{solution.correctionType}</h4>
                            <span className="text-xs font-semibold uppercase bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">{solution.agent}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{solution.description}</p>
                        <button
                            onClick={() => onApply(solution)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-yellow-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4 9a9 9 0 109-9" /></svg>
                            Aplicar y Regenerar
                        </button>
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AgentSolutionDisplay;
