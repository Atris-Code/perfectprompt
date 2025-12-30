import React, { useState, useEffect } from 'react';
import type { ReactorState, ReactorStatus, OrionViewType } from '../../types';
import { useTranslations } from '../../contexts/LanguageContext';

const ORION_VIEWS: { id: OrionViewType; name: string }[] = [
    { id: 'production', name: 'view.hyperion.productionView' },
    { id: 'thermal', name: 'view.hyperion.thermalView' },
    { id: 'security', name: 'view.hyperion.securityView' },
];

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const getStatusInfo = (status: ReactorStatus, temp: number, target: number): { bar: string; border: string; text: string; label: string; } => {
    switch (status) {
        case 'Estable':
            const diff = Math.abs(temp - target);
            if (diff > 50) return { bar: 'bg-red-500', border: 'border-red-500/50', text: 'text-red-400', label: 'hmi.reactorStatus.alerta' };
            if (diff > 20) return { bar: 'bg-orange-500', border: 'border-orange-500/50', text: 'text-orange-400', label: 'hmi.reactorStatus.estable' };
            return { bar: 'bg-green-500', border: 'border-green-500/50', text: 'text-green-400', label: 'hmi.reactorStatus.estable' };
        case 'Arrancando':
            return { bar: 'bg-yellow-500', border: 'border-yellow-500/50', text: 'text-yellow-400', label: 'hmi.reactorStatus.arrancando' };
        case 'Alerta':
            return { bar: 'bg-red-500', border: 'border-red-500/50', text: 'text-red-400', label: 'hmi.reactorStatus.alerta' };
        case 'Enfriando':
            return { bar: 'bg-cyan-500', border: 'border-cyan-500/50', text: 'text-cyan-400', label: 'hmi.reactorStatus.enfriando' };
        case 'Inactivo':
        default:
            return { bar: 'bg-slate-600', border: 'border-slate-600/50', text: 'text-slate-400', label: 'hmi.reactorStatus.inactivo' };
    }
};

const ThermalView: React.FC<{ reactor: ReactorState, heatingTime?: number, coolingTime?: number }> = ({ reactor, heatingTime, coolingTime }) => {
    const { bar, text } = getStatusInfo(reactor.status, reactor.temperature, reactor.targetTemp);
    const { t } = useTranslations();
    const barWidth = Math.min(100, (reactor.temperature / 600) * 100);
    const isP01 = reactor.id === 'P-01';

    return (
        <>
            <div className="flex justify-between items-start text-sm">
                <span className="font-bold text-slate-300">{reactor.id}</span>
                <div className="text-right">
                    <p className={`font-semibold ${text}`}>{reactor.feedstock}</p>
                    <p className="text-xs text-slate-500">{reactor.feedstockType}</p>
                </div>
            </div>
            <div className="text-center my-4">
                <p className="text-5xl lg:text-6xl font-mono font-bold tracking-tight text-white">{reactor.temperature.toFixed(1)}<span className="text-3xl lg:text-4xl text-slate-400 align-top">°C</span></p>
            </div>
            {isP01 && (
                <div className="text-xs text-center mb-4 space-y-1">
                    {(reactor.status === 'Arrancando' || reactor.status === 'Estable') && heatingTime !== undefined && (
                        <p className="text-amber-400">{t('view.hyperion.heating')}: {formatTime(heatingTime)}</p>
                    )}
                    {reactor.status === 'Enfriando' && coolingTime !== undefined && (
                        <p className="text-cyan-400">{t('view.hyperion.cooling')}: {formatTime(coolingTime)}</p>
                    )}
                     <p className="text-slate-500">{t('view.hyperion.lastMaintenance')}: 15/07/2024</p>
                </div>
            )}
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-auto">
                <div className={`${bar} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${barWidth}%` }}></div>
            </div>
        </>
    );
};

