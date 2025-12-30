import React, { useState } from 'react';
import type { Assistant } from '../types';
import { FormSelect, FormTextarea } from './form/FormControls';
import { delegateToAssistant } from '../services/geminiService';

interface DelegateTaskModalProps {
  assistants: Assistant[];
  knowledgeSources: { name: string; content: string }[];
  onClose: () => void;
  onDelegate: (assistantName: string, responseText: string) => void;
}

export const DelegateTaskModal: React.FC<DelegateTaskModalProps> = ({ assistants, knowledgeSources, onClose, onDelegate }) => {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(assistants[0]?.id || '');
  const [task, setTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistantId || !task.trim()) {
      setError('Debes seleccionar un asistente y describir la tarea.');
      return;
    }

    const selectedAssistant = assistants.find(a => a.id === selectedAssistantId);
    if (!selectedAssistant) {
      setError('Asistente seleccionado no válido.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const responseText = await delegateToAssistant(task, selectedAssistant, knowledgeSources);
      onDelegate(selectedAssistant.name, responseText);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al delegar la tarea.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delegate-task-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h3 id="delegate-task-modal-title" className="text-2xl font-bold mb-6">Delegar Sub-tarea a Asistente</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <FormSelect label="Seleccionar Asistente Activo *" value={selectedAssistantId} onChange={(e) => setSelectedAssistantId(e.target.value)} required>
                <option value="" disabled>Selecciona un asistente...</option>
                {assistants.map(asst => (
                  <option key={asst.id} value={asst.id}>{asst.name}</option>
                ))}
              </FormSelect>
              <FormTextarea label="Sub-tarea a Realizar *" value={task} onChange={(e) => setTask(e.target.value)} rows={5} placeholder="Ej: Analiza las propiedades mecánicas del mesocarpio según tu base de conocimiento y resume los hallazgos clave." required />
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-400">
              {isLoading ? 'Delegando...' : 'Delegar Tarea'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};
