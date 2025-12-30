import React, { useState, useEffect } from 'react';
import type { SkillModule } from '../types';
import { FormInput, FormTextarea, FormSelect } from './form/FormControls';
import { SKILL_MODULE_PRESETS } from '../data/skillModulePresets';

interface CreateSkillModuleModalProps {
  onClose: () => void;
  onSave: (skillData: { name: string; instruction: string } | SkillModule) => void;
  skillModuleToEdit?: SkillModule | null;
  titanName: string;
}

const CreateSkillModuleModal: React.FC<CreateSkillModuleModalProps> = ({ onClose, onSave, skillModuleToEdit, titanName }) => {
  const isEditMode = !!skillModuleToEdit;
  const [name, setName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [error, setError] = useState('');

  const titanPresets = SKILL_MODULE_PRESETS[titanName] || [];

  useEffect(() => {
    if (skillModuleToEdit) {
      setName(skillModuleToEdit.name);
      setInstruction(skillModuleToEdit.instruction);
    }
  }, [skillModuleToEdit]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPresetName = e.target.value;
    const preset = titanPresets.find(p => p.name === selectedPresetName);
    if (preset) {
        setName(preset.name);
        setInstruction(preset.instruction);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instruction.trim()) {
      setError('El nombre y la instrucción son obligatorios.');
      return;
    }

    if (isEditMode && skillModuleToEdit) {
      onSave({ ...skillModuleToEdit, name, instruction });
    } else {
      onSave({ name, instruction });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-module-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h3 id="skill-module-modal-title" className="text-2xl font-bold mb-6">{isEditMode ? 'Editar Módulo de Habilidad' : 'Crear Nuevo Módulo de Habilidad'}</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            {!isEditMode && titanPresets.length > 0 && (
                <div className="mb-4">
                    <FormSelect label="Crear desde Preset (Opcional)" onChange={handlePresetChange} defaultValue="">
                         <option value="">-- Cargar una plantilla --</option>
                         {titanPresets.map(preset => (
                             <option key={preset.name} value={preset.name}>{preset.name}</option>
                         ))}
                    </FormSelect>
                </div>
            )}
            
            <div className="space-y-4">
              <FormInput label="Nombre del Módulo *" id="skillName" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <FormTextarea label="Instrucción Central *" id="skillInstruction" name="instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={5} required placeholder="Describe la tarea a ejecutar, incluyendo los Asistentes a consultar y los [parámetros] necesarios." />
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">Guardar Módulo</button>
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

export default CreateSkillModuleModal;
