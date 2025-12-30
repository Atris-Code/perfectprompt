import type { Feedstock } from '../types';

export const FEEDSTOCK_DATA: Feedstock[] = [
  {
    name: 'Pine Wood (Softwood)',
    type: 'Biomass',
    composition: { carbon: 50.5, hydrogen: 6.2, oxygen: 43.1, cellulose: 42, hemicellulose: 27, lignin: 28 },
  },
  {
    name: 'Oak Wood (Hardwood)',
    type: 'Biomass',
    composition: { carbon: 49.8, hydrogen: 6.0, oxygen: 44.0, cellulose: 45, hemicellulose: 30, lignin: 22 },
  },
  {
    name: 'Wheat Straw',
    type: 'Biomass',
    composition: { carbon: 48.5, hydrogen: 5.5, oxygen: 45.5, cellulose: 38, hemicellulose: 28, lignin: 17 },
  },
  {
    name: 'Sugarcane Bagasse',
    type: 'Biomass',
    composition: { carbon: 47.0, hydrogen: 6.5, oxygen: 46.0, cellulose: 40, hemicellulose: 25, lignin: 20 },
  },
  {
    name: 'Rice Husk',
    type: 'Biomass',
    composition: { carbon: 40.0, hydrogen: 5.8, oxygen: 38.5, cellulose: 35, hemicellulose: 25, lignin: 20 },
  },
  {
    name: 'Corn Stover',
    type: 'Biomass',
    composition: { carbon: 45.2, hydrogen: 6.1, oxygen: 48.3, cellulose: 37, hemicellulose: 24, lignin: 18 },
  },
    {
    name: 'Corn Cob',
    type: 'Biomass',
    composition: { carbon: 45.3, hydrogen: 6.2, oxygen: 48.0, cellulose: 45, hemicellulose: 35, lignin: 15 },
  },
  {
    name: 'Soybean Hulls',
    type: 'Biomass',
    composition: { carbon: 46.1, hydrogen: 6.3, oxygen: 47.2, cellulose: 36, hemicellulose: 16, lignin: 14 },
  },
  {
    name: 'Barley Straw',
    type: 'Biomass',
    composition: { carbon: 44.5, hydrogen: 6.0, oxygen: 49.0, cellulose: 34, hemicellulose: 22, lignin: 14 },
  },
  {
    name: 'Coconut Husk',
    type: 'Biomass',
    composition: { carbon: 43.4, hydrogen: 5.7, oxygen: 50.8, cellulose: 33, hemicellulose: 25, lignin: 30 },
  },
  {
    name: 'Coffee Husk',
    type: 'Biomass',
    composition: { carbon: 48.9, hydrogen: 5.6, oxygen: 44.8, cellulose: 41, hemicellulose: 22, lignin: 24 },
  },
  {
    name: 'Miscanthus',
    type: 'Biomass',
    composition: { carbon: 46.0, hydrogen: 6.0, oxygen: 47.5, cellulose: 40, hemicellulose: 30, lignin: 21 },
  },
  {
    name: 'Olive Pomace',
    type: 'Biomass',
    composition: { carbon: 54.0, hydrogen: 7.5, oxygen: 37.0, cellulose: 20, hemicellulose: 15, lignin: 40 },
  },
  {
    name: 'Peat',
    type: 'Peat',
    composition: { carbon: 58.0, hydrogen: 5.5, oxygen: 35.0 },
  },
  {
    name: 'Lignite',
    type: 'Coal',
    composition: { carbon: 65.0, hydrogen: 5.0, oxygen: 29.0 },
  },
  {
    name: 'Crude Oil',
    type: 'Oil & Fats',
    composition: { carbon: 85.0, hydrogen: 13.0, oxygen: 1.0 },
  },
];