const ProductionView: React.FC<{ reactor: ReactorState }> = ({ reactor }) => {
    const { t } = useTranslations();
    return (
        <>
            <div className="flex justify-between items-start text-sm">
                <span className="font-bold text-slate-300">{reactor.id}</span>
                <span className="font-semibold text-cyan-400">{t('view.hyperion.productionStatus')}</span>
            </div>
            <div className="text-center my-auto space-y-3 py-2">
                <div>
                    <p className="text-xs text-slate-400">{t('view.hyperion.feedRate')}</p>
                    <p className="text-2xl font-mono font-bold text-white">{reactor.feedRate.toFixed(1)} <span className="text-lg">kg/h</span></p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">{t('view.hyperion.bioOilProd')}</p>
                    <p className="text-2xl font-mono font-bold text-white">{reactor.bioOilOutput.toFixed(1)} <span className="text-lg">kg/h</span></p>
                </div>
            </div>
            <div className="mt-auto pt-2 border-t border-slate-700 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between"><span>{t('view.hyperion.pelletPurity')}:</span> <span className="font-mono">{reactor.pelletPurity.toFixed(2)}%</span></div>
                <div className="flex justify-between"><span>{t('view.hyperion.moisture')}:</span> <span className="font-mono">{reactor.pelletMoisture.toFixed(2)}%</span></div>
                <div className="flex justify-between font-semibold"><span>{t('view.hyperion.efficiencyFactor')}:</span> <span className="font-mono">{(reactor.efficiencyFactor * 100).toFixed(1)}%</span></div>
            </div>
        </>
    );
};

const SecurityView: React.FC<{ reactor: ReactorState }> = ({ reactor }) => {
    const isArmed = reactor.emergencyStop === 'ARMADO';
    const { t } = useTranslations();
    return (
        <>
            <div className="flex justify-between items-start text-sm">
                <span className="font-bold text-slate-300">{reactor.id}</span>
                <span className="font-semibold text-red-400">{t('view.hyperion.securityStatus')}</span>
            </div>
            <div className="text-center my-auto space-y-4 py-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{t('view.hyperion.emergencyStop')}</p>
                    <p className={`text-4xl font-bold ${isArmed ? 'text-green-400' : 'text-red-400'}`}>{reactor.emergencyStop}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase">{t('view.hyperion.o2Detector')}</p>
                        <p className="text-2xl font-mono font-bold text-white">{reactor.o2Level.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase">{t('view.hyperion.pressure')}</p>
                        <p className="text-2xl font-mono font-bold text-white">{reactor.pressure.toFixed(2)} bar</p>
                    </div>
                </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-auto">
                <div className={`h-2.5 rounded-full ${isArmed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '100%' }}></div>
            </div>
        </>
    );
};

interface ReactorCardProps {
    reactor: ReactorState;
    onClick: () => void;
    viewType: OrionViewType;
    isIndividualMode: boolean;
    onViewChange: (reactorId: string, view: OrionViewType) => void;
    heatingTime?: number;
    coolingTime?: number;
}

const ReactorCard: React.FC<ReactorCardProps> = ({ reactor, onClick, viewType, isIndividualMode, onViewChange, heatingTime, coolingTime }) => {
    const { border, label: statusLabelKey } = getStatusInfo(reactor.status, reactor.temperature, reactor.targetTemp);
    const { t } = useTranslations();
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onViewChange(reactor.id, e.target.value as OrionViewType);
    };

    const renderView = () => {
        switch (viewType) {
            case 'production': return <ProductionView reactor={reactor} />;
            case 'security': return <SecurityView reactor={reactor} />;
            case 'thermal':
            default: return <ThermalView reactor={reactor} heatingTime={heatingTime} coolingTime={coolingTime} />;
        }
    };

    return (
        <div className={`group relative bg-slate-800/50 backdrop-blur-sm border-2 ${border} rounded-lg flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transform`}>
            <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white ${getStatusInfo(reactor.status, 0, 0).bar}`}>{t(statusLabelKey)}</div>
            {isIndividualMode && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                        value={viewType}
                        onChange={handleSelectChange}
                        onClick={e => e.stopPropagation()}
                        className="bg-slate-900/80 border border-slate-600 text-white text-xs rounded-md p-1 focus:ring-0 focus:border-cyan-500"
                    >
                        {ORION_VIEWS.map(v => <option key={v.id} value={v.id}>{t(v.name)}</option>)}
                    </select>
                </div>
            )}
            <button onClick={onClick} className="w-full h-full text-left p-6 flex flex-col justify-between">
                {renderView()}
            </button>
        </div>
    );
};


interface Hyperion9Props {
    reactors: ReactorState[];
    navigateToHmi: (initialTab?: string) => void;
    heatingSeconds: number;
    coolingSeconds: number;
    phoenixSiloLevel: number;
}

export const Hyperion9: React.FC<Hyperion9Props> = ({ reactors, navigateToHmi, heatingSeconds, coolingSeconds, phoenixSiloLevel }) => {
    const { t } = useTranslations();
    const [viewMode, setViewMode] = useState<'synchronized' | 'individual'>('synchronized');
    const [fleetView, setFleetView] = useState<OrionViewType>('production');
    const [individualViews, setIndividualViews] = useState<Record<string, OrionViewType>>(() => {
        const initial: Record<string, OrionViewType> = {};
        reactors.forEach(r => { initial[r.id] = 'production'; });
        return initial;
    });

    const handleIndividualViewChange = (reactorId: string, view: OrionViewType) => {
        setIndividualViews(prev => ({ ...prev, [reactorId]: view }));
    };

    useEffect(() => {
        if (viewMode === 'synchronized') {
            const updatedViews: Record<string, OrionViewType> = {};
            reactors.forEach(r => {
                updatedViews[r.id] = fleetView;
            });
            setIndividualViews(updatedViews);
        }
    }, [fleetView, viewMode, reactors]);

    const siloCapacity = 10000; // kg
    const siloPercentage = (phoenixSiloLevel / siloCapacity) * 100;

    return (
        <div className="bg-slate-900 text-white min-h-full p-8 font-sans">
            <header className="text-center mb-8 relative">
                <h1 className="text-4xl font-bold">{t('view.hyperion.title')}</h1>
                <h2 className="text-xl font-semibold text-cyan-400">{t('view.hyperion.subtitle')}</h2>
            </header>

            <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                <h3 className="text-lg font-bold">{t('view.hyperion.sharedInventory')}</h3>
                <div className="flex items-center gap-4 w-1/2">
                    <div className="w-full bg-slate-700 rounded-full h-4 flex-grow">
                        <div className="bg-yellow-600 h-4 rounded-full" style={{ width: `${siloPercentage}%` }}></div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-mono font-bold">{phoenixSiloLevel.toFixed(1)} kg</p>
                        <p className="text-xs text-slate-400">{t('view.hyperion.pelletSiloLevel')}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <label htmlFor="fleet-view-selector" className="font-semibold text-slate-300">{t('view.hyperion.fleetView')}</label>
                    <select id="fleet-view-selector"
                        value={fleetView}
                        onChange={e => setFleetView(e.target.value as OrionViewType)}
                        disabled={viewMode === 'individual'}
                        className="bg-slate-700 border border-slate-600 text-white rounded-md p-2 disabled:opacity-50 transition-opacity"
                    >
                        {ORION_VIEWS.map(v => <option key={v.id} value={v.id}>{t(v.name)}</option>)}
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-300">{t('view.hyperion.mode')}</span>
                    <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-md">
                        <button onClick={() => setViewMode('synchronized')} className={`px-3 py-1 text-sm rounded ${viewMode === 'synchronized' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('view.hyperion.synchronized')}</button>
                        <button onClick={() => setViewMode('individual')} className={`px-3 py-1 text-sm rounded ${viewMode === 'individual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{t('view.hyperion.individual')}</button>
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reactors.map(reactor => {
                    const viewType = individualViews[reactor.id] || 'production';
                    return (
                        <ReactorCard 
                            key={reactor.id} 
                            reactor={reactor}
                            viewType={viewType}
                            isIndividualMode={viewMode === 'individual'}
                            onViewChange={handleIndividualViewChange}
                            onClick={
                                reactor.id === 'P-01' 
                                    ? () => navigateToHmi('controlPanel') 
                                    : () => alert('El HMI para este reactor no está disponible en esta demostración.')
                            }
                            heatingTime={reactor.id === 'P-01' ? heatingSeconds : undefined}
                            coolingTime={reactor.id === 'P-01' ? coolingSeconds : undefined}
                        />
                    );
                })}
            </section>
        </div>
    );
};
