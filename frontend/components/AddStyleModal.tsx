import React, { useState } from 'react';
import { FormInput, FormTextarea, FormSelect } from './form/FormControls';

interface PromptContributionModalProps {
  onClose: () => void;
  onSave: (handoffJson: any) => void;
}

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        // FIX: Corrected typo in FileReader method name.
        reader.readAsDataURL(file);
    });
};

const PromptContributionModal: React.FC<PromptContributionModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptBody, setPromptBody] = useState('');
  const [targetModule, setTargetModule] = useState('M3_Simulation');
  const [testProofFile, setTestProofFile] = useState<File | null>(null);
  const [requestedReputation, setRequestedReputation] = useState(10);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !promptBody || !testProofFile) {
      setError('Todos los campos, incluyendo la prueba de testeo, son obligatorios.');
      return;
    }
    setError('');

    let testProofData: any;
    let testProofType: string;

    try {
        if (testProofFile.type.includes('json')) {
            const text = await readFileAsText(testProofFile);
            testProofData = JSON.parse(text);
            testProofType = 'JSON_Output';
        } else if (testProofFile.type.startsWith('image/')) {
            const dataUrl = await readFileAsDataURL(testProofFile);
            testProofData = dataUrl.split(',')[1]; // aistudio expects just the base64 part for images
            testProofType = 'Image_Output';
        } else {
            testProofData = await readFileAsText(testProofFile);
            testProofType = 'Text_Output';
        }
    } catch (err) {
        setError(err instanceof Error ? `Error al procesar el archivo de prueba: ${err.message}` : 'Error al procesar archivo.');
        return;
    }

    const handoffJson = {
      handoffId: `ph-uuid-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceModule: "M1_Prompt_Library",
      proposer: {
        userId: "usr_investigador_001", // Placeholder
        userWallet: "0xAbc...123" // Placeholder
      },
      contributionType: "TESTED_PROMPT",
      prompt: {
        title: title,
        description: description,
        promptBody: promptBody,
        targetModule: targetModule
      },
      testProof: {
        type: testProofType,
        data: testProofData
      },
      governanceRequest: {
        requestedReputation: requestedReputation,
        // FIX: Corrected object property definition to be a valid key-value pair and used a string literal for the value.
        "proposalType": "REWARD"
      }
    };

    onSave(handoffJson);
  };
  
  const targetModuleOptions = [
      { value: 'M1_Creative_Editorial', label: 'M1: Creador/Editorial' },
      { value: 'M3_Simulation', label: 'M3: Simuladores Industriales' },
      { value: 'M4_Data_Analysis', label: 'M4: Análisis de Datos' },
      { value: 'M5_Strategic_Risk_Simulator', label: 'M5: Simulador de Riesgo Estratégico' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-contribution-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transform animate-scale-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-8 overflow-y-auto">
            <h3 id="prompt-contribution-modal-title" className="text-2xl font-bold text-gray-900 mb-6">Subir Prompt Testeado a Gobernanza</h3>
            
            {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

            <div className="space-y-4">
              <FormInput label="Título del Prompt" id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} required />
              <FormTextarea label="Descripción (qué hace y por qué es valioso)" id="description" name="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
              <FormTextarea label="Cuerpo del Prompt (el texto/JSON del prompt)" id="promptBody" name="promptBody" rows={6} value={promptBody} onChange={e => setPromptBody(e.target.value)} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect label="Módulo de Destino" id="targetModule" name="targetModule" value={targetModule} onChange={e => setTargetModule(e.target.value)} required>
                      {targetModuleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </FormSelect>
                  <FormInput label="Reputación Solicitada" id="requestedReputation" name="requestedReputation" type="number" value={requestedReputation} onChange={e => setRequestedReputation(Number(e.target.value))} required />
              </div>
               <div>
                  <label htmlFor="testProofFile" className="block text-sm font-medium text-gray-700">Prueba de Testeo (¡Crítico!)</label>
                  <p className="text-xs text-gray-500 mb-2">Adjunta el output generado por el prompt (JSON, imagen, texto, etc.).</p>
                  <input id="testProofFile" name="testProofFile" type="file" onChange={e => setTestProofFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 mt-auto flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none">
              Enviar a Validación
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

export default PromptContributionModal;