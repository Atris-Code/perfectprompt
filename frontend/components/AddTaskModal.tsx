import React, { useState } from 'react';
import { FormInput, FormSelect } from './form/FormControls';
// FIX: 'ContentType' is used as a value, so it must not be a type-only import.
import { ContentType } from '../types';
import type { Task, TaskStatus, EventType } from '../types';

interface AddTaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
}

const AGENTS = [
    { id: 'synthia-pro', name: 'Synthia Pro' },
    { id: 'Orquestador', name: 'Orquestador del Concilio' },
];

const EVENT_TYPES: {id: EventType, name: string}[] = [
    {id: 'ViabilityAnalysis', name: 'Análisis de Viabilidad'},
    {id: 'VisualCampaign', name: 'Campaña Visual'},
    {id: 'ExecutiveReport', name: 'Reporte Ejecutivo'},
    {id: 'MarketOpportunityAnalysis', name: 'Análisis de Oportunidad de Mercado'},
    {id: 'ComparativeAnalysis', name: 'Análisis Comparativo'},
    {id: 'Assay', name: 'Ensayo de Laboratorio'},
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onSave }) => {  
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [objective, setObjective] = useState('');
    const [agentId, setAgentId] = useState(AGENTS[0].id);
    const [eventType, setEventType] = useState(EVENT_TYPES[0].id);
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!title.trim()) {
            setError('El título es obligatorio.');
            return;
        }

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title,
            createdAt: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
            status: 'Por Hacer',
            contentType: ContentType.Texto, // Default
            formData: {
                objective,
            },
            isIntelligent: true,
            agentId,
            eventType: eventType as EventType,
            subTasks: [
                { name: 'Análisis inicial', status: 'pending' },
                { name: 'Generación de borrador', status: 'pending' },
                { name: 'Revisión y refinamiento', status: 'pending' },
            ],
        };
        onSave(newTask);
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-modal-title"
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-8">
                        <h3 id="add-task-modal-title" className="text-2xl font-bold text-gray-900 mb-6">Añadir Nueva Tarea Inteligente</h3>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="space-y-4">
                            <FormInput
                                label="Título de la Tarea"
                                id="taskTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                            />
                             <FormInput
                                label="Fecha de Vencimiento (Opcional)"
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            <FormInput
                                label="Objetivo General"
                                id="objective"
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                            />
                             <FormSelect
                                label="Agente Responsable"
                                id="agentId"
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                            >
                                {AGENTS.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </FormSelect>
                             <FormSelect
                                label="Tipo de Evento/Resultado"
                                id="eventType"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value as EventType)}
                            >
                                {EVENT_TYPES.map(et => (
                                    <option key={et.id} value={et.id}>{et.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                            Guardar Tarea
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AddTaskModal;