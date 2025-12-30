import React, { useState, useEffect } from 'react';
import type { Assistant } from '../types';
import { FormInput, FormTextarea } from './form/FormControls';

const pdfToText = async (file: File): Promise<string> => {
    if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        throw new Error("La librería PDF.js no se ha cargado correctamente.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
    }
    return fullText.trim();
};

export const AssistantModal: React.FC<{
  onClose: () => void;
  onCreate: (assistantData: Omit<Assistant, 'id' | 'status'>) => void;
  onUpdate: (assistantData: Assistant) => void;
  knowledgeSources: { name: string; content: string }[];
  assistantToEdit?: Assistant | null;
}> = ({ onClose, onCreate, onUpdate, knowledgeSources, assistantToEdit }) => {
  const isEditMode = !!assistantToEdit;
  
  const [name, setName] = useState('');
  const [rolePrompt, setRolePrompt] = useState('Actúa como un ingeniero de materiales experto y científico de biocompuestos, con un profundo conocimiento en materiales lignocelulósicos y sus aplicaciones sostenibles.');
  const [sourceType, setSourceType] = useState<'upload' | 'kb'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFileNames, setExistingFileNames] = useState<string[]>([]);
  const [selectedKb, setSelectedKb] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assistantToEdit) {
      setName(assistantToEdit.name);
      setRolePrompt(assistantToEdit.rolePrompt);
      setSourceType(assistantToEdit.knowledgeSource.type);
      if (assistantToEdit.knowledgeSource.type === 'kb') {
        setSelectedKb(assistantToEdit.knowledgeSource.kb_files || []);
      }
      if (assistantToEdit.knowledgeSource.type === 'upload' && assistantToEdit.knowledgeSource.files) {
        setExistingFileNames(assistantToEdit.knowledgeSource.files.map(f => f.name));
        setUploadedFiles([]);
      }
    }
  }, [assistantToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
      setExistingFileNames([]); // New files will replace old ones if user selects new ones
    }
  };

  const handleKbChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKb(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del asistente es obligatorio.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      let knowledgeSource: Assistant['knowledgeSource'];

      if (sourceType === 'upload') {
        if (uploadedFiles.length > 0) {
          const filesContent = await Promise.all(
            uploadedFiles.map(async (file) => {
              let content = '';
              if (file.type === 'application/pdf') {
                content = await pdfToText(file);
              } else if (file.type === 'text/plain') {
                content = await file.text();
              } else {
                throw new Error(`Formato de archivo no soportado: ${file.name}. Solo PDF y TXT.`);
              }
              return { name: file.name, content };
            })
          );
          knowledgeSource = { type: 'upload', files: filesContent };
        } else if (isEditMode && assistantToEdit?.knowledgeSource.type === 'upload') {
          knowledgeSource = assistantToEdit.knowledgeSource; // Keep existing files
        } else {
          throw new Error('Debes subir al menos un archivo.');
        }
      } else { // sourceType === 'kb'
        if (selectedKb.length === 0) {
          throw new Error('Debes seleccionar al menos un documento de la base de conocimiento.');
        }
        knowledgeSource = { type: 'kb', kb_files: selectedKb };
      }

      if (isEditMode && assistantToEdit) {
        onUpdate({
          ...assistantToEdit,
          name,
          rolePrompt,
          knowledgeSource
        });
      } else {
        onCreate({ name, rolePrompt, knowledgeSource });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar los archivos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-assistant-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h3 id="create-assistant-modal-title" className="text-2xl font-bold mb-6">{isEditMode ? 'Editar Asistente IA' : 'Crear Nuevo Asistente IA'}</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <FormInput label="Nombre del Asistente" value={name} onChange={(e) => setName(e.target.value)} required />
              <FormTextarea label="Definición del Rol (Prompt Base)" value={rolePrompt} onChange={(e) => setRolePrompt(e.target.value)} rows={4} required />

              <div>
                <label className="font-medium text-gray-700">Fuente de Conocimiento</label>
                <div className="mt-2 flex gap-4">
                  <label>
                    <input type="radio" name="sourceType" value="upload" checked={sourceType === 'upload'} onChange={() => setSourceType('upload')} /> Cargar Documento(s)
                  </label>
                  <label>
                    <input type="radio" name="sourceType" value="kb" checked={sourceType === 'kb'} onChange={() => setSourceType('kb')} /> Seleccionar de Base de Conocimiento
                  </label>
                </div>
              </div>

              {sourceType === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Archivos (PDF, TXT)</label>
                  <input type="file" onChange={handleFileChange} multiple accept=".pdf,.txt" className="mt-1 block w-full text-sm"/>
                   {existingFileNames.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                            <p>Archivos existentes (se reemplazarán si subes nuevos):</p>
                            <ul className="list-disc list-inside">
                                {existingFileNames.map(name => <li key={name}>{name}</li>)}
                            </ul>
                        </div>
                   )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documentos (Ctrl+Click para múltiple)</label>
                  <select multiple value={selectedKb} onChange={handleKbChange} className="mt-1 block w-full h-32 p-2 border border-gray-300 rounded-md">
                    {knowledgeSources.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border">
              Cancelar
            </button>
            <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-400">
              {isProcessing ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Asistente' : 'Guardar Asistente (Inactivo)')}
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
