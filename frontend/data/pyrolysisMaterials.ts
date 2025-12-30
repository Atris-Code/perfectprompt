import type { PyrolysisMaterial, SimulationEngine } from '../types';

export const PYROLYSIS_MATERIALS: PyrolysisMaterial[] = [
  {
    "id": 1,
    "fase": "Sólido",
    "nombre": "Pino (Madera Blanda)",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 42.5, "hemicelulosa": 26.0, "lignina": 28.5 },
      "analisisElemental": { "carbono": 50.8, "hidrogeno": 6.2, "oxigeno": 42.5, "nitrogeno": 0.1, "azufre": 0.02 },
      "analisisInmediato": { "humedad": 9.5, "cenizas": 0.5, "materiaVolatil": 82.0, "carbonoFijo": 17.5 },
      "poderCalorificoSuperior": 19.8,
      "propiedadesFisicas": { "densidad_kg_m3": 450 }
    }
  },
  {
    "id": 2,
    "fase": "Sólido",
    "nombre": "Roble (Madera Dura)",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 45.0, "hemicelulosa": 30.0, "lignina": 22.0 },
      "analisisElemental": { "carbono": 49.5, "hidrogeno": 6.0, "oxigeno": 44.0, "nitrogeno": 0.2, "azufre": 0.02 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 0.8, "materiaVolatil": 78.0, "carbonoFijo": 21.2 },
      "poderCalorificoSuperior": 19.2,
      "propiedadesFisicas": { "densidad_kg_m3": 720 }
    }
  },
  {
    "id": 3,
    "fase": "Sólido",
    "nombre": "Sarmientos de Vid",
    "categoria": "Agrícola Leñosa",
    "propiedades": {
      "composicion": { "celulosa": 35.0, "hemicelulosa": 25.0, "lignina": 20.0 },
      "analisisElemental": { "carbono": 47.5, "hidrogeno": 5.8, "oxigeno": 40.5, "nitrogeno": 0.8, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 12.0, "cenizas": 5.5, "materiaVolatil": 75.0, "carbonoFijo": 19.5 },
      "poderCalorificoSuperior": 18.5,
      "propiedadesFisicas": { "densidad_kg_m3": 350 }
    }
  },
  {
    "id": 4,
    "fase": "Sólido",
    "nombre": "Paja de Trigo",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 38.0, "hemicelulosa": 28.0, "lignina": 17.0 },
      "analisisElemental": { "carbono": 46.0, "hidrogeno": 5.5, "oxigeno": 42.0, "nitrogeno": 0.6, "azufre": 0.15 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 7.0, "materiaVolatil": 70.0, "carbonoFijo": 23.0 },
      "poderCalorificoSuperior": 17.5,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 5,
    "fase": "Sólido",
    "nombre": "Rastrojo de Maíz",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 39.0, "hemicelulosa": 26.0, "lignina": 18.0 },
      "analisisElemental": { "carbono": 45.5, "hidrogeno": 6.0, "oxigeno": 42.5, "nitrogeno": 0.9, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 6.5, "materiaVolatil": 74.0, "carbonoFijo": 19.5 },
      "poderCalorificoSuperior": 17.8,
      "propiedadesFisicas": { "densidad_kg_m3": 80 }
    }
  },
  {
    "id": 6,
    "fase": "Sólido",
    "nombre": "Cáscara de Arroz",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 35.0, "hemicelulosa": 25.0, "lignina": 20.0 },
      "analisisElemental": { "carbono": 40.0, "hidrogeno": 5.5, "oxigeno": 38.0, "nitrogeno": 0.5, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 17.0, "materiaVolatil": 65.0, "carbonoFijo": 18.0 },
      "poderCalorificoSuperior": 15.6,
      "propiedadesFisicas": { "densidad_kg_m3": 120 }
    }
  },
  {
    "id": 7,
    "fase": "Sólido",
    "nombre": "Orujo de Oliva",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 25.0, "hemicelulosa": 20.0, "lignina": 30.0 },
      "analisisElemental": { "carbono": 52.0, "hidrogeno": 6.5, "oxigeno": 38.0, "nitrogeno": 1.2, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 4.0, "materiaVolatil": 76.0, "carbonoFijo": 20.0 },
      "poderCalorificoSuperior": 20.5,
      "propiedadesFisicas": { "densidad_kg_m3": 550 }
    }
  },
  {
    "id": 8,
    "fase": "Sólido",
    "nombre": "Cáscara de Soja",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 20.0, "lignina": 15.0 },
      "analisisElemental": { "carbono": 44.0, "hidrogeno": 6.0, "oxigeno": 43.0, "nitrogeno": 1.5, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 6.0, "materiaVolatil": 72.0, "carbonoFijo": 22.0 },
      "poderCalorificoSuperior": 17.2,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 9,
    "fase": "Sólido",
    "nombre": "Miscanthus",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 44.0, "hemicelulosa": 24.0, "lignina": 22.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 5.8, "oxigeno": 44.5, "nitrogeno": 0.4, "azufre": 0.08 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 3.0, "materiaVolatil": 79.0, "carbonoFijo": 18.0 },
      "poderCalorificoSuperior": 18.0,
      "propiedadesFisicas": { "densidad_kg_m3": 150 }
    }
  },
  {
    "id": 10,
    "fase": "Sólido",
    "nombre": "Bagazo de Caña de Azúcar",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 27.0, "lignina": 23.0 },
      "analisisElemental": { "carbono": 47.0, "hidrogeno": 6.5, "oxigeno": 45.0, "nitrogeno": 0.3, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 2.5, "materiaVolatil": 80.0, "carbonoFijo": 17.5 },
      "poderCalorificoSuperior": 18.2,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 11,
    "fase": "Sólido",
    "nombre": "Mazorca de Maíz",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 45.0, "hemicelulosa": 35.0, "lignina": 15.0 },
      "analisisElemental": { "carbono": 46.5, "hidrogeno": 6.2, "oxigeno": 46.0, "nitrogeno": 0.5, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 1.5, "materiaVolatil": 81.0, "carbonoFijo": 17.5 },
      "poderCalorificoSuperior": 18.0,
      "propiedadesFisicas": { "densidad_kg_m3": 180 }
    }
  },
  {
    "id": 12,
    "fase": "Sólido",
    "nombre": "Cáscara de Coco",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 33.0, "hemicelulosa": 26.0, "lignina": 35.0 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 6.0, "oxigeno": 43.0, "nitrogeno": 0.4, "azufre": 0.06 },
      "analisisInmediato": { "humedad": 12.0, "cenizas": 1.0, "materiaVolatil": 75.0, "carbonoFijo": 24.0 },
      "poderCalorificoSuperior": 19.5,
      "propiedadesFisicas": { "densidad_kg_m3": 150 }
    }
  },
  {
    "id": 13,
    "fase": "Sólido",
    "nombre": "Paja de Cebada",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 34.0, "hemicelulosa": 24.0, "lignina": 15.0 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 5.8, "oxigeno": 41.0, "nitrogeno": 0.7, "azufre": 0.12 },
      "analisisInmediato": { "humedad": 8.5, "cenizas": 8.0, "materiaVolatil": 68.0, "carbonoFijo": 24.0 },
      "poderCalorificoSuperior": 17.0,
      "propiedadesFisicas": { "densidad_kg_m3": 90 }
    }
  },
  {
    "id": 14,
    "fase": "Sólido",
    "nombre": "Cáscara de Café",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 25.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 5.5, "oxigeno": 42.0, "nitrogeno": 2.0, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 4.5, "materiaVolatil": 73.0, "carbonoFijo": 22.5 },
      "poderCalorificoSuperior": 18.8,
      "propiedadesFisicas": { "densidad_kg_m3": 200 }
    }
  },
  {
    "id": 15,
    "fase": "Sólido",
    "nombre": "Cardo",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 32.0, "hemicelulosa": 21.0, "lignina": 16.0 },
      "analisisElemental": { "carbono": 44.0, "hidrogeno": 6.0, "oxigeno": 40.0, "nitrogeno": 1.1, "azufre": 0.15 },
      "analisisInmediato": { "humedad": 12.0, "cenizas": 9.0, "materiaVolatil": 70.0, "carbonoFijo": 21.0 },
      "poderCalorificoSuperior": 16.5,
      "propiedadesFisicas": { "densidad_kg_m3": 130 }
    }
  },
  {
    "id": 16,
    "fase": "Sólido",
    "nombre": "Eucalipto",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 50.0, "hemicelulosa": 20.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 51.0, "hidrogeno": 6.3, "oxigeno": 42.0, "nitrogeno": 0.1, "azufre": 0.03 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 0.7, "materiaVolatil": 80.0, "carbonoFijo": 19.3 },
      "poderCalorificoSuperior": 20.0,
      "propiedadesFisicas": { "densidad_kg_m3": 650 }
    }
  },
  {
    "id": 17,
    "fase": "Sólido",
    "nombre": "Serrín de Haya",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 43.0, "hemicelulosa": 32.0, "lignina": 21.0 },
      "analisisElemental": { "carbono": 49.0, "hidrogeno": 6.1, "oxigeno": 44.2, "nitrogeno": 0.2, "azufre": 0.01 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 0.6, "materiaVolatil": 83.0, "carbonoFijo": 16.4 },
      "poderCalorificoSuperior": 19.0,
      "propiedadesFisicas": { "densidad_kg_m3": 250 }
    }
  },
  {
    "id": 18,
    "fase": "Sólido",
    "nombre": "Hueso de Aceituna",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 26.0, "hemicelulosa": 24.0, "lignina": 40.0 },
      "analisisElemental": { "carbono": 53.0, "hidrogeno": 6.0, "oxigeno": 39.5, "nitrogeno": 1.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 1.5, "materiaVolatil": 78.0, "carbonoFijo": 20.5 },
      "poderCalorificoSuperior": 21.0,
      "propiedadesFisicas": { "densidad_kg_m3": 700 }
    }
  },
  {
    "id": 19,
    "fase": "Sólido",
    "nombre": "Cáscara de Almendra",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 29.0, "hemicelulosa": 26.0, "lignina": 35.0 },
      "analisisElemental": { "carbono": 49.0, "hidrogeno": 6.0, "oxigeno": 42.0, "nitrogeno": 1.5, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 2.5, "materiaVolatil": 74.0, "carbonoFijo": 23.5 },
      "poderCalorificoSuperior": 19.5,
      "propiedadesFisicas": { "densidad_kg_m3": 400 }
    }
  },
  {
    "id": 20,
    "fase": "Sólido",
    "nombre": "Paulownia",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 45.0, "hemicelulosa": 25.0, "lignina": 20.0 },
      "analisisElemental": { "carbono": 48.5, "hidrogeno": 6.2, "oxigeno": 44.5, "nitrogeno": 0.3, "azufre": 0.02 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 1.0, "materiaVolatil": 82.0, "carbonoFijo": 17.0 },
      "poderCalorificoSuperior": 18.9,
      "propiedadesFisicas": { "densidad_kg_m3": 280 }
    }
  },
  {
    "id": 21,
    "fase": "Sólido",
    "nombre": "Residuos de Poda de Cítricos",
    "categoria": "Agrícola Leñosa",
    "propiedades": {
      "composicion": { "celulosa": 38.0, "hemicelulosa": 22.0, "lignina": 24.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 5.9, "oxigeno": 43.0, "nitrogeno": 0.8, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 13.0, "cenizas": 3.5, "materiaVolatil": 77.0, "carbonoFijo": 19.5 },
      "poderCalorificoSuperior": 18.3,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 22,
    "fase": "Sólido",
    "nombre": "Paja de Arroz",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 36.0, "hemicelulosa": 24.0, "lignina": 18.0 },
      "analisisElemental": { "carbono": 41.0, "hidrogeno": 5.5, "oxigeno": 39.0, "nitrogeno": 0.6, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 15.0, "materiaVolatil": 66.0, "carbonoFijo": 19.0 },
      "poderCalorificoSuperior": 15.9,
      "propiedadesFisicas": { "densidad_kg_m3": 90 }
    }
  },
  {
    "id": 23,
    "fase": "Sólido",
    "nombre": "Cáscara de Girasol",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 27.0, "hemicelulosa": 26.0, "lignina": 30.0 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 6.1, "oxigeno": 41.0, "nitrogeno": 1.2, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 9.5, "cenizas": 3.0, "materiaVolatil": 75.0, "carbonoFijo": 22.0 },
      "poderCalorificoSuperior": 20.2,
      "propiedadesFisicas": { "densidad_kg_m3": 200 }
    }
  },
  {
    "id": 24,
    "fase": "Sólido",
    "nombre": "Cáñamo Industrial",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 44.0, "hemicelulosa": 25.0, "lignina": 22.0 },
      "analisisElemental": { "carbono": 47.5, "hidrogeno": 6.3, "oxigeno": 44.0, "nitrogeno": 0.9, "azufre": 0.08 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 3.5, "materiaVolatil": 78.0, "carbonoFijo": 18.5 },
      "poderCalorificoSuperior": 18.4,
      "propiedadesFisicas": { "densidad_kg_m3": 120 }
    }
  },
  {
    "id": 25,
    "fase": "Sólido",
    "nombre": "Abedul",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 42.0, "hemicelulosa": 33.0, "lignina": 20.0 },
      "analisisElemental": { "carbono": 48.8, "hidrogeno": 6.4, "oxigeno": 44.0, "nitrogeno": 0.2, "azufre": 0.01 },
      "analisisInmediato": { "humedad": 10.5, "cenizas": 0.5, "materiaVolatil": 81.0, "carbonoFijo": 18.5 },
      "poderCalorificoSuperior": 19.1,
      "propiedadesFisicas": { "densidad_kg_m3": 600 }
    }
  },
  {
    "id": 26,
    "fase": "Sólido",
    "nombre": "Serrín de Fresno",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 44.0, "hemicelulosa": 29.0, "lignina": 23.0 },
      "analisisElemental": { "carbono": 50.1, "hidrogeno": 6.0, "oxigeno": 43.1, "nitrogeno": 0.3, "azufre": 0.02 },
      "analisisInmediato": { "humedad": 8.5, "cenizas": 0.8, "materiaVolatil": 82.5, "carbonoFijo": 16.7 },
      "poderCalorificoSuperior": 19.3,
      "propiedadesFisicas": { "densidad_kg_m3": 270 }
    }
  },
  {
    "id": 27,
    "fase": "Sólido",
    "nombre": "Torta de Colza",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 15.0, "hemicelulosa": 18.0, "lignina": 12.0 },
      "analisisElemental": { "carbono": 49.5, "hidrogeno": 7.0, "oxigeno": 35.0, "nitrogeno": 6.0, "azufre": 0.5 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 7.0, "materiaVolatil": 70.0, "carbonoFijo": 23.0 },
      "poderCalorificoSuperior": 20.8,
      "propiedadesFisicas": { "densidad_kg_m3": 600 }
    }
  },
  {
    "id": 28,
    "fase": "Sólido",
    "nombre": "Cáscara de Pistacho",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 28.0, "hemicelulosa": 25.0, "lignina": 40.0 },
      "analisisElemental": { "carbono": 52.5, "hidrogeno": 6.5, "oxigeno": 39.0, "nitrogeno": 1.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 2.0, "materiaVolatil": 76.0, "carbonoFijo": 22.0 },
      "poderCalorificoSuperior": 20.5,
      "propiedadesFisicas": { "densidad_kg_m3": 380 }
    }
  },
  {
    "id": 29,
    "fase": "Sólido",
    "nombre": "Restos de Poda de Olivo",
    "categoria": "Agrícola Leñosa",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 25.0, "lignina": 28.0 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 6.0, "oxigeno": 42.5, "nitrogeno": 0.8, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 12.0, "cenizas": 1.5, "materiaVolatil": 79.0, "carbonoFijo": 19.5 },
      "poderCalorificoSuperior": 19.7,
      "propiedadesFisicas": { "densidad_kg_m3": 320 }
    }
  },
  {
    "id": 30,
    "fase": "Sólido",
    "nombre": "Sorgo Forrajero",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 35.0, "hemicelulosa": 26.0, "lignina": 15.0 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 6.2, "oxigeno": 43.0, "nitrogeno": 1.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 5.0, "materiaVolatil": 75.0, "carbonoFijo": 20.0 },
      "poderCalorificoSuperior": 17.6,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 31,
    "fase": "Sólido",
    "nombre": "Alperujo",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 22.0, "hemicelulosa": 18.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 54.0, "hidrogeno": 7.0, "oxigeno": 35.0, "nitrogeno": 1.5, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 50.0, "cenizas": 4.0, "materiaVolatil": 40.0, "carbonoFijo": 6.0 },
      "poderCalorificoSuperior": 21.5,
      "propiedadesFisicas": { "densidad_kg_m3": 600 }
    }
  },
  {
    "id": 32,
    "fase": "Sólido",
    "nombre": "Paja de Avena",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 37.0, "hemicelulosa": 27.0, "lignina": 18.0 },
      "analisisElemental": { "carbono": 45.5, "hidrogeno": 6.0, "oxigeno": 41.5, "nitrogeno": 0.8, "azufre": 0.15 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 7.5, "materiaVolatil": 71.0, "carbonoFijo": 21.5 },
      "poderCalorificoSuperior": 17.3,
      "propiedadesFisicas": { "densidad_kg_m3": 80 }
    }
  },
  {
    "id": 33,
    "fase": "Sólido",
    "nombre": "Chopo (Álamo)",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 48.0, "hemicelulosa": 24.0, "lignina": 21.0 },
      "analisisElemental": { "carbono": 49.5, "hidrogeno": 6.5, "oxigeno": 43.5, "nitrogeno": 0.2, "azufre": 0.02 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 0.8, "materiaVolatil": 83.0, "carbonoFijo": 16.2 },
      "poderCalorificoSuperior": 18.8,
      "propiedadesFisicas": { "densidad_kg_m3": 450 }
    }
  },
  {
    "id": 34,
    "fase": "Sólido",
    "nombre": "Cáscara de Nuez",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 25.0, "hemicelulosa": 22.0, "lignina": 50.0 },
      "analisisElemental": { "carbono": 52.0, "hidrogeno": 5.8, "oxigeno": 41.0, "nitrogeno": 0.5, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 1.2, "materiaVolatil": 75.0, "carbonoFijo": 23.8 },
      "poderCalorificoSuperior": 20.3,
      "propiedadesFisicas": { "densidad_kg_m3": 420 }
    }
  },
  {
    "id": 35,
    "fase": "Sólido",
    "nombre": "Kenaf",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 45.0, "hemicelulosa": 22.0, "lignina": 18.0 },
      "analisisElemental": { "carbono": 47.0, "hidrogeno": 6.1, "oxigeno": 44.0, "nitrogeno": 0.6, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 2.5, "materiaVolatil": 79.0, "carbonoFijo": 18.5 },
      "poderCalorificoSuperior": 18.1,
      "propiedadesFisicas": { "densidad_kg_m3": 110 }
    }
  },
  {
    "id": 36,
    "fase": "Sólido",
    "nombre": "Residuos de Algodón",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 50.0, "hemicelulosa": 18.0, "lignina": 20.0 },
      "analisisElemental": { "carbono": 46.0, "hidrogeno": 6.5, "oxigeno": 43.0, "nitrogeno": 1.2, "azufre": 0.15 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 5.0, "materiaVolatil": 76.0, "carbonoFijo": 19.0 },
      "poderCalorificoSuperior": 17.9,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 37,
    "fase": "Sólido",
    "nombre": "Hueso de Melocotón",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 28.0, "hemicelulosa": 28.0, "lignina": 42.0 },
      "analisisElemental": { "carbono": 51.0, "hidrogeno": 6.0, "oxigeno": 42.0, "nitrogeno": 0.5, "azufre": 0.05 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 1.0, "materiaVolatil": 77.0, "carbonoFijo": 22.0 },
      "poderCalorificoSuperior": 20.0,
      "propiedadesFisicas": { "densidad_kg_m3": 650 }
    }
  },
  {
    "id": 38,
    "fase": "Sólido",
    "nombre": "Hueso de Cereza",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 27.0, "hemicelulosa": 28.0, "lignina": 42.0 },
      "analisisElemental": { "carbono": 50.5, "hidrogeno": 6.2, "oxigeno": 42.5, "nitrogeno": 0.4, "azufre": 0.04 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 1.2, "materiaVolatil": 76.0, "carbonoFijo": 22.8 },
      "poderCalorificoSuperior": 19.8,
      "propiedadesFisicas": { "densidad_kg_m3": 630 }
    }
  },
  {
    "id": 39,
    "fase": "Sólido",
    "nombre": "Restos de Poda de Frutales",
    "categoria": "Agrícola Leñosa",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 28.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 49.0, "hidrogeno": 6.0, "oxigeno": 44.0, "nitrogeno": 0.5, "azufre": 0.03 },
      "analisisInmediato": { "humedad": 14.0, "cenizas": 2.0, "materiaVolatil": 78.0, "carbonoFijo": 20.0 },
      "poderCalorificoSuperior": 18.7,
      "propiedadesFisicas": { "densidad_kg_m3": 310 }
    }
  },
  {
    "id": 40,
    "fase": "Sólido",
    "nombre": "Serrín de Castaño",
    "categoria": "Forestal",
    "propiedades": {
      "composicion": { "celulosa": 42.0, "hemicelulosa": 28.0, "lignina": 26.0 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 6.1, "oxigeno": 43.5, "nitrogeno": 0.1, "azufre": 0.01 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 0.9, "materiaVolatil": 81.0, "carbonoFijo": 18.1 },
      "poderCalorificoSuperior": 19.4,
      "propiedadesFisicas": { "densidad_kg_m3": 260 }
    }
  },
  {
    "id": 41,
    "fase": "Sólido",
    "nombre": "Tallo de Girasol",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 30.0, "lignina": 18.0 },
      "analisisElemental": { "carbono": 46.0, "hidrogeno": 6.0, "oxigeno": 42.0, "nitrogeno": 1.2, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 6.0, "materiaVolatil": 72.0, "carbonoFijo": 22.0 },
      "poderCalorificoSuperior": 17.5,
      "propiedadesFisicas": { "densidad_kg_m3": 90 }
    }
  },
  {
    "id": 42,
    "fase": "Sólido",
    "nombre": "Switchgrass (Pasto Varilla)",
    "categoria": "Cultivos Energéticos",
    "propiedades": {
      "composicion": { "celulosa": 35.0, "hemicelulosa": 28.0, "lignina": 19.0 },
      "analisisElemental": { "carbono": 47.0, "hidrogeno": 6.0, "oxigeno": 45.0, "nitrogeno": 0.6, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 9.0, "cenizas": 5.0, "materiaVolatil": 77.0, "carbonoFijo": 18.0 },
      "poderCalorificoSuperior": 18.0,
      "propiedadesFisicas": { "densidad_kg_m3": 140 }
    }
  },
  {
    "id": 43,
    "fase": "Sólido",
    "nombre": "Bagazo de Cerveza",
    "categoria": "Residuos Agroindustriales",
    "propiedades": {
      "composicion": { "celulosa": 18.0, "hemicelulosa": 28.0, "lignina": 12.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 7.0, "oxigeno": 35.0, "nitrogeno": 4.5, "azufre": 0.5 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 4.0, "materiaVolatil": 75.0, "carbonoFijo": 21.0 },
      "poderCalorificoSuperior": 20.0,
      "propiedadesFisicas": { "densidad_kg_m3": 550 }
    }
  },
  {
    "id": 44,
    "fase": "Sólido",
    "nombre": "Paja de Lino",
    "categoria": "Agrícola Herbácea",
    "propiedades": {
      "composicion": { "celulosa": 45.0, "hemicelulosa": 20.0, "lignina": 22.0 },
      "analisisElemental": { "carbono": 46.5, "hidrogeno": 5.9, "oxigeno": 42.0, "nitrogeno": 0.8, "azufre": 0.15 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 6.0, "materiaVolatil": 73.0, "carbonoFijo": 21.0 },
      "poderCalorificoSuperior": 17.8,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 45,
    "fase": "Sólido",
    "nombre": "Hojas de Olivo",
    "categoria": "Agrícola Leñosa",
    "propiedades": {
      "composicion": { "celulosa": 20.0, "hemicelulosa": 18.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 6.5, "oxigeno": 40.0, "nitrogeno": 1.5, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 11.0, "cenizas": 8.0, "materiaVolatil": 68.0, "carbonoFijo": 24.0 },
      "poderCalorificoSuperior": 18.5,
      "propiedadesFisicas": { "densidad_kg_m3": 200 }
    }
  },
  {
    "id": 46,
    "fase": "Sólido",
    "nombre": "Fracción Orgánica de RSU (FORSU)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 30.0, "hemicelulosa": 15.0, "lignina": 5.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 6.0, "oxigeno": 38.0, "nitrogeno": 2.5, "azufre": 0.5 },
      "analisisInmediato": { "humedad": 60.0, "cenizas": 15.0, "materiaVolatil": 70.0, "carbonoFijo": 15.0 },
      "poderCalorificoSuperior": 18.0,
      "propiedadesFisicas": { "densidad_kg_m3": 400 }
    }
  },
  {
    "id": 47,
    "fase": "Sólido",
    "nombre": "Papel y Cartón Mixto",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 65.0, "hemicelulosa": 15.0, "lignina": 10.0 },
      "analisisElemental": { "carbono": 44.0, "hidrogeno": 6.0, "oxigeno": 48.0, "nitrogeno": 0.3, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 8.0, "cenizas": 8.0, "materiaVolatil": 80.0, "carbonoFijo": 12.0 },
      "poderCalorificoSuperior": 16.5,
      "propiedadesFisicas": { "densidad_kg_m3": 80 }
    }
  },
  {
    "id": 48,
    "fase": "Sólido",
    "nombre": "Madera Urbana Tratada",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 40.0, "hemicelulosa": 25.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 49.0, "hidrogeno": 6.0, "oxigeno": 43.0, "nitrogeno": 0.5, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 15.0, "cenizas": 4.0, "materiaVolatil": 78.0, "carbonoFijo": 18.0 },
      "poderCalorificoSuperior": 18.0,
      "propiedadesFisicas": { "densidad_kg_m3": 350 }
    }
  },
  {
    "id": 49,
    "fase": "Sólido",
    "nombre": "Residuos de Poda Urbana y Jardinería",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 30.0, "hemicelulosa": 20.0, "lignina": 15.0 },
      "analisisElemental": { "carbono": 46.0, "hidrogeno": 5.5, "oxigeno": 40.0, "nitrogeno": 1.0, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 40.0, "cenizas": 10.0, "materiaVolatil": 70.0, "carbonoFijo": 20.0 },
      "poderCalorificoSuperior": 17.5,
      "propiedadesFisicas": { "densidad_kg_m3": 250 }
    }
  },
  {
    "id": 50,
    "fase": "Sólido",
    "nombre": "Textiles de Algodón",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 85.0, "hemicelulosa": 5.0, "lignina": 1.0 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 6.5, "oxigeno": 47.0, "nitrogeno": 1.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 7.0, "cenizas": 3.0, "materiaVolatil": 85.0, "carbonoFijo": 12.0 },
      "poderCalorificoSuperior": 17.0,
      "propiedadesFisicas": { "densidad_kg_m3": 100 }
    }
  },
  {
    "id": 51,
    "fase": "Sólido",
    "nombre": "Lodos de Depuradora (Secos)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 5.0, "hemicelulosa": 3.0, "lignina": 4.0 },
      "analisisElemental": { "carbono": 35.0, "hidrogeno": 5.0, "oxigeno": 25.0, "nitrogeno": 5.0, "azufre": 1.5 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 35.0, "materiaVolatil": 55.0, "carbonoFijo": 10.0 },
      "poderCalorificoSuperior": 15.0,
      "propiedadesFisicas": { "densidad_kg_m3": 700 }
    }
  },
  {
    "id": 52,
    "fase": "Sólido",
    "nombre": "Plásticos Mixtos (PE/PP/PS)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 85.0, "hidrogeno": 14.0, "oxigeno": 0.5, "nitrogeno": 0.2, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 1.0, "cenizas": 5.0, "materiaVolatil": 94.0, "carbonoFijo": 1.0 },
      "poderCalorificoSuperior": 42.0,
      "propiedadesFisicas": { "densidad_kg_m3": 150 }
    }
  },
  {
    "id": 53,
    "fase": "Sólido",
    "nombre": "Neumáticos Fuera de Uso (NFU)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 80.0, "hidrogeno": 7.0, "oxigeno": 2.0, "nitrogeno": 0.5, "azufre": 2.0 },
      "analisisInmediato": { "humedad": 1.5, "cenizas": 10.0, "materiaVolatil": 60.0, "carbonoFijo": 30.0 },
      "poderCalorificoSuperior": 35.0,
      "propiedadesFisicas": { "densidad_kg_m3": 400 }
    }
  },
  {
    "id": 54,
    "fase": "Sólido",
    "nombre": "Rechazo de Planta de Triaje",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 15.0, "hemicelulosa": 10.0, "lignina": 5.0 },
      "analisisElemental": { "carbono": 55.0, "hidrogeno": 7.0, "oxigeno": 20.0, "nitrogeno": 1.0, "azufre": 0.5 },
      "analisisInmediato": { "humedad": 25.0, "cenizas": 20.0, "materiaVolatil": 65.0, "carbonoFijo": 15.0 },
      "poderCalorificoSuperior": 22.0,
      "propiedadesFisicas": { "densidad_kg_m3": 200 }
    }
  },
  {
    "id": 55,
    "fase": "Sólido",
    "nombre": "PET (Polietileno tereftalato)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 62.5, "hidrogeno": 4.2, "oxigeno": 33.3, "nitrogeno": 0.0, "azufre": 0.0 },
      "analisisInmediato": { "humedad": 1.0, "cenizas": 0.5, "materiaVolatil": 88.0, "carbonoFijo": 11.5 },
      "poderCalorificoSuperior": 22.5,
      "propiedadesFisicas": { "densidad_kg_m3": 350 }
    }
  },
  {
    "id": 56,
    "fase": "Sólido",
    "nombre": "HDPE (Polietileno de alta densidad)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 85.6, "hidrogeno": 14.4, "oxigeno": 0.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "analisisInmediato": { "humedad": 0.5, "cenizas": 1.0, "materiaVolatil": 98.0, "carbonoFijo": 1.5 },
      "poderCalorificoSuperior": 46.0,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 57,
    "fase": "Sólido",
    "nombre": "PVC (Policloruro de vinilo)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 38.4, "hidrogeno": 4.8, "oxigeno": 0.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "analisisInmediato": { "humedad": 1.0, "cenizas": 2.0, "materiaVolatil": 85.0, "carbonoFijo": 13.0 },
      "poderCalorificoSuperior": 19.0,
      "propiedadesFisicas": { "densidad_kg_m3": 400 }
    }
  },
  {
    "id": 58,
    "fase": "Sólido",
    "nombre": "Envases tipo Tetra Brik",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 50.0, "hemicelulosa": 10.0, "lignina": 5.0 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 7.0, "oxigeno": 35.0, "nitrogeno": 0.1, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 5.0, "cenizas": 10.0, "materiaVolatil": 80.0, "carbonoFijo": 10.0 },
      "poderCalorificoSuperior": 25.0,
      "propiedadesFisicas": { "densidad_kg_m3": 270 }
    }
  },
  {
    "id": 59,
    "fase": "Sólido",
    "nombre": "Pañales y Productos Sanitarios",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 30.0, "hemicelulosa": 5.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 40.0, "hidrogeno": 6.0, "oxigeno": 30.0, "nitrogeno": 1.0, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 50.0, "cenizas": 15.0, "materiaVolatil": 70.0, "carbonoFijo": 15.0 },
      "poderCalorificoSuperior": 16.0,
      "propiedadesFisicas": { "densidad_kg_m3": 150 }
    }
  },
  {
    "id": 60,
    "fase": "Sólido",
    "nombre": "Residuos de Cuero y Calzado",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 55.0, "hidrogeno": 7.0, "oxigeno": 20.0, "nitrogeno": 10.0, "azufre": 1.0 },
      "analisisInmediato": { "humedad": 10.0, "cenizas": 8.0, "materiaVolatil": 65.0, "carbonoFijo": 27.0 },
      "poderCalorificoSuperior": 21.0,
      "propiedadesFisicas": { "densidad_kg_m3": 250 }
    }
  },
  {
    "id": 61,
    "fase": "Sólido",
    "nombre": "Plásticos de RAEE",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 75.0, "hidrogeno": 8.0, "oxigeno": 8.0, "nitrogeno": 4.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 1.0, "cenizas": 10.0, "materiaVolatil": 85.0, "carbonoFijo": 5.0 },
      "poderCalorificoSuperior": 32.0,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 62,
    "fase": "Sólido",
    "nombre": "Posos de Café",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 15.0, "hemicelulosa": 30.0, "lignina": 25.0 },
      "analisisElemental": { "carbono": 52.0, "hidrogeno": 7.0, "oxigeno": 35.0, "nitrogeno": 2.5, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 50.0, "cenizas": 2.0, "materiaVolatil": 85.0, "carbonoFijo": 13.0 },
      "poderCalorificoSuperior": 23.0,
      "propiedadesFisicas": { "densidad_kg_m3": 500 }
    }
  },
  {
    "id": 63,
    "fase": "Sólido",
    "nombre": "Fracción Fina de RSU (<20 mm)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 10.0, "hemicelulosa": 5.0, "lignina": 2.0 },
      "analisisElemental": { "carbono": 25.0, "hidrogeno": 3.0, "oxigeno": 20.0, "nitrogeno": 1.0, "azufre": 0.3 },
      "analisisInmediato": { "humedad": 30.0, "cenizas": 50.0, "materiaVolatil": 40.0, "carbonoFijo": 10.0 },
      "poderCalorificoSuperior": 8.0,
      "propiedadesFisicas": { "densidad_kg_m3": 600 }
    }
  },
  {
    "id": 64,
    "fase": "Sólido",
    "nombre": "Poliestireno Expandido (EPS)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 91.5, "hidrogeno": 8.5, "oxigeno": 0.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "analisisInmediato": { "humedad": 1.5, "cenizas": 0.5, "materiaVolatil": 98.0, "carbonoFijo": 1.5 },
      "poderCalorificoSuperior": 40.0,
      "propiedadesFisicas": { "densidad_kg_m3": 20 }
    }
  },
  {
    "id": 65,
    "fase": "Sólido",
    "nombre": "Textiles Sintéticos (Poliéster/Nylon)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 65.0, "hidrogeno": 6.0, "oxigeno": 20.0, "nitrogeno": 8.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 4.0, "cenizas": 4.0, "materiaVolatil": 80.0, "carbonoFijo": 16.0 },
      "poderCalorificoSuperior": 28.0,
      "propiedadesFisicas": { "densidad_kg_m3": 150 }
    }
  },
  {
    "id": 66,
    "fase": "Sólido",
    "nombre": "Aceite de Cocina Usado",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 77.0, "hidrogeno": 12.0, "oxigeno": 11.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "analisisInmediato": { "humedad": 1.0, "cenizas": 0.5, "materiaVolatil": 98.0, "carbonoFijo": 1.5 },
      "poderCalorificoSuperior": 39.5,
      "propiedadesFisicas": { "densidad_kg_m3": 900 }
    }
  },
  {
    "id": 67,
    "fase": "Sólido",
    "nombre": "Residuos de Barrido de Calles",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 5.0, "hemicelulosa": 5.0, "lignina": 10.0 },
      "analisisElemental": { "carbono": 15.0, "hidrogeno": 2.0, "oxigeno": 12.0, "nitrogeno": 0.5, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 20.0, "cenizas": 70.0, "materiaVolatil": 25.0, "carbonoFijo": 5.0 },
      "poderCalorificoSuperior": 6.0,
      "propiedadesFisicas": { "densidad_kg_m3": 800 }
    }
  },
  {
    "id": 68,
    "fase": "Sólido",
    "nombre": "Espuma de Poliuretano (Colchones)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 63.0, "hidrogeno": 7.0, "oxigeno": 22.0, "nitrogeno": 7.0, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 3.0, "cenizas": 2.0, "materiaVolatil": 90.0, "carbonoFijo": 8.0 },
      "poderCalorificoSuperior": 26.0,
      "propiedadesFisicas": { "densidad_kg_m3": 30 }
    }
  },
  {
    "id": 69,
    "fase": "Sólido",
    "nombre": "Goma y Caucho Mixto (no-NFU)",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 0.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 78.0, "hidrogeno": 8.0, "oxigeno": 3.0, "nitrogeno": 0.5, "azufre": 1.5 },
      "analisisInmediato": { "humedad": 2.0, "cenizas": 12.0, "materiaVolatil": 65.0, "carbonoFijo": 23.0 },
      "poderCalorificoSuperior": 31.0,
      "propiedadesFisicas": { "densidad_kg_m3": 350 }
    }
  },
  {
    "id": 70,
    "fase": "Sólido",
    "nombre": "Madera de Construcción y Demolición",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 38.0, "hemicelulosa": 22.0, "lignina": 24.0 },
      "analisisElemental": { "carbono": 48.0, "hidrogeno": 5.8, "oxigeno": 40.0, "nitrogeno": 0.3, "azufre": 0.1 },
      "analisisInmediato": { "humedad": 12.0, "cenizas": 8.0, "materiaVolatil": 75.0, "carbonoFijo": 17.0 },
      "poderCalorificoSuperior": 17.0,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 71,
    "fase": "Sólido",
    "nombre": "Alfombras y Moquetas Mixtas",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 5.0, "hemicelulosa": 0.0, "lignina": 0.0 },
      "analisisElemental": { "carbono": 70.0, "hidrogeno": 9.0, "oxigeno": 12.0, "nitrogeno": 4.0, "azufre": 0.2 },
      "analisisInmediato": { "humedad": 5.0, "cenizas": 15.0, "materiaVolatil": 70.0, "carbonoFijo": 15.0 },
      "poderCalorificoSuperior": 30.0,
      "propiedadesFisicas": { "densidad_kg_m3": 200 }
    }
  },
  {
    "id": 72,
    "fase": "Sólido",
    "nombre": "Residuos Verdes de Mercados",
    "categoria": "Residuos Sólidos Urbanos",
    "propiedades": {
      "composicion": { "celulosa": 25.0, "hemicelulosa": 15.0, "lignina": 8.0 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 6.0, "oxigeno": 40.0, "nitrogeno": 2.0, "azufre": 0.3 },
      "analisisInmediato": { "humedad": 85.0, "cenizas": 8.0, "materiaVolatil": 80.0, "carbonoFijo": 12.0 },
      "poderCalorificoSuperior": 18.5,
      "propiedadesFisicas": { "densidad_kg_m3": 300 }
    }
  },
  {
    "id": 73,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Pino",
    "categoria": "Bio-aceite de Biomasa Lignocelulósica",
    "origen_feedstock": "Pino (Madera Blanda)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1210, "viscosidad_cSt_a_50C": 60, "ph": 2.5 },
      "analisisElemental": { "carbono": 56.5, "hidrogeno": 6.3, "oxigeno": 37.0, "nitrogeno": 0.1, "azufre": 0.01 },
      "contenidoAgua_porcentaje": 25.0,
      "poderCalorificoSuperior_MJ_kg": 17.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 10.0, "aldehidos_cetonas": 15.0, "fenoles_derivados": 20.0, "azucares_anhidros": 7.0, "otros_compuestos_organicos": 23.0 }
    }
  },
  {
    "id": 74,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Roble",
    "categoria": "Bio-aceite de Biomasa Lignocelulósica",
    "origen_feedstock": "Roble (Madera Dura)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1230, "viscosidad_cSt_a_50C": 75, "ph": 2.4 },
      "analisisElemental": { "carbono": 58.0, "hidrogeno": 6.0, "oxigeno": 35.5, "nitrogeno": 0.2, "azufre": 0.01 },
      "contenidoAgua_porcentaje": 22.0,
      "poderCalorificoSuperior_MJ_kg": 18.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 9.0, "aldehidos_cetonas": 12.0, "fenoles_derivados": 25.0, "azucares_anhidros": 5.0, "otros_compuestos_organicos": 27.0 }
    }
  },
  {
    "id": 75,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Paja de Trigo",
    "categoria": "Bio-aceite de Biomasa Agrícola",
    "origen_feedstock": "Paja de Trigo",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1180, "viscosidad_cSt_a_50C": 45, "ph": 3.0 },
      "analisisElemental": { "carbono": 54.0, "hidrogeno": 6.8, "oxigeno": 38.0, "nitrogeno": 0.8, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 30.0,
      "poderCalorificoSuperior_MJ_kg": 16.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 12.0, "aldehidos_cetonas": 18.0, "fenoles_derivados": 15.0, "azucares_anhidros": 8.0, "otros_compuestos_organicos": 17.0 }
    }
  },
  {
    "id": 76,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Hueso de Aceituna",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Hueso de Aceituna",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1250, "viscosidad_cSt_a_50C": 120, "ph": 2.3 },
      "analisisElemental": { "carbono": 62.0, "hidrogeno": 5.5, "oxigeno": 31.0, "nitrogeno": 1.2, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 18.0,
      "poderCalorificoSuperior_MJ_kg": 21.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 8.0, "aldehidos_cetonas": 10.0, "fenoles_derivados": 35.0, "azucares_anhidros": 3.0, "otros_compuestos_organicos": 26.0 }
    }
  },
  {
    "id": 77,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Plásticos Mixtos",
    "categoria": "Aceite de Pirólisis de Plásticos",
    "origen_feedstock": "Plásticos Mixtos (PE/PP/PS)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 850, "viscosidad_cSt_a_50C": 10, "ph": 7.0 },
      "analisisElemental": { "carbono": 86.0, "hidrogeno": 13.5, "oxigeno": 0.1, "nitrogeno": 0.1, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 0.5,
      "poderCalorificoSuperior_MJ_kg": 42.5,
      "composicionHidrocarburos_porcentaje": { "alifaticos": 70.0, "aromaticos": 25.0, "otros": 5.0 }
    }
  },
  {
    "id": 78,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de PET",
    "categoria": "Aceite de Pirólisis de Plásticos",
    "origen_feedstock": "PET (Polietileno tereftalato)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1100, "viscosidad_cSt_a_50C": 30, "ph": 3.5 },
      "analisisElemental": { "carbono": 63.0, "hidrogeno": 4.5, "oxigeno": 32.5, "nitrogeno": 0.0, "azufre": 0.0 },
      "contenidoAgua_porcentaje": 1.0,
      "poderCalorificoSuperior_MJ_kg": 23.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 20.0, "aldehidos_cetonas": 5.0, "fenoles_derivados": 10.0, "derivados_tereftalato": 50.0, "otros_compuestos_organicos": 15.0 }
    }
  },
  {
    "id": 79,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Neumáticos (TPO)",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Neumáticos Fuera de Uso (NFU)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 940, "viscosidad_cSt_a_50C": 15, "ph": 6.5 },
      "analisisElemental": { "carbono": 85.0, "hidrogeno": 10.0, "oxigeno": 1.0, "nitrogeno": 0.5, "azufre": 1.8 },
      "contenidoAgua_porcentaje": 1.0,
      "poderCalorificoSuperior_MJ_kg": 40.0,
      "composicionHidrocarburos_porcentaje": { "alifaticos": 40.0, "aromaticos": 55.0, "otros": 5.0 }
    }
  },
  {
    "id": 80,
    "fase": "Líquido",
    "nombre": "Bio-aceite de FORSU",
    "categoria": "Bio-aceite de RSU",
    "origen_feedstock": "Fracción Orgánica de RSU (FORSU)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1150, "viscosidad_cSt_a_50C": 90, "ph": 3.2 },
      "analisisElemental": { "carbono": 50.0, "hidrogeno": 7.0, "oxigeno": 40.0, "nitrogeno": 2.0, "azufre": 0.4 },
      "contenidoAgua_porcentaje": 45.0,
      "poderCalorificoSuperior_MJ_kg": 14.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 15.0, "aldehidos_cetonas": 20.0, "fenoles_derivados": 8.0, "azucares_anhidros": 6.0, "otros_compuestos_organicos": 6.0 }
    }
  },
  {
    "id": 81,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Rechazo",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Rechazo de Planta de Triaje",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 980, "viscosidad_cSt_a_50C": 25, "ph": 5.0 },
      "analisisElemental": { "carbono": 75.0, "hidrogeno": 9.0, "oxigeno": 14.0, "nitrogeno": 0.8, "azufre": 0.3 },
      "contenidoAgua_porcentaje": 10.0,
      "poderCalorificoSuperior_MJ_kg": 30.0,
      "composicionQuimica_porcentaje": { "hidrocarburos_alifaticos": 30.0, "aromaticos": 25.0, "acidos_organicos": 5.0, "fenoles_derivados": 10.0, "otros_compuestos_organicos": 20.0 }
    }
  },
  {
    "id": 82,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Eucalipto",
    "categoria": "Bio-aceite de Biomasa Lignocelulósica",
    "origen_feedstock": "Eucalipto",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1240, "viscosidad_cSt_a_50C": 85, "ph": 2.4 },
      "analisisElemental": { "carbono": 59.0, "hidrogeno": 6.1, "oxigeno": 34.5, "nitrogeno": 0.1, "azufre": 0.02 },
      "contenidoAgua_porcentaje": 21.0,
      "poderCalorificoSuperior_MJ_kg": 19.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 8.0, "aldehidos_cetonas": 11.0, "fenoles_derivados": 28.0, "azucares_anhidros": 4.0, "otros_compuestos_organicos": 28.0 }
    }
  },
  {
    "id": 83,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Bagazo de Caña",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Bagazo de Caña de Azúcar",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1190, "viscosidad_cSt_a_50C": 50, "ph": 2.8 },
      "analisisElemental": { "carbono": 55.0, "hidrogeno": 6.5, "oxigeno": 38.0, "nitrogeno": 0.2, "azufre": 0.03 },
      "contenidoAgua_porcentaje": 28.0,
      "poderCalorificoSuperior_MJ_kg": 16.8,
      "composicionQuimica_porcentaje": { "acidos_organicos": 11.0, "aldehidos_cetonas": 16.0, "fenoles_derivados": 18.0, "azucares_anhidros": 9.0, "otros_compuestos_organicos": 18.0 }
    }
  },
  {
    "id": 84,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Cáscara de Arroz",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Cáscara de Arroz",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1170, "viscosidad_cSt_a_50C": 150, "ph": 3.1 },
      "analisisElemental": { "carbono": 52.0, "hidrogeno": 6.2, "oxigeno": 41.0, "nitrogeno": 0.4, "azufre": 0.05 },
      "contenidoAgua_porcentaje": 32.0,
      "poderCalorificoSuperior_MJ_kg": 15.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 10.0, "aldehidos_cetonas": 14.0, "fenoles_derivados": 22.0, "azucares_anhidros": 6.0, "otros_compuestos_organicos": 16.0 }
    }
  },
  {
    "id": 85,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de HDPE",
    "categoria": "Aceite de Pirólisis de Plásticos",
    "origen_feedstock": "HDPE (Polietileno de alta densidad)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 790, "viscosidad_cSt_a_50C": 4, "ph": 7.0 },
      "analisisElemental": { "carbono": 85.6, "hidrogeno": 14.4, "oxigeno": 0.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "contenidoAgua_porcentaje": 0.1,
      "poderCalorificoSuperior_MJ_kg": 46.2,
      "composicionHidrocarburos_porcentaje": { "alifaticos": 95.0, "aromaticos": 4.0, "otros": 1.0 }
    }
  },
  {
    "id": 86,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de PVC",
    "categoria": "Aceite de Pirólisis de Plásticos",
    "origen_feedstock": "PVC (Policloruro de vinilo)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1250, "viscosidad_cSt_a_50C": 200, "ph": 1.5 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 5.0, "oxigeno": 1.0, "nitrogeno": 0.0, "azufre": 0.0, "cloro_porcentaje": 15.0 },
      "contenidoAgua_porcentaje": 2.0,
      "poderCalorificoSuperior_MJ_kg": 18.0,
      "composicionQuimica_porcentaje": { "hidrocarburos_clorados": 40.0, "aromaticos": 30.0, "acidos_organicos": 5.0, "otros_compuestos_organicos": 25.0 }
    }
  },
  {
    "id": 87,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Papel y Cartón",
    "categoria": "Bio-aceite de RSU",
    "origen_feedstock": "Papel y Cartón Mixto",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1200, "viscosidad_cSt_a_50C": 70, "ph": 2.9 },
      "analisisElemental": { "carbono": 53.0, "hidrogeno": 6.5, "oxigeno": 40.0, "nitrogeno": 0.2, "azufre": 0.05 },
      "contenidoAgua_porcentaje": 29.0,
      "poderCalorificoSuperior_MJ_kg": 16.2,
      "composicionQuimica_porcentaje": { "acidos_organicos": 11.0, "aldehidos_cetonas": 17.0, "fenoles_derivados": 15.0, "azucares_anhidros": 12.0, "otros_compuestos_organicos": 16.0 }
    }
  },
  {
    "id": 88,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Lodos de Depuradora",
    "categoria": "Bio-aceite de RSU",
    "origen_feedstock": "Lodos de Depuradora (Secos)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1050, "viscosidad_cSt_a_50C": 250, "ph": 7.5 },
      "analisisElemental": { "carbono": 45.0, "hidrogeno": 6.0, "oxigeno": 25.0, "nitrogeno": 8.0, "azufre": 2.0 },
      "contenidoAgua_porcentaje": 40.0,
      "poderCalorificoSuperior_MJ_kg": 14.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 5.0, "compuestos_nitrogenados": 30.0, "fenoles_derivados": 10.0, "compuestos_azufrados": 5.0, "otros_compuestos_organicos": 10.0 }
    }
  },
  {
    "id": 89,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Textiles Sintéticos",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Textiles Sintéticos (Poliéster/Nylon)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1080, "viscosidad_cSt_a_50C": 40, "ph": 4.5 },
      "analisisElemental": { "carbono": 68.0, "hidrogeno": 6.5, "oxigeno": 16.0, "nitrogeno": 9.0, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 5.0,
      "poderCalorificoSuperior_MJ_kg": 27.0,
      "composicionQuimica_porcentaje": { "compuestos_nitrogenados": 25.0, "acidos_organicos": 15.0, "aromaticos": 20.0, "otros_compuestos_organicos": 40.0 }
    }
  },
  {
    "id": 90,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Orujo de Oliva",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Orujo de Oliva",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1220, "viscosidad_cSt_a_50C": 110, "ph": 2.5 },
      "analisisElemental": { "carbono": 65.0, "hidrogeno": 6.0, "oxigeno": 27.0, "nitrogeno": 1.5, "azufre": 0.2 },
      "contenidoAgua_porcentaje": 15.0,
      "poderCalorificoSuperior_MJ_kg": 23.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 7.0, "aldehidos_cetonas": 9.0, "fenoles_derivados": 40.0, "azucares_anhidros": 2.0, "otros_compuestos_organicos": 27.0 }
    }
  },
  {
    "id": 91,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Miscanthus",
    "categoria": "Bio-aceite de Cultivos Energéticos",
    "origen_feedstock": "Miscanthus",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1200, "viscosidad_cSt_a_50C": 65, "ph": 2.7 },
      "analisisElemental": { "carbono": 57.0, "hidrogeno": 6.2, "oxigeno": 36.3, "nitrogeno": 0.3, "azufre": 0.05 },
      "contenidoAgua_porcentaje": 24.0,
      "poderCalorificoSuperior_MJ_kg": 17.8,
      "composicionQuimica_porcentaje": { "acidos_organicos": 10.0, "aldehidos_cetonas": 15.0, "fenoles_derivados": 22.0, "azucares_anhidros": 7.0, "otros_compuestos_organicos": 22.0 }
    }
  },
  {
    "id": 92,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Cáscara de Coco",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Cáscara de Coco",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1260, "viscosidad_cSt_a_50C": 130, "ph": 2.6 },
      "analisisElemental": { "carbono": 63.0, "hidrogeno": 5.8, "oxigeno": 30.5, "nitrogeno": 0.3, "azufre": 0.04 },
      "contenidoAgua_porcentaje": 19.0,
      "poderCalorificoSuperior_MJ_kg": 22.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 6.0, "aldehidos_cetonas": 8.0, "fenoles_derivados": 45.0, "azucares_anhidros": 2.0, "otros_compuestos_organicos": 20.0 }
    }
  },
  {
    "id": 93,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Poliestireno (EPS)",
    "categoria": "Aceite de Pirólisis de Plásticos",
    "origen_feedstock": "Poliestireno Expandido (EPS)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1040, "viscosidad_cSt_a_50C": 20, "ph": 7.0 },
      "analisisElemental": { "carbono": 91.0, "hidrogeno": 8.8, "oxigeno": 0.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "contenidoAgua_porcentaje": 0.1,
      "poderCalorificoSuperior_MJ_kg": 41.6,
      "composicionHidrocarburos_porcentaje": { "alifaticos": 0, "aromaticos": 0, "otros": 0, "estireno_monomero": 60.0, "tolueno": 15.0, "etilbenceno": 10.0, "otros_aromaticos": 15.0 }
    }
  },
  {
    "id": 94,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Poliuretano",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Espuma de Poliuretano (Colchones)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1150, "viscosidad_cSt_a_50C": 300, "ph": 8.0 },
      "analisisElemental": { "carbono": 65.0, "hidrogeno": 7.2, "oxigeno": 18.0, "nitrogeno": 9.5, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 3.0,
      "poderCalorificoSuperior_MJ_kg": 28.0,
      "composicionQuimica_porcentaje": { "compuestos_nitrogenados": 40.0, "polioles": 20.0, "aromaticos": 25.0, "otros_compuestos_organicos": 15.0 }
    }
  },
  {
    "id": 95,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Sarmientos de Vid",
    "categoria": "Bio-aceite de Biomasa Agrícola",
    "origen_feedstock": "Sarmientos de Vid",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1190, "viscosidad_cSt_a_50C": 55, "ph": 2.9 },
      "analisisElemental": { "carbono": 56.0, "hidrogeno": 6.4, "oxigeno": 36.8, "nitrogeno": 0.5, "azufre": 0.08 },
      "contenidoAgua_porcentaje": 26.0,
      "poderCalorificoSuperior_MJ_kg": 17.2,
      "composicionQuimica_porcentaje": { "acidos_organicos": 11.0, "aldehidos_cetonas": 16.0, "fenoles_derivados": 19.0, "azucares_anhidros": 8.0, "otros_compuestos_organicos": 20.0 }
    }
  },
  {
    "id": 96,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Bagazo de Cerveza",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Bagazo de Cerveza",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1100, "viscosidad_cSt_a_50C": 180, "ph": 5.5 },
      "analisisElemental": { "carbono": 58.0, "hidrogeno": 7.5, "oxigeno": 28.0, "nitrogeno": 5.5, "azufre": 0.4 },
      "contenidoAgua_porcentaje": 20.0,
      "poderCalorificoSuperior_MJ_kg": 22.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 6.0, "compuestos_nitrogenados": 25.0, "fenoles_derivados": 15.0, "lipidos_derivados": 10.0, "otros_compuestos_organicos": 24.0 }
    }
  },
  {
    "id": 97,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Alperujo",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Alperujo",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1120, "viscosidad_cSt_a_50C": 400, "ph": 4.0 },
      "analisisElemental": { "carbono": 68.0, "hidrogeno": 7.8, "oxigeno": 22.0, "nitrogeno": 1.8, "azufre": 0.15 },
      "contenidoAgua_porcentaje": 35.0,
      "poderCalorificoSuperior_MJ_kg": 25.0,
      "composicionQuimica_porcentaje": { "acidos_grasos": 15.0, "acidos_organicos": 8.0, "fenoles_derivados": 30.0, "otros_compuestos_organicos": 12.0 }
    }
  },
  {
    "id": 98,
    "fase": "Líquido",
    "nombre": "Aceite de mejora de Aceite de Cocina Usado",
    "categoria": "Aceite de Pirólisis de Lípidos",
    "origen_feedstock": "Aceite de Cocina Usado",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 880, "viscosidad_cSt_a_50C": 8, "ph": 6.0 },
      "analisisElemental": { "carbono": 84.0, "hidrogeno": 14.0, "oxigeno": 2.0, "nitrogeno": 0.0, "azufre": 0.0 },
      "contenidoAgua_porcentaje": 0.8,
      "poderCalorificoSuperior_MJ_kg": 41.0,
      "composicionHidrocarburos_porcentaje": { "alifaticos": 85.0, "aromaticos": 10.0, "otros": 5.0 }
    }
  },
  {
    "id": 99,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Madera de Demolición",
    "categoria": "Bio-aceite de RSU",
    "origen_feedstock": "Madera de Construcción y Demolición",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1200, "viscosidad_cSt_a_50C": 80, "ph": 3.0 },
      "analisisElemental": { "carbono": 55.0, "hidrogeno": 6.0, "oxigeno": 38.0, "nitrogeno": 0.2, "azufre": 0.05 },
      "contenidoAgua_porcentaje": 25.0,
      "poderCalorificoSuperior_MJ_kg": 17.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 9.0, "aldehidos_cetonas": 13.0, "fenoles_derivados": 24.0, "azucares_anhidros": 6.0, "otros_compuestos_organicos": 23.0 }
    }
  },
  {
    "id": 100,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Residuos de Poda de Frutales",
    "categoria": "Bio-aceite de Biomasa Agrícola",
    "origen_feedstock": "Restos de Poda de Frutales",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1215, "viscosidad_cSt_a_50C": 70, "ph": 2.8 },
      "analisisElemental": { "carbono": 58.0, "hidrogeno": 6.2, "oxigeno": 35.2, "nitrogeno": 0.4, "azufre": 0.02 },
      "contenidoAgua_porcentaje": 23.0,
      "poderCalorificoSuperior_MJ_kg": 18.2,
      "composicionQuimica_porcentaje": { "acidos_organicos": 10.0, "aldehidos_cetonas": 14.0, "fenoles_derivados": 26.0, "azucares_anhidros": 5.0, "otros_compuestos_organicos": 22.0 }
    }
  },
  {
    "id": 101,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Torta de Colza",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Torta de Colza",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1120, "viscosidad_cSt_a_50C": 220, "ph": 6.0 },
      "analisisElemental": { "carbono": 62.0, "hidrogeno": 8.0, "oxigeno": 18.0, "nitrogeno": 8.0, "azufre": 0.8 },
      "contenidoAgua_porcentaje": 12.0,
      "poderCalorificoSuperior_MJ_kg": 26.0,
      "composicionQuimica_porcentaje": { "acidos_grasos": 10.0, "compuestos_nitrogenados": 35.0, "fenoles_derivados": 10.0, "otros_compuestos_organicos": 33.0 }
    }
  },
  {
    "id": 102,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Envases Tetra Brik",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Envases tipo Tetra Brik",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 990, "viscosidad_cSt_a_50C": 30, "ph": 4.0 },
      "analisisElemental": { "carbono": 70.0, "hidrogeno": 8.5, "oxigeno": 21.0, "nitrogeno": 0.1, "azufre": 0.05 },
      "contenidoAgua_porcentaje": 8.0,
      "poderCalorificoSuperior_MJ_kg": 32.0,
      "composicionQuimica_porcentaje": { "hidrocarburos_alifaticos": 35.0, "derivados_celulosa": 25.0, "fenoles_derivados": 15.0, "acidos_organicos": 5.0, "otros_compuestos_organicos": 20.0 }
    }
  },
  {
    "id": 103,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Cáscara de Nuez",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Cáscara de Nuez",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1280, "viscosidad_cSt_a_50C": 180, "ph": 2.3 },
      "analisisElemental": { "carbono": 66.0, "hidrogeno": 5.5, "oxigeno": 27.8, "nitrogeno": 0.4, "azufre": 0.03 },
      "contenidoAgua_porcentaje": 16.0,
      "poderCalorificoSuperior_MJ_kg": 24.5,
      "composicionQuimica_porcentaje": { "acidos_organicos": 5.0, "aldehidos_cetonas": 7.0, "fenoles_derivados": 55.0, "azucares_anhidros": 1.0, "otros_compuestos_organicos": 16.0 }
    }
  },
  {
    "id": 104,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Cáscara de Almendra",
    "categoria": "Bio-aceite de Biomasa Agroindustrial",
    "origen_feedstock": "Cáscara de Almendra",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1250, "viscosidad_cSt_a_50C": 150, "ph": 2.4 },
      "analisisElemental": { "carbono": 64.0, "hidrogeno": 5.7, "oxigeno": 29.0, "nitrogeno": 1.0, "azufre": 0.08 },
      "contenidoAgua_porcentaje": 18.0,
      "poderCalorificoSuperior_MJ_kg": 23.0,
      "composicionQuimica_porcentaje": { "acidos_organicos": 6.0, "aldehidos_cetonas": 8.0, "fenoles_derivados": 48.0, "azucares_anhidros": 2.0, "otros_compuestos_organicos": 18.0 }
    }
  },
  {
    "id": 105,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Posos de Café",
    "categoria": "Bio-aceite de RSU",
    "origen_feedstock": "Posos de Café",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1140, "viscosidad_cSt_a_50C": 250, "ph": 5.0 },
      "analisisElemental": { "carbono": 60.0, "hidrogeno": 7.5, "oxigeno": 28.0, "nitrogeno": 3.0, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 25.0,
      "poderCalorificoSuperior_MJ_kg": 24.0,
      "composicionQuimica_porcentaje": { "lipidos_derivados": 15.0, "compuestos_nitrogenados": 20.0, "fenoles_derivados": 25.0, "acidos_organicos": 8.0, "otros_compuestos_organicos": 7.0 }
    }
  },
  {
    "id": 106,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Pañales",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Pañales y Productos Sanitarios",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 970, "viscosidad_cSt_a_50C": 45, "ph": 5.5 },
      "analisisElemental": { "carbono": 65.0, "hidrogeno": 8.0, "oxigeno": 25.0, "nitrogeno": 0.5, "azufre": 0.1 },
      "contenidoAgua_porcentaje": 15.0,
      "poderCalorificoSuperior_MJ_kg": 28.5,
      "composicionQuimica_porcentaje": { "hidrocarburos_alifaticos": 20.0, "derivados_celulosa": 30.0, "acidos_organicos": 10.0, "otros_compuestos_organicos": 40.0 }
    }
  },
  {
    "id": 107,
    "fase": "Líquido",
    "nombre": "Aceite de Pirólisis de Cuero",
    "categoria": "Aceite de Pirólisis de RSU",
    "origen_feedstock": "Residuos de Cuero y Calzado",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1090, "viscosidad_cSt_a_50C": 350, "ph": 8.5 },
      "analisisElemental": { "carbono": 65.0, "hidrogeno": 7.0, "oxigeno": 12.0, "nitrogeno": 14.0, "azufre": 1.2 },
      "contenidoAgua_porcentaje": 8.0,
      "poderCalorificoSuperior_MJ_kg": 29.0,
      "composicionQuimica_porcentaje": { "compuestos_nitrogenados": 60.0, "aromaticos": 15.0, "acidos_grasos": 5.0, "otros_compuestos_organicos": 20.0 }
    }
  },
  {
    "id": 108,
    "fase": "Líquido",
    "nombre": "Bio-aceite de Chopo (Álamo)",
    "categoria": "Bio-aceite de Biomasa Lignocelulósica",
    "origen_feedstock": "Chopo (Álamo)",
    "propiedades": {
      "propiedadesFisicas": { "densidad_kg_m3": 1225, "viscosidad_cSt_a_50C": 75, "ph": 2.5 },
      "analisisElemental": { "carbono": 58.5, "hidrogeno": 6.4, "oxigeno": 34.8, "nitrogeno": 0.1, "azufre": 0.01 },
      "contenidoAgua_porcentaje": 22.0,
      "poderCalorificoSuperior_MJ_kg": 18.6,
      "composicionQuimica_porcentaje": { "acidos_organicos": 9.0, "aldehidos_cetonas": 12.0, "fenoles_derivados": 27.0, "azucares_anhidros": 5.0, "otros_compuestos_organicos": 25.0 }
    }
  },
  {
    "id": 109,
    "fase": "Gaseoso",
    "nombre": "Syngas de Pino",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Pino (Madera Blanda)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 25.0, "CO": 40.0, "CO2": 20.0, "CH4": 10.0, "C2_C4": 4.0, "N2": 1.0 },
      "poderCalorificoInferior_MJ_Nm3": 12.5,
      "relacion_H2_CO": 0.63,
      "contaminantes": { "alquitran_g_Nm3": 10, "azufre_ppm": 50 }
    }
  },
  {
    "id": 110,
    "fase": "Gaseoso",
    "nombre": "Syngas de Paja de Trigo",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Paja de Trigo",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 30.0, "CO": 35.0, "CO2": 22.0, "CH4": 8.0, "C2_C4": 3.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 11.0,
      "relacion_H2_CO": 0.86,
      "contaminantes": { "alquitran_g_Nm3": 15, "azufre_ppm": 150 }
    }
  },
  {
    "id": 111,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Plásticos Mixtos",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "Plásticos Mixtos (PE/PP/PS)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 15.0, "CO": 5.0, "CO2": 2.0, "CH4": 30.0, "C2_C4": 45.0, "N2": 3.0 },
      "poderCalorificoInferior_MJ_Nm3": 35.0,
      "relacion_H2_CO": 3.0,
      "contaminantes": { "alquitran_g_Nm3": 1, "azufre_ppm": 100 }
    }
  },
  {
    "id": 112,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Neumáticos",
    "categoria": "Gas de Pirólisis de RSU",
    "origen_feedstock": "Neumáticos Fuera de Uso (NFU)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 10.0, "CO2": 8.0, "CH4": 25.0, "C2_C4": 30.0, "N2": 7.0 },
      "poderCalorificoInferior_MJ_Nm3": 28.0,
      "relacion_H2_CO": 2.0,
      "contaminantes": { "alquitran_g_Nm3": 5, "azufre_ppm": 2000 }
    }
  },
  {
    "id": 113,
    "fase": "Gaseoso",
    "nombre": "Syngas de FORSU",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Fracción Orgánica de RSU (FORSU)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 25.0, "CO2": 40.0, "CH4": 12.0, "C2_C4": 1.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 8.5,
      "relacion_H2_CO": 0.8,
      "contaminantes": { "alquitran_g_Nm3": 25, "azufre_ppm": 500 }
    }
  },
  {
    "id": 114,
    "fase": "Gaseoso",
    "nombre": "Gas de Gasificación con Aire de Madera",
    "categoria": "Syngas de Biomasa (Pobre)",
    "origen_feedstock": "Pino (Madera Blanda)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 15.0, "CO": 20.0, "CO2": 15.0, "CH4": 3.0, "C2_C4": 1.0, "N2": 46.0 },
      "poderCalorificoInferior_MJ_Nm3": 5.5,
      "relacion_H2_CO": 0.75,
      "contaminantes": { "alquitran_g_Nm3": 12, "azufre_ppm": 50 }
    }
  },
  {
    "id": 115,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de HDPE",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "HDPE (Polietileno de alta densidad)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 10.0, "CO": 1.0, "CO2": 1.0, "CH4": 25.0, "C2_C4": 60.0, "N2": 3.0 },
      "poderCalorificoInferior_MJ_Nm3": 45.0,
      "relacion_H2_CO": 10.0,
      "contaminantes": { "alquitran_g_Nm3": 0.5, "azufre_ppm": 20 }
    }
  },
  {
    "id": 116,
    "fase": "Gaseoso",
    "nombre": "Syngas de Lodos de Depuradora",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Lodos de Depuradora (Secos)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 22.0, "CO": 18.0, "CO2": 30.0, "CH4": 15.0, "C2_C4": 2.0, "N2": 13.0 },
      "poderCalorificoInferior_MJ_Nm3": 9.0,
      "relacion_H2_CO": 1.22,
      "contaminantes": { "alquitran_g_Nm3": 30, "azufre_ppm": 3000 }
    }
  },
  {
    "id": 117,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de PVC",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "PVC (Policloruro de vinilo)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 10.0, "CO": 5.0, "CO2": 15.0, "CH4": 20.0, "C2_C4": 10.0, "N2": 5.0 },
      "poderCalorificoInferior_MJ_Nm3": 7.5,
      "relacion_H2_CO": 2.0,
      "contaminantes": { "alquitran_g_Nm3": 8, "azufre_ppm": 100, "HCI_ppm": 10000 }
    }
  },
  {
    "id": 118,
    "fase": "Gaseoso",
    "nombre": "Syngas de Roble",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Roble (Madera Dura)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 22.0, "CO": 42.0, "CO2": 18.0, "CH4": 12.0, "C2_C4": 5.0, "N2": 1.0 },
      "poderCalorificoInferior_MJ_Nm3": 13.5,
      "relacion_H2_CO": 0.52,
      "contaminantes": { "alquitran_g_Nm3": 8, "azufre_ppm": 40 }
    }
  },
  {
    "id": 119,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de PET",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "PET (Polietileno tereftalato)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 10.0, "CO": 35.0, "CO2": 45.0, "CH4": 5.0, "C2_C4": 3.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 7.0,
      "relacion_H2_CO": 0.29,
      "contaminantes": { "alquitran_g_Nm3": 3, "azufre_ppm": 30 }
    }
  },
  {
    "id": 120,
    "fase": "Gaseoso",
    "nombre": "Syngas de Hueso de Aceituna",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Hueso de Aceituna",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 45.0, "CO2": 15.0, "CH4": 13.0, "C2_C4": 6.0, "N2": 1.0 },
      "poderCalorificoInferior_MJ_Nm3": 15.0,
      "relacion_H2_CO": 0.44,
      "contaminantes": { "alquitran_g_Nm3": 7, "azufre_ppm": 120 }
    }
  },
  {
    "id": 121,
    "fase": "Gaseoso",
    "nombre": "Syngas de Miscanthus",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Miscanthus",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 28.0, "CO": 38.0, "CO2": 20.0, "CH4": 9.0, "C2_C4": 3.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 11.8,
      "relacion_H2_CO": 0.74,
      "contaminantes": { "alquitran_g_Nm3": 14, "azufre_ppm": 80 }
    }
  },
  {
    "id": 122,
    "fase": "Gaseoso",
    "nombre": "Syngas de Papel y Cartón",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Papel y Cartón Mixto",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 32.0, "CO": 40.0, "CO2": 18.0, "CH4": 6.0, "C2_C4": 2.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 10.5,
      "relacion_H2_CO": 0.8,
      "contaminantes": { "alquitran_g_Nm3": 18, "azufre_ppm": 100 }
    }
  },
  {
    "id": 123,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Textiles Sintéticos",
    "categoria": "Gas de Pirólisis de RSU",
    "origen_feedstock": "Textiles Sintéticos (Poliéster/Nylon)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 18.0, "CO": 25.0, "CO2": 20.0, "CH4": 15.0, "C2_C4": 5.0, "N2": 17.0 },
      "poderCalorificoInferior_MJ_Nm3": 14.0,
      "relacion_H2_CO": 0.72,
      "contaminantes": { "alquitran_g_Nm3": 6, "azufre_ppm": 150 }
    }
  },
  {
    "id": 124,
    "fase": "Gaseoso",
    "nombre": "Syngas de Bagazo de Cerveza",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Bagazo de Cerveza",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 30.0, "CO2": 25.0, "CH4": 15.0, "C2_C4": 2.0, "N2": 8.0 },
      "poderCalorificoInferior_MJ_Nm3": 11.5,
      "relacion_H2_CO": 0.67,
      "contaminantes": { "alquitran_g_Nm3": 20, "azufre_ppm": 800 }
    }
  },
  {
    "id": 125,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Poliestireno",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "Poliestireno Expandido (EPS)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 15.0, "CO": 2.0, "CO2": 3.0, "CH4": 35.0, "C2_C4": 40.0, "N2": 5.0 },
      "poderCalorificoInferior_MJ_Nm3": 38.0,
      "relacion_H2_CO": 7.5,
      "contaminantes": { "alquitran_g_Nm3": 2, "azufre_ppm": 40 }
    }
  },
  {
    "id": 126,
    "fase": "Gaseoso",
    "nombre": "Syngas de Cáscara de Arroz",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Cáscara de Arroz",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 35.0, "CO": 30.0, "CO2": 20.0, "CH4": 10.0, "C2_C4": 2.0, "N2": 3.0 },
      "poderCalorificoInferior_MJ_Nm3": 10.8,
      "relacion_H2_CO": 1.17,
      "contaminantes": { "alquitran_g_Nm3": 22, "azufre_ppm": 70 }
    }
  },
  {
    "id": 127,
    "fase": "Gaseoso",
    "nombre": "Syngas de Cáscara de Nuez",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Cáscara de Nuez",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 18.0, "CO": 48.0, "CO2": 14.0, "CH4": 14.0, "C2_C4": 5.0, "N2": 1.0 },
      "poderCalorificoInferior_MJ_Nm3": 16.0,
      "relacion_H2_CO": 0.38,
      "contaminantes": { "alquitran_g_Nm3": 6, "azufre_ppm": 60 }
    }
  },
  {
    "id": 128,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Poliuretano",
    "categoria": "Gas de Pirólisis de Plásticos",
    "origen_feedstock": "Espuma de Poliuretano (Colchones)",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 28.0, "CO2": 15.0, "CH4": 12.0, "C2_C4": 5.0, "N2": 20.0 },
      "poderCalorificoInferior_MJ_Nm3": 13.0,
      "relacion_H2_CO": 0.71,
      "contaminantes": { "alquitran_g_Nm3": 4, "azufre_ppm": 100 }
    }
  },
  {
    "id": 129,
    "fase": "Gaseoso",
    "nombre": "Syngas de Torta de Colza",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Torta de Colza",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 18.0, "CO": 25.0, "CO2": 22.0, "CH4": 18.0, "C2_C4": 4.0, "N2": 13.0 },
      "poderCalorificoInferior_MJ_Nm3": 12.8,
      "relacion_H2_CO": 0.72,
      "contaminantes": { "alquitran_g_Nm3": 15, "azufre_ppm": 1200 }
    }
  },
  {
    "id": 130,
    "fase": "Gaseoso",
    "nombre": "Syngas de Residuos de Poda Urbana",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Residuos de Poda Urbana y Jardinería",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 26.0, "CO": 36.0, "CO2": 23.0, "CH4": 10.0, "C2_C4": 3.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 11.2,
      "relacion_H2_CO": 0.72,
      "contaminantes": { "alquitran_g_Nm3": 16, "azufre_ppm": 200 }
    }
  },
  {
    "id": 131,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Cuero",
    "categoria": "Gas de Pirólisis de RSU",
    "origen_feedstock": "Residuos de Cuero y Calzado",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 15.0, "CO": 20.0, "CO2": 18.0, "CH4": 10.0, "C2_C4": 2.0, "N2": 35.0 },
      "poderCalorificoInferior_MJ_Nm3": 8.0,
      "relacion_H2_CO": 0.75,
      "contaminantes": { "alquitran_g_Nm3": 10, "azufre_ppm": 1500 }
    }
  },
  {
    "id": 132,
    "fase": "Gaseoso",
    "nombre": "Syngas de Alperujo",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Alperujo",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 15.0, "CO": 30.0, "CO2": 35.0, "CH4": 15.0, "C2_C4": 3.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 10.2,
      "relacion_H2_CO": 0.5,
      "contaminantes": { "alquitran_g_Nm3": 28, "azufre_ppm": 350 }
    }
  },
  {
    "id": 133,
    "fase": "Gaseoso",
    "nombre": "Syngas de Cáscara de Coco",
    "categoria": "Syngas de Biomasa",
    "origen_feedstock": "Cáscara de Coco",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 20.0, "CO": 46.0, "CO2": 16.0, "CH4": 12.0, "C2_C4": 5.0, "N2": 1.0 },
      "poderCalorificoInferior_MJ_Nm3": 14.8,
      "relacion_H2_CO": 0.43,
      "contaminantes": { "alquitran_g_Nm3": 9, "azufre_ppm": 80 }
    }
  },
  {
    "id": 134,
    "fase": "Gaseoso",
    "nombre": "Syngas de Madera de Demolición",
    "categoria": "Syngas de RSU",
    "origen_feedstock": "Madera de Construcción y Demolición",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 24.0, "CO": 38.0, "CO2": 21.0, "CH4": 11.0, "C2_C4": 4.0, "N2": 2.0 },
      "poderCalorificoInferior_MJ_Nm3": 12.0,
      "relacion_H2_CO": 0.63,
      "contaminantes": { "alquitran_g_Nm3": 11, "azufre_ppm": 110 }
    }
  },
  {
    "id": 135,
    "fase": "Gaseoso",
    "nombre": "Gas de Pirólisis de Rechazo (Gas pobre)",
    "categoria": "Gas de Pirólisis de RSU",
    "origen_feedstock": "Rechazo de Planta de Triaje",
    "propiedades": {
      "composicion_vol_porcentaje": { "H2": 12.0, "CO": 15.0, "CO2": 20.0, "CH4": 8.0, "C2_C4": 5.0, "N2": 40.0 },
      "poderCalorificoInferior_MJ_Nm3": 6.5,
      "relacion_H2_CO": 0.8,
      "contaminantes": { "alquitran_g_Nm3": 25, "azufre_ppm": 600 }
    }
  }
];

