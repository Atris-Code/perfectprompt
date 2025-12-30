import React from 'react';
import type { View, ChronosState, IssuanceState, STOState } from '../../types';

interface ChronosProps {
    chronosState: ChronosState;
    issuanceState: IssuanceState;
    stoState: STOState;
    setView: (view: View) => void;
    handleVerifyAsset: () => void;
    handleLiquidation: () => void;
    handleConfirmStructure: () => void;
    handleDeployContract: () => void;
    handleMintTokens: () => void;
}

const Phase: React.FC<React.PropsWithChildren<{ phaseNumber: number; title: string; status: 'completed' | 'active' | 'pending'; onNavigate?: () => void; isNavigable?: boolean }>> = ({ phaseNumber, title, status, children, onNavigate, isNavigable = true }) => {
    const statusClasses = {
        completed: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-300' },
        active: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-300' },
        pending: { bg: 'bg-gray-600', border: 'border-gray-600', text: 'text-gray-400' },
    };

    const currentStatus = statusClasses[status];

    return (
        <div className="flex">
            <div className="flex flex-col items-center mr-4">
                <div>
                    <div className={`flex items-center justify-center w-10 h-10 border-2 rounded-full ${currentStatus.border}`}>
                        <span className={`text-lg font-bold ${currentStatus.text}`}>{phaseNumber}</span>
                    </div>
                </div>
                <div className={`w-px h-full ${currentStatus.bg}`}></div>
            </div>
            <div className="pb-8 flex-1">
                <div className="flex items-center justify-between">
                    <p className={`text-xl font-bold ${currentStatus.text}`}>{title}</p>
                    {onNavigate && isNavigable && status !== 'pending' && (
                         <button onClick={onNavigate} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                            Ir al Módulo →
                         </button>
                    )}
                </div>
                <div className="mt-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Chronos: React.FC<ChronosProps> = ({ chronosState, issuanceState, stoState, setView, handleVerifyAsset, handleLiquidation, handleConfirmStructure, handleDeployContract, handleMintTokens }) => {
    const { phase, assetOrigin, tokenStructure, liquidation } = chronosState;

    return (
        <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl h-full flex flex-col font-sans">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold">Módulo de Simulación "Chronos"</h2>
                <p className="mt-2 text-md text-gray-400">Trazando el Flujo de la Tokenización de Activos Agrícolas</p>
            </header>

            <div className="overflow-y-auto pr-4">
                <Phase phaseNumber={1} title="Selección y Valoración del Activo" status={phase >= 1 ? (phase > 1 ? 'completed' : 'active') : 'pending'} isNavigable={false}>
                    <div className="space-y-2 text-sm">
                        <p><strong>Activo:</strong> {assetOrigin.assetType}</p>
                        <p><strong>Volumen Estimado:</strong> {assetOrigin.estimatedVolume.toLocaleString()} toneladas</p>
                        <p><strong>Valor de Mercado Esperado:</strong> {assetOrigin.marketValue.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</p>
                        <p><strong>Fecha de Liquidación:</strong> {assetOrigin.liquidationDate}</p>
                        <div className="pt-2">
                             <button onClick={handleVerifyAsset} disabled={assetOrigin.status !== 'PENDING'} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {assetOrigin.status === 'PENDING' ? 'Iniciar Verificación Externa' : assetOrigin.status === 'VERIFYING' ? 'Verificando...' : 'Activo Verificado ✅'}
                             </button>
                        </div>
                    </div>
                </Phase>

                <Phase phaseNumber={2} title="Estructuración del Token" status={phase >= 2 ? (phase > 2 ? 'completed' : 'active') : 'pending'} isNavigable={false}>
                     <div className="space-y-2 text-sm">
                        <p><strong>Derechos del Token:</strong> {tokenStructure.rights}</p>
                        <p><strong>Nombre del Token:</strong> {tokenStructure.tokenName}</p>
                        <p><strong>Valor Nominal:</strong> {tokenStructure.nominalValue.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</p>
                        <p><strong>Suministro Total:</strong> {tokenStructure.totalSupply.toLocaleString()} tokens</p>
                        {phase === 2 && (
                            <div className="pt-2">
                                <button onClick={handleConfirmStructure} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                                    Confirmar Estructura y Proceder
                                </button>
                            </div>
                        )}
                    </div>
                </Phase>

                <Phase phaseNumber={3} title="Emisión en la Blockchain" status={phase >= 3 ? (phase > 3 ? 'completed' : 'active') : 'pending'} isNavigable={false}>
                    <p className="text-sm"><strong>Estado del Contrato:</strong> {issuanceState.contractStatus}</p>
                    <p className="text-sm"><strong>Estado de los Tokens:</strong> {issuanceState.tokenStatus}</p>
                    {issuanceState.contractAddress && <p className="text-xs text-gray-400 font-mono mt-1">Contrato: {issuanceState.contractAddress}</p>}
                    
                    {phase === 3 && (
                        <div className="pt-4 flex gap-2">
                            <button 
                                onClick={handleDeployContract} 
                                disabled={issuanceState.contractStatus === 'DEPLOYED'}
                                className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {issuanceState.contractStatus === 'DEPLOYED' ? 'Contrato Desplegado' : 'Desplegar Contrato'}
                            </button>
                            <button 
                                onClick={handleMintTokens} 
                                disabled={issuanceState.contractStatus !== 'DEPLOYED' || issuanceState.tokenStatus === 'MINTED'}
                                className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {issuanceState.tokenStatus === 'MINTED' ? 'Tokens Emitidos' : 'Emitir Tokens'}
                            </button>
                        </div>
                    )}
                </Phase>

                <Phase phaseNumber={4} title="Microfinanciación Descentralizada (STO)" status={phase >= 4 ? (phase > 4 ? 'completed' : 'active') : 'pending'} onNavigate={() => setView('agriDeFi')}>
                    <p className="text-sm"><strong>Estado de la Oferta:</strong> {stoState.status}</p>
                    <p className="text-sm"><strong>Fondos Recaudados:</strong> {stoState.fundsRaised.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</p>
                </Phase>
                
                <div className="flex">
                     <div className="flex flex-col items-center mr-4">
                        <div><div className={`flex items-center justify-center w-10 h-10 border-2 rounded-full ${phase === 5 ? 'border-blue-500' : 'border-gray-600'}`}><span className={`text-lg font-bold ${phase === 5 ? 'text-blue-300' : 'text-gray-400'}`}>5</span></div></div>
                    </div>
                    <div className="pb-8 flex-1">
                        <p className={`text-xl font-bold ${phase === 5 ? 'text-blue-300' : 'text-gray-400'}`}>Liquidación y Mercado Secundario</p>
                        <div className="mt-3 p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-4">
                             <button onClick={() => setView('hyperion-9')} disabled={phase < 5} className="w-full text-sm font-semibold text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 disabled:cursor-not-allowed text-left">
                                Ver Mercado Secundario (DEX) en Hyperion-9 →
                             </button>
                             <div className="pt-4 border-t border-gray-700">
                                <button onClick={handleLiquidation} disabled={phase !== 5 || liquidation.status === 'EXECUTED'} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {liquidation.status === 'EXECUTED' ? 'Liquidación Completada ✅' : 'Ejecutar Venta de Cosecha'}
                                </button>
                                {liquidation.status === 'EXECUTED' && liquidation.salePrice && (
                                    <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded text-sm">
                                        <p className="text-green-300 font-bold mb-1">Resultados de la Liquidación:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-gray-400 block text-xs">Precio de Venta Final</span>
                                                <span className="text-white font-mono">{liquidation.salePrice.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-xs">Retorno (ROI)</span>
                                                <span className="text-green-400 font-bold">+{liquidation.profitPercentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};