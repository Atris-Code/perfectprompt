import { PLANT_DATABASE } from '../data/plantDatabase';
import { CO_PRESETS } from '../data/coPresets';
import type { PyrolysisPlantData, CoPreset, FleetModule, FleetSimulationResult, FleetModuleStatus } from '../types';

// Digital Twin class - Simulates an individual P-01 module (based on EHP-500)
class PyrolysisModule {
    id: string;
    baseModel: PyrolysisPlantData;
    preset: CoPreset | null = null;
    status: FleetModuleStatus = 'Inactivo';

    constructor(id: string, baseModel: PyrolysisPlantData) {
        this.id = id;
        this.baseModel = baseModel;
    }

    applyPreset(preset: CoPreset) {
        this.preset = preset;
    }

    // This is the simplified simulation engine from Phase 1
    runSimulationCycle(): FleetModule['results'] {
        if (!this.preset) {
            this.status = 'Falla';
            return null;
        }

        this.status = 'Operando';
        const profileName = this.preset.targetTemp > 600 ? 'high_temp_pyrolysis'
                          : this.preset.targetTemp > 450 ? 'medium_temp_pyrolysis'
                          : 'low_temp_pyrolysis';
        
        const performanceProfile = this.baseModel.performance[profileName];
        
        // Simplified logic f(temperature, residence_time)
        // A more complex model would go here
        const bioOilYield = performanceProfile.yield_pyro_oil_percent * (this.preset.residenceTime < 5 ? 1.2 : 0.8);
        const biocharYield = performanceProfile.yield_biochar_percent * (this.preset.residenceTime > 1000 ? 1.1 : 0.9);
        const gasYield = 100 - bioOilYield - biocharYield;

        const capacity = this.baseModel.capacity_kg_h;

        return {
            bioOil: capacity * (bioOilYield / 100),
            biochar: capacity * (biocharYield / 100),
            gas: capacity * (gasYield / 100),
            energyConsumption: 7.8 + ((this.preset.targetTemp - 500) / 100), // Base consumption + temp factor
            temperature: this.preset.targetTemp,
            pressure: 1.1 + (this.preset.targetTemp / 1000), // Simplified pressure calculation
        };
    }
}

const SIMULATED_LATENCY = 1500; // ms

export async function runFleetSimulation(
    modulesConfig: Omit<FleetModule, 'status' | 'results'>[]
): Promise<{ updatedModules: FleetModule[], aggregatedResult: FleetSimulationResult }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const baseModel = PLANT_DATABASE.plants.find(p => p.id === 'EHP-500');
            if (!baseModel) {
                return reject(new Error("Modelo base de planta 'EHP-500' no encontrado en la base de datos."));
            }

            const updatedModules: FleetModule[] = [];
            const aggregatedResult: FleetSimulationResult = {
                totalBioOil_kg_h: 0,
                totalBiochar_kg_h: 0,
                totalGas_kg_h: 0,
                totalEnergy_kW: 0,
                generalStatus: 'Operando',
            };

            for (const moduleConfig of modulesConfig) {
                const preset = CO_PRESETS.find(p => p.name === moduleConfig.presetId);
                const moduleInstance = new PyrolysisModule(moduleConfig.id, baseModel);
                
                let results: FleetModule['results'] = null;
                
                if (preset) {
                    moduleInstance.applyPreset(preset);
                    results = moduleInstance.runSimulationCycle();
                } else {
                    moduleInstance.status = 'Falla';
                    aggregatedResult.generalStatus = 'Falla Parcial';
                }

                if (results) {
                    aggregatedResult.totalBioOil_kg_h += results.bioOil;
                    aggregatedResult.totalBiochar_kg_h += results.biochar;
                    aggregatedResult.totalGas_kg_h += results.gas;
                    aggregatedResult.totalEnergy_kW += results.energyConsumption;
                }

                updatedModules.push({
                    id: moduleConfig.id,
                    presetId: moduleConfig.presetId,
                    status: moduleInstance.status,
                    results: results,
                });
            }

            if(updatedModules.every(m => m.status === 'Falla')) {
                aggregatedResult.generalStatus = 'Falla Total';
            }

            resolve({ updatedModules, aggregatedResult });

        }, SIMULATED_LATENCY);
    });
}