export const SIMULATION_ENGINE: SimulationEngine = {
  "biomass_pyrolysis_modes": [
    {
      "id": "mode_bio_oil",
      "nombre": "Modo Bio-aceite (Pirólisis Rápida)",
      "condiciones_tipicas": { "temperatura_C": "450-550", "tasa_calentamiento": "> 100 °C/s", "tiempo_residencia": "< 2 s" },
      "rendimiento_base_porcentaje": { "liquido": 65, "solido": 15, "gas": 20 },
      "analisis_ia": "Optimizado para maximizar el rendimiento de bio-aceite. Ideal para la producción de biocombustibles líquidos y productos químicos. Requiere un control preciso de la temperatura y tiempos de residencia muy cortos."
    },
    {
      "id": "mode_biochar",
      "nombre": "Modo Biochar (Pirólisis Lenta)",
      "condiciones_tipicas": { "temperatura_C": "350-500", "tasa_calentamiento": "0.1-1 °C/s", "tiempo_residencia": "horas" },
      "rendimiento_base_porcentaje": { "liquido": 30, "solido": 35, "gas": 35 },
      "analisis_ia": "Enfocado en la producción de biochar de alta calidad para aplicaciones agrícolas y de secuestro de carbono. El proceso es más simple y robusto, pero el rendimiento de líquidos es menor."
    },
    {
      "id": "mode_gas",
      "nombre": "Modo Syngas (Gasificación)",
      "condiciones_tipicas": { "temperatura_C": "> 700", "tasa_calentamiento": "variable", "tiempo_residencia": "segundos a minutos" },
      "rendimiento_base_porcentaje": { "liquido": 5, "solido": 10, "gas": 85 },
      "analisis_ia": "Maximiza la producción de gas de síntesis (syngas), ideal para la generación de energía eléctrica o la producción de combustibles sintéticos. Requiere altas temperaturas y, a menudo, un agente gasificante."
    }
  ],
  "catalysts": [
    {
      "id": "zeolita",
      "nombre": "Zeolita tipo HZSM-5",
      "descripcion": "Un catalizador microporoso de aluminosilicato, muy efectivo para el craqueo de vapores de pirólisis y la producción de hidrocarburos aromáticos.",
      "aplicable_a": ["Forestal", "Agrícola Leñosa", "Agrícola Herbácea", "Plásticos y Polímeros"],
      "efecto_simulado": {
        "modificador_condiciones": "Reduce ligeramente la temperatura óptima de reacción.",
        "modificador_rendimiento": { "liquido": "-10%", "solido": "+0%", "gas": "+10%" },
        "mejora_calidad_liquido": "Aumenta la fracción de aromáticos y reduce el contenido de oxígeno.",
        "mejora_calidad_gas": "Aumenta la concentración de hidrocarburos ligeros."
      }
    },
    {
      "id": "fcc_gastado",
      "nombre": "FCC Gastado (Fluid Catalytic Cracking)",
      "descripcion": "Catalizador residual de refinerías de petróleo. Económico y muy activo para el craqueo de plásticos y biomasas pesadas, aumentando la producción de gasolina y gases.",
      "aplicable_a": ["Plásticos y Polímeros", "Residuos Sólidos Urbanos", "Forestal"],
      "efecto_simulado": {
        "modificador_condiciones": "Funciona bien a temperaturas moderadas-altas (500-600°C).",
        "modificador_rendimiento": { "liquido": "-15%", "solido": "-5%", "gas": "+20%" },
        "mejora_calidad_liquido": "Aumenta significativamente la fracción de hidrocarburos aromáticos (gasolina) y reduce compuestos oxigenados.",
        "mejora_calidad_gas": "Incrementa la producción de olefinas ligeras (etileno, propileno)."
      }
    },
    {
      "id": "dolomita",
      "nombre": "Dolomita",
      "descripcion": "Mineral natural de carbonato de calcio y magnesio. Catalizador económico y robusto, especialmente efectivo en la reducción de alquitranes durante la gasificación y pirólisis a alta temperatura.",
      "aplicable_a": ["Agrícola Herbácea", "Residuos Agroindustriales", "Residuos Sólidos Urbanos"],
      "efecto_simulado": {
        "modificador_condiciones": "Requiere temperaturas más altas (>600°C) para ser efectivo.",
        "modificador_rendimiento": { "liquido": "-5%", "solido": "+0%", "gas": "+5%" },
        "mejora_calidad_liquido": "Reduce la viscosidad y el contenido de alquitranes pesados.",
        "mejora_calidad_gas": "Disminuye drásticamente el contenido de alquitrán, mejorando la calidad del syngas para motores o síntesis."
      }
    },
    {
      "id": "oxido_hierro",
      "nombre": "Óxido de Hierro (Fe₂O₃)",
      "descripcion": "Catalizador basado en óxido de hierro. Promueve reacciones de reformado y la reacción de desplazamiento de gas de agua (water-gas shift), enriqueciendo el syngas en hidrógeno.",
      "aplicable_a": ["Forestal", "Agrícola Leñosa", "Cultivos Energéticos"],
      "efecto_simulado": {
        "modificador_condiciones": "Más efectivo en presencia de vapor y a temperaturas medias (600-750°C).",
        "modificador_rendimiento": { "liquido": "-5%", "solido": "-5%", "gas": "+10%" },
        "mejora_calidad_liquido": "Reduce ligeramente el contenido de oxígeno.",
        "mejora_calidad_gas": "Aumenta significativamente la relación H₂/CO, produciendo un gas rico en hidrógeno."
      }
    },
    {
      "id": "carbon_activado",
      "nombre": "Carbón Activado",
      "descripcion": "Material carbonoso con una alta área superficial y porosidad. Actúa como un catalizador de craqueo de alquitranes y como adsorbente de contaminantes.",
      "aplicable_a": ["Forestal", "Residuos Agroindustriales", "Agrícola Herbácea"],
      "efecto_simulado": {
        "modificador_condiciones": "Efectivo en un amplio rango de temperaturas, a menudo usado en una etapa secundaria de limpieza de gas.",
        "modificador_rendimiento": { "liquido": "-2%", "solido": "+2%", "gas": "+0%" },
        "mejora_calidad_liquido": "Mejora la estabilidad del bio-aceite al eliminar compuestos reactivos.",
        "mejora_calidad_gas": "Reduce el contenido de alquitrán y adsorbe compuestos de azufre si está preparado para ello."
      }
    }
  ],
  "heat_sources": [
    {
        "id": "convencional",
        "nombre": "Fuente de Calor Convencional",
        "descripcion": "Uso de combustibles fósiles o quema de una porción del syngas producido para calentar el reactor.",
        "efecto_simulado": {
            "kpis": { "coste_bio_aceite": 25, "eficiencia_carbono": 70, "eficiencia_energetica": 75, "emisiones_netas": 50 },
            "analisis_ia": "El método base. Fiable pero con mayores emisiones y costos operativos."
        }
    },
    {
        "id": "hibrido",
        "nombre": "Híbrido (Solar + Syngas)",
        "descripcion": "Combina energía solar concentrada con la quema de syngas para una operación más sostenible y flexible.",
        "efecto_simulado": {
            "kpis": { "coste_bio_aceite": 22, "eficiencia_carbono": 75, "eficiencia_energetica": 85, "emisiones_netas": 20 },
            "analisis_ia": "Mejora la sostenibilidad y reduce la dependencia del syngas, permitiendo su uso para otros fines.",
             "carbon_balance": { "input": 100, "liquido": 50, "solido": 25, "gas": 15, "perdidas": 10 },
            "sensitivity_analysis": [{ "parameter": "Precio Electricidad", "impact_factor": 0.3 }]
        }
    }
  ],
  biomass_materials: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 58, 59, 62, 63, 66, 67, 70, 72],
  plastic_materials: [52, 53, 54, 55, 56, 57, 60, 61, 64, 65, 68, 69, 71],
  "plastic_pyrolysis_modes": []
};