import React, { useState, useCallback, useMemo } from 'react';
import { Accordion } from './form/Accordion';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { extractMaterialFromDocument } from '../services/geminiService';
import type { PyrolysisMaterial } from '../types';

// FIX: Removed redundant global declaration for 'pdfjsLib' which is now centralized in types.ts.

const corporateData = [
  {
    "EntityID": "E1001",
    "EntityName": "Global Energy Holdings Inc.",
    "EntityType": "Corporation",
    "HeadquartersCountry": "USA",
    "WikiURL": "http://en.wikipedia.org/wiki/...",
    "Subsidiaries": [
      {
        "EntityID": "E2005",
        "EntityName": "Sudamérica Cementos S.A.",
        "EntityType": "Corporation",
        "HeadquartersCountry": "Colombia",
        "WikiURL": "http://en.wikipedia.org/wiki/...",
        "OwnershipPercentage": 85.0,
        "Subsidiaries": [],
        "Assets": [
          {
            "PlantID": "P3012",
            "PlantName": "Planta de Cemento de Bogotá",
            "Country": "Colombia",
            "Status": "Operating",
            "Capacity": 1.5,
            "CapacityUnit": "million tonnes",
            "OwnershipPercentage": 100.0,
            "AssetType": "Cement and Concrete"
          }
        ]
      }
    ],
    "Assets": []
  },
  {
    "EntityID": "E4500",
    "EntityName": "Vattenfall AB",
    "EntityType": "State-Owned Enterprise",
    "HeadquartersCountry": "Sweden",
    "WikiURL": "https://en.wikipedia.org/wiki/Vattenfall",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "B101",
        "AssetName": "Uppsala CHP Plant",
        "Country": "Sweden",
        "Status": "Operating",
        "Capacity": 220,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      },
      {
        "AssetID": "B102",
        "AssetName": "Jordbro CHP Plant",
        "Country": "Sweden",
        "Status": "Operating",
        "Capacity": 180,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      },
      {
        "AssetID": "B201",
        "AssetName": "Diemen Bioenergy Plant",
        "Country": "Netherlands",
        "Status": "Operating",
        "Capacity": 120,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E5000",
    "EntityName": "Fortum",
    "EntityType": "Corporation",
    "HeadquartersCountry": "Finland",
    "WikiURL": "https://en.wikipedia.org/wiki/Fortum",
    "Subsidiaries": [],
    "Assets": [
       {
        "AssetID": "B301",
        "AssetName": "Joensuu Bioenergy Plant",
        "Country": "Finland",
        "Status": "Operating",
        "Capacity": 50,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E6000",
    "EntityName": "Statkraft",
    "EntityType": "State-Owned Enterprise",
    "HeadquartersCountry": "Norway",
    "WikiURL": "https://en.wikipedia.org/wiki/Statkraft",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "B401",
        "AssetName": "Trondheim District Heating",
        "Country": "Norway",
        "Status": "Operating",
        "Capacity": 120,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Bioenergy Power"
      }
    ]
  },
  {
    "EntityID": "E7000",
    "EntityName": "Ørsted A/S",
    "EntityType": "Corporation",
    "HeadquartersCountry": "Denmark",
    "WikiURL": "https://en.wikipedia.org/wiki/%C3%98rsted_(company)",
    "Subsidiaries": [],
    "Assets": [
      {
        "AssetID": "W101",
        "AssetName": "Hornsea 1 Offshore Wind Farm",
        "Country": "United Kingdom",
        "Status": "Operating",
        "Capacity": 1218,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 50.0,
        "AssetType": "Offshore Wind Power"
      },
      {
        "AssetID": "W102",
        "AssetName": "Borssele 1 & 2 Offshore Wind Farm",
        "Country": "Netherlands",
        "Status": "Operating",
        "Capacity": 752,
        "CapacityUnit": "MW",
        "OwnershipPercentage": 100.0,
        "AssetType": "Offshore Wind Power"
      }
    ]
  }
];

interface KnowledgeSource {
    name: string;
    content: string;
}

interface KnowledgeBaseProps {
    sources: KnowledgeSource[];
    onAddSource: (source: KnowledgeSource) => void;
    onClearSources: () => void;
    onAddVirtualMaterial: (material: PyrolysisMaterial) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ sources, onAddSource, onClearSources, onAddVirtualMaterial }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isExtracting, setIsExtracting] = useState<string | null>(null);

    const handleCreateVirtualMaterial = async (source: KnowledgeSource) => {
        setIsExtracting(source.name);
        setError('');
        try {
            const material = await extractMaterialFromDocument(source.content);
            onAddVirtualMaterial(material);
        } catch (err) {
            setError(err instanceof Error ? `Error al extraer de ${source.name}: ${err.message}` : `Error desconocido al procesar ${source.name}`);
        } finally {
            setIsExtracting(null);
        }
    };

    const processFiles = useCallback(async (files: FileList) => {
        if (!files || files.length === 0) return;
    
        setIsProcessing(true);
        setError('');
    
        const filePromises = Array.from(files).map((file: File) => {
          return new Promise<KnowledgeSource>((resolve, reject) => {
            const reader = new FileReader();
            
            if (file.type === 'application/pdf') {
              reader.onload = async (event) => {
                try {
                  // FIX: Use window.pdfjsLib as it's defined on the global window object.
                  if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    throw new Error("La librería PDF.js no se ha cargado correctamente. Comprueba tu conexión a internet.");
                  }
                  const arrayBuffer = event.target?.result;
                  if (!arrayBuffer) return reject(new Error("No se pudo leer el archivo PDF."));
                  
                  // FIX: Use window.pdfjsLib as it's defined on the global window object.
                  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer as ArrayBuffer }).promise;
                  let fullText = '';
                  for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n\n';
                  }
                  resolve({ name: file.name, content: fullText });
                } catch (error) {
                  console.error("Error al procesar PDF:", error);
                  setError(`Error al leer el PDF: ${file.name}. Intenta de nuevo.`);
                  reject(error);
                }
              };
              reader.readAsArrayBuffer(file);
            } else if (file.type === 'text/plain') {
              reader.onload = (event) => {
                const content = event.target?.result;
                resolve({ name: file.name, content: typeof content === 'string' ? content : '' });
              };
              reader.readAsText(file);
            } else {
              setError(`Tipo de archivo no soportado: ${file.name}. Solo se aceptan PDF y TXT.`);
              reject(new Error('Unsupported file type'));
            }
          });
        });
    
        try {
          const results = await Promise.all(filePromises);
          results.forEach(onAddSource);
        } catch (error) {
          console.error("Error procesando archivos:", error);
        } finally {
          setIsProcessing(false);
        }
      }, [onAddSource]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files) {
          processFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Base de Conocimiento</h2>
                <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
                    Gestiona las fuentes de conocimiento que alimentan a Synthia Pro. Arrastra y suelta documentos (PDF, TXT) o pega URLs para que la IA los "absorba" y los utilice para enriquecer tu experiencia.
                </p>
            </header>

            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ingesta de Documentos (Memoria Documental)</h3>
                 <div 
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                <span>Selecciona archivos</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple disabled={isProcessing}/>
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, TXT. El contenido será extraído y añadido a la base de conocimiento.</p>
                        {isProcessing && <p className="text-sm text-blue-600 mt-2">Procesando...</p>}
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Fuentes de Conocimiento Documental Activas</h3>
                    <button onClick={onClearSources} className="text-sm font-semibold text-red-600 hover:text-red-800">Limpiar Añadidos</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sources.map(source => (
                        <div key={source.name} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                            <h4 className="font-bold text-lg text-blue-700 truncate" title={source.name}>{source.name}</h4>
                            <p className="text-sm text-gray-600 mt-2 h-20 overflow-hidden text-ellipsis flex-grow">{source.content.substring(0, 250)}...</p>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">{Math.ceil(source.content.length / 2500)} Páginas (aprox.)</span>
                                <button
                                    onClick={() => handleCreateVirtualMaterial(source)}
                                    disabled={isExtracting === source.name}
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isExtracting === source.name ? 'Extrayendo...' : 'Crear Material Virtual'}
                                </button>
                            </div>
                        </div>
                    ))}
                     {sources.length === 0 && (
                        <div className="md:col-span-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm p-12">
                            Añade un documento para empezar.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Memoria Corporativa (Datos Estructurados)</h3>
                <Accordion title="Base de Datos Simulada (structured_ownership_data.json)" defaultOpen={false}>
                    <div className="md:col-span-2 bg-gray-800 text-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(corporateData, null, 2)}
                        </pre>
                    </div>
                </Accordion>
            </div>

        </div>
    );
};