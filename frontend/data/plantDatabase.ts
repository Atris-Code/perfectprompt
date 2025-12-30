import type { PyrolysisPlantData } from '../types';

export const PLANT_DATABASE: { plants: PyrolysisPlantData[] } = {
  "plants": [
    {
      "id": "EHP-100",
      "model_name": "ecoHORNET Pyrolysis 100",
      "capacity_kg_h": 100,
      "technology": "Pyrolysis",
      "input_feedstock": ["Biomass Pellets", "Agro-Pellets", "Sewage Sludge", "Plastics"],
      "performance": {
        "low_temp_pyrolysis": {
          "temperature_range_c": "150-450",
          "yield_biochar_percent": 35,
          "yield_pyro_oil_percent": 50,
          "yield_pyro_gas_percent": 15
        },
        "medium_temp_pyrolysis": {
          "temperature_range_c": "450-650",
          "yield_biochar_percent": 25,
          "yield_pyro_oil_percent": 30,
          "yield_pyro_gas_percent": 45
        },
        "high_temp_pyrolysis": {
          "temperature_range_c": "650-900",
          "yield_biochar_percent": 15,
          "yield_pyro_oil_percent": 15,
          "yield_pyro_gas_percent": 70
        }
      }
    },
    {
      "id": "EHP-500",
      "model_name": "ecoHORNET Pyrolysis 500",
      "capacity_kg_h": 500,
      "technology": "Pyrolysis",
      "input_feedstock": ["Biomass Pellets", "Agro-Pellets", "Sewage Sludge", "Plastics"],
      "performance": {
        "low_temp_pyrolysis": {
          "temperature_range_c": "150-450",
          "yield_biochar_percent": 35,
          "yield_pyro_oil_percent": 50,
          "yield_pyro_gas_percent": 15
        },
        "medium_temp_pyrolysis": {
          "temperature_range_c": "450-650",
          "yield_biochar_percent": 25,
          "yield_pyro_oil_percent": 30,
          "yield_pyro_gas_percent": 45
        },
        "high_temp_pyrolysis": {
          "temperature_range_c": "650-900",
          "yield_biochar_percent": 15,
          "yield_pyro_oil_percent": 15,
          "yield_pyro_gas_percent": 70
        }
      }
    },
    {
      "id": "EHP-1000",
      "model_name": "ecoHORNET Pyrolysis 1000",
      "capacity_kg_h": 1000,
      "technology": "Pyrolysis",
      "input_feedstock": ["Biomass Pellets", "Agro-Pellets", "Sewage Sludge", "Plastics"],
      "performance": {
        "low_temp_pyrolysis": {
          "temperature_range_c": "150-450",
          "yield_biochar_percent": 35,
          "yield_pyro_oil_percent": 50,
          "yield_pyro_gas_percent": 15
        },
        "medium_temp_pyrolysis": {
          "temperature_range_c": "450-650",
          "yield_biochar_percent": 25,
          "yield_pyro_oil_percent": 30,
          "yield_pyro_gas_percent": 45
        },
        "high_temp_pyrolysis": {
          "temperature_range_c": "650-900",
          "yield_biochar_percent": 15,
          "yield_pyro_oil_percent": 15,
          "yield_pyro_gas_percent": 70
        }
      }
    }
  ]
};