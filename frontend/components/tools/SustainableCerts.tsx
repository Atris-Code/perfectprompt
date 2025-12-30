import React, { useState, useEffect } from 'react';
import type { Task, View, Certification, NftMetadata } from '../../types';
import { ContentType } from '../../types';

interface SustainableCertsProps {
  onMint: (certification: Certification) => void;
  setView: (view: View) => void;
}

const Step: React.FC<{ step: number; title: string; active: boolean; completed: boolean; children: React.ReactNode }> = ({ step, title, active, completed, children }) => {
    return (
        <div className={`p-6 rounded-lg border-2 ${active ? 'border-blue-500 bg-blue-50' : completed ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <h3 className={`text-xl font-bold ${active ? 'text-blue-700' : completed ? 'text-green-700' : 'text-gray-800'}`}>Paso {step}: {title}</h3>
            {active && <div className="mt-4">{children}</div>}
            {completed && <p className="mt-2 text-green-600 font-semibold">✓ Completado</p>}
        </div>
    );
};

export const SustainableCerts: React.FC<SustainableCertsProps> = ({ onMint, setView }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [isVoting, setIsVoting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [nftMetadata, setNftMetadata] = useState<NftMetadata | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileError('');
        }
    };

    const handleValidateFile = () => {
        if (!file) {
            setFileError('Por favor, sube un archivo.');
            return;
        }
        if (file.type !== 'application/json') {
            setFileError('El archivo debe ser de tipo JSON.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const performance = parseFloat(json.final_kpis?.rendimiento_global_economico_eur_ton);
                const risk = parseFloat(json.final_kpis?.riesgo_operativo_total_eur_ton);

                if (performance > 50 && risk < 3) {
                    setStep(3);
                } else {
                    setFileError(`KPIs no cumplidos. Rendimiento: ${performance.toFixed(2)} (>50), Riesgo: ${risk.toFixed(2)} (<3).`);
                }
            } catch (error) {
                setFileError('Error al parsear el archivo JSON. Asegúrate de que el formato es correcto.');
            }
        };
        reader.readAsText(file);
    };

    const handleVote = () => {
        setIsVoting(true);
        setTimeout(() => {
            setIsVoting(false);
            setStep(4);
        }, 3000);
    };

    const handleMint = () => {
        setIsMinting(true);
        setTimeout(() => {
            const metadata: NftMetadata = {
                name: "Operador de Vulcano Nivel 3",
                description: "Certificación que acredita la competencia en la operación del módulo Vulcano y la optimización de procesos de pirólisis.",
                image: "ipfs://bafybeicg2mgj32m5ajtauve4h25ov56naq3sfpwz5bllu5ixvmpv7btzpq", // Placeholder IPFS hash
                attributes: [
                    { "trait_type": "Nivel", "value": "3" },
                    { "trait_type": "Módulo", "value": "Vulcano" },
                    { "trait_type": "Fecha de Emisión", "value": new Date().toISOString().split('T')[0] }
                ],
                proof_of_validation: {
                    capstone_submission_id: `sim_report_${Date.now()}`,
                    governance_proposal_id: `prop_val_${Date.now()}`,
                    governance_contract: "0xabc...def",
                    validation_tx_hash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
                }
            };
            const newCertification: Certification = {
                id: `cert-${Date.now()}`,
                name: metadata.name,
                level: 3,
                reactor: "Vulcano",
                nftMetadata: metadata,
                mintDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            setNftMetadata(metadata);
            onMint(newCertification);
            setIsMinting(false);
            setStep(6);
        }, 4000);
    };
    
    useEffect(() => {
        if(step === 4) {
            handleMint();
        }
    }, [step]);
    
    const downloadExampleFile = () => {
        const exampleData = {
            "simulation_id": "sim_report_999",
            "timestamp": new Date().toISOString(),
            "module": "M3_Technical_Risk_Simulator",
            "final_kpis": {
                "rendimiento_global_economico_eur_ton": 55.78,
                "riesgo_operativo_total_eur_ton": 2.5
            }
        };
        const blob = new Blob([JSON.stringify(exampleData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sim_report_999.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md mb-16">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Certificación de Méritos On-Chain (NFT)</h2>
                <p className="mt-2 text-md text-gray-600">Transforma tus logros en el ecosistema en credenciales verificables en la blockchain.</p>
            </header>

            <div className="max-w-3xl mx-auto space-y-6">
                <Step step={1} title="Solicitar Certificación" active={step === 1} completed={step > 1}>
                    <p>Estás solicitando la certificación:</p>
                    <p className="font-bold text-lg my-2">Operador de Vulcano Nivel 3</p>
                    <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Iniciar Prueba de Habilidad</button>
                </Step>

                <Step step={2} title="Prueba de Habilidad" active={step === 2} completed={step > 2}>
                    <p className="mb-2">Para continuar, sube un reporte JSON de una simulación de Monte-Carlo (Módulo 3) que demuestre los siguientes KPIs:</p>
                    <ul className="list-disc list-inside mb-4 bg-gray-100 p-3 rounded-md">
                        <li>`rendimiento_global_economico_eur_ton`: <strong className="font-mono">&gt; 50</strong></li>
                        <li>`riesgo_operativo_total_eur_ton`: <strong className="font-mono">&lt; 3</strong></li>
                    </ul>
                    <input type="file" onChange={handleFileChange} accept=".json" className="block w-full text-sm"/>
                    {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
                    <div className="mt-4 flex gap-4">
                        <button onClick={handleValidateFile} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Validar Reporte</button>
                        <button onClick={downloadExampleFile} className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Descargar Ejemplo Válido</button>
                    </div>
                </Step>

                <Step step={3} title="Validación por Pares (Gobernanza)" active={step === 3} completed={step > 3}>
                    <p>¡Excelente! Tu reporte cumple con los KPIs. Se ha creado una propuesta de gobernanza para que tus pares validen tu logro.</p>
                    <div className="mt-4 text-center">
                        <button onClick={handleVote} disabled={isVoting} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                            {isVoting ? 'Votando...' : 'Simular Votación de Pares'}
                        </button>
                        {isVoting && <p className="text-sm mt-2">Simulando el consenso de la DAO...</p>}
                    </div>
                </Step>
                
                 <Step step={4} title="Acuñación (Minting) de NFT" active={step === 4 || step === 5} completed={step > 5}>
                     <p>La propuesta ha sido aprobada. El sistema está ahora acuñando (minting) tu NFT en la blockchain de prueba. Este proceso puede tardar unos momentos.</p>
                    {isMinting && (
                        <div className="mt-4 flex items-center justify-center gap-4">
                             <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="font-semibold text-blue-700">Acuñando credencial en la blockchain...</span>
                        </div>
                    )}
                </Step>

                <Step step={6} title="Certificación Obtenida" active={step === 6} completed={step === 6}>
                     <p className="text-green-700 font-semibold text-lg text-center">¡Felicidades! Has obtenido tu credencial NFT.</p>
                     {nftMetadata && (
                        <div className="mt-4 bg-gray-800 text-white p-4 rounded-md font-mono text-xs max-h-80 overflow-y-auto">
                            <pre>{JSON.stringify(nftMetadata, null, 2)}</pre>
                        </div>
                     )}
                     <div className="mt-4 flex gap-4">
                         <button onClick={() => setView('user-profile')} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Ver en mi Perfil</button>
                     </div>
                </Step>
            </div>
        </div>
    );
};