import React, { createContext, useState, useContext, PropsWithChildren, useEffect } from 'react';

export interface UtilityCostState {
  steamHpPrice: number; // €/tonelada
  steamMpPrice: number; // €/tonelada
  steamLpPrice: number; // €/tonelada
  refrigerationPriceKwhCooling: number; // €/kWh de ENFRIAMIENTO PROVISTO
  coolingWaterPriceM3: number; // €/m³
  compressedAirPriceKwh: number; // €/kWh de electricidad consumida
  firedHeatPriceMMBtu: number; // €/MMBtu
  gridElectricityPrice: number; // €/kWh
  biogasPrice_m3: number; // €/m³
}

// Valores por defecto basados en los ejemplos del documento
const defaultCosts: UtilityCostState = {
  steamHpPrice: 14.28, // 6.48 * 2.20462
  steamMpPrice: 12.06, // 5.47 * 2.20462
  steamLpPrice: 8.88,   // 4.03 * 2.20462
  refrigerationPriceKwhCooling: 0.0156, // 0.06 (elec cost) / 3.83 (COP real)
  coolingWaterPriceM3: 0.03, // Estimado
  compressedAirPriceKwh: 0.06, // Es el mismo que el de la red como base
  firedHeatPriceMMBtu: 3.20,
  gridElectricityPrice: 0.06,
  biogasPrice_m3: 0.5, // Precio estimado para biogás externo
};

interface UtilityCostContextType {
  costs: UtilityCostState;
  setCosts: (newCosts: Partial<UtilityCostState>) => void;
}

const UtilityCostContext = createContext<UtilityCostContextType | undefined>(undefined);

export const UtilityCostProvider = ({ children }: PropsWithChildren<{}>) => {
  const [costs, setCostsState] = useState<UtilityCostState>(() => {
    try {
      const savedCosts = localStorage.getItem('utilityCosts');
      return savedCosts ? JSON.parse(savedCosts) : defaultCosts;
    } catch (error) {
      console.warn("Could not access localStorage for utility costs. Using defaults.");
      return defaultCosts;
    }
  });

  const setCosts = (newCosts: Partial<UtilityCostState>) => {
    setCostsState(prev => {
      const updatedCosts = { ...prev, ...newCosts };
      try {
        localStorage.setItem('utilityCosts', JSON.stringify(updatedCosts));
      } catch (error) {
        console.warn("Could not save utility costs to localStorage.");
      }
      return updatedCosts;
    });
  };

  return (
    <UtilityCostContext.Provider value={{ costs, setCosts }}>
      {children}
    </UtilityCostContext.Provider>
  );
};

export const useUtilityCosts = () => {
  const context = useContext(UtilityCostContext);
  if (context === undefined) {
    throw new Error('useUtilityCosts must be used within a UtilityCostProvider');
  }
  return context;
};