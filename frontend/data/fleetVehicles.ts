import type { FleetVehicleOption } from '../types';

export const FLEET_VEHICLES: FleetVehicleOption[] = [
    // Eléctricos
    { 
        tech: 'Eléctrico', manufacturer: 'BYD', model: 'T8', country: 'Brasil',
        consumptionRate_percent_h: 20, chargeRate_percent_h: 33, fuelCapacity_m3_or_kwh: 150 // ~3 horas de recarga
    },
    { 
        tech: 'Eléctrico', manufacturer: 'Econovo', model: 'Tron-e', country: 'Argentina',
        consumptionRate_percent_h: 22, chargeRate_percent_h: 20, fuelCapacity_m3_or_kwh: 160 // ~5 horas de recarga
    },
    { 
        tech: 'Eléctrico', manufacturer: 'Maxus', model: 'eDeliver 9', country: 'Chile',
        consumptionRate_percent_h: 25, chargeRate_percent_h: 25, fuelCapacity_m3_or_kwh: 120 // ~4 horas de recarga
    },
    { 
        tech: 'Eléctrico', manufacturer: 'Cemsa y Auteco', model: 'Stark E-Truck', country: 'México',
        consumptionRate_percent_h: 23, chargeRate_percent_h: 17, fuelCapacity_m3_or_kwh: 140 // ~6 horas de recarga
    },
    
    // Gas Natural/Biogás
    { 
        tech: 'Gas Natural/Biogás', manufacturer: 'Scania', model: 'P 280 GNC', 
        consumptionRate_m3_h: 25, consumptionRate_percent_h: (25/120)*100, fuelCapacity_m3_or_kwh: 120, refuelRate_percent_h: 600 // 100% en 10 minutos
    },
    { 
        tech: 'Gas Natural/Biogás', manufacturer: 'Comlurb', model: 'GNC Custom', country: 'Brasil', 
        consumptionRate_m3_h: 30, consumptionRate_percent_h: (30/150)*100, fuelCapacity_m3_or_kwh: 150, refuelRate_percent_h: 400 // 100% en 15 minutos
    },

    // Híbrido
    { 
        tech: 'Híbrido', manufacturer: 'Genérico', model: 'H-1',
        consumptionRate_m3_h: 15, consumptionRate_percent_h: (15/80)*100, fuelCapacity_m3_or_kwh: 80, refuelRate_percent_h: 1200 // Reposta gas en 5 minutos
    },
];