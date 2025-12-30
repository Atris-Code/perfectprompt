import React, { useState } from 'react';
import { FormInput } from './form/FormControls';

interface SavePepStyleModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const SavePepStyleModal: React.FC<SavePepStyleModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    onSave(name.trim());
    onClose();
  };
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-style-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
            <h3 id="save-style-modal-title" className="text-2xl font-bold text-gray-900 mb-6">Guardar Estilo PEP</h3>
            <FormInput
                label="Nombre para el nuevo estilo"
                id="styleName"
                name="styleName"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                error={error}
                required
                placeholder="Ej: Look Cinemático Neón"
                autoFocus
              />
        </div>
        <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none">
              Guardar Estilo
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  )
};

export default SavePepStyleModal;