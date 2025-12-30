export interface Conversion {
  from: string;
  to: string;
  value: string;
}

export interface ConversionCategory {
  category: string;
  conversions: Conversion[];
}

export const conversionFactors: ConversionCategory[] = [
  {
    category: 'Longitud',
    conversions: [
      { from: '1 inch (in)', to: '2.54 cm', value: '2.54' },
      { from: '1 foot (ft)', to: '0.3048 m', value: '0.3048' },
      { from: '1 yard (yd)', to: '0.9144 m', value: '0.9144' },
      { from: '1 mile (mi)', to: '1.6093 km', value: '1.6093' },
    ],
  },
  {
    category: 'Área',
    conversions: [
      { from: '1 in²', to: '6.4516 cm²', value: '6.4516' },
      { from: '1 ft²', to: '0.0929 m²', value: '0.0929' },
      { from: '1 acre', to: '4046.86 m²', value: '4046.86' },
    ],
  },
  {
    category: 'Volumen',
    conversions: [
      { from: '1 US gallon (gal)', to: '3.7854 L', value: '3.7854' },
      { from: '1 ft³', to: '28.3168 L', value: '28.3168' },
    ],
  },
  {
    category: 'Masa',
    conversions: [
      { from: '1 ounce (oz)', to: '28.3495 g', value: '28.3495' },
      { from: '1 pound (lb)', to: '0.453592 kg', value: '0.453592' },
    ],
  },
  {
    category: 'Velocidad',
    conversions: [
      { from: '1 mph', to: '1.60934 km/h', value: '1.60934' },
      { from: '1 ft/s', to: '0.3048 m/s', value: '0.3048' },
    ],
  },
  {
    category: 'Presión',
    conversions: [
      { from: '1 psi', to: '6.89476 kPa', value: '6.89476' },
      { from: '1 atm', to: '101.325 kPa', value: '101.325' },
      { from: '1 bar', to: '100 kPa', value: '100' },
    ],
  },
  {
    category: 'Energía',
    conversions: [
      { from: '1 BTU', to: '1055.06 J', value: '1055.06' },
      { from: '1 calorie (cal)', to: '4.184 J', value: '4.184' },
      { from: '1 kilocalorie (kcal)', to: '4184 J', value: '4184' },
      { from: '1 kWh', to: '3.6 x 10⁶ J', value: '3.6e6' },
      { from: '1 foot-pound (ft-lbf)', to: '1.35582 J', value: '1.35582' },
    ],
  },
  {
    category: 'Potencia (Power)',
    conversions: [
      { from: '1 horsepower (hp)', to: '745.7 W', value: '745.7' },
    ],
  },
];

export interface ElementProperty {
    element: string;
    symbol: string;
    atomicNumber: number;
    atomicWeight: string; // masa atomica(g/mol)
    valence?: string;
    oxidationState?: string;
    electronegativity?: string; // Pauling scale
    ionicRadius?: string; // pm
    firstIonizationPotential?: string; // kJ/mol
    secondIonizationPotential?: string; // kJ/mol
    standardPotential?: string; // V
    density?: string; // g/cm³
    boilingPoint?: string; // °C
    meltingPoint?: string; // °C
}

export const elementProperties: ElementProperty[] = [
    { element: 'Hidrógeno', symbol: 'H', atomicNumber: 1, atomicWeight: '1.008', valence: '1', oxidationState: '+1, -1', electronegativity: '2.20', ionicRadius: '208 (-1)', firstIonizationPotential: '1312.0', secondIonizationPotential: 'N/A', standardPotential: '0', density: '0.00008988', boilingPoint: '-252.87', meltingPoint: '-259.14' },
    { element: 'Helio', symbol: 'He', atomicNumber: 2, atomicWeight: '4.0026', valence: '0', oxidationState: '0', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: '2372.3', secondIonizationPotential: '5250.5', standardPotential: 'N/A', density: '0.0001785', boilingPoint: '-268.93', meltingPoint: '-272.2' },
    { element: 'Litio', symbol: 'Li', atomicNumber: 3, atomicWeight: '6.94', valence: '1', oxidationState: '+1', electronegativity: '0.98', ionicRadius: '76 (+1)', firstIonizationPotential: '520.2', secondIonizationPotential: '7298.1', standardPotential: '-3.04', density: '0.534', boilingPoint: '1342', meltingPoint: '180.54' },
    { element: 'Berilio', symbol: 'Be', atomicNumber: 4, atomicWeight: '9.0122', valence: '2', oxidationState: '+2', electronegativity: '1.57', ionicRadius: '45 (+2)', firstIonizationPotential: '899.5', secondIonizationPotential: '1757.1', standardPotential: '-1.85', density: '1.85', boilingPoint: '2471', meltingPoint: '1287' },
    { element: 'Boro', symbol: 'B', atomicNumber: 5, atomicWeight: '10.81', valence: '3', oxidationState: '+3', electronegativity: '2.04', ionicRadius: '27 (+3)', firstIonizationPotential: '800.6', secondIonizationPotential: '2427.1', standardPotential: '-0.87', density: '2.34', boilingPoint: '3927', meltingPoint: '2076' },
    { element: 'Carbono', symbol: 'C', atomicNumber: 6, atomicWeight: '12.011', valence: '4', oxidationState: '+4, +2, -4', electronegativity: '2.55', ionicRadius: '16 (+4)', firstIonizationPotential: '1086.5', secondIonizationPotential: '2352.6', standardPotential: 'N/A', density: '2.267', boilingPoint: '4827', meltingPoint: '3550' },
    { element: 'Nitrógeno', symbol: 'N', atomicNumber: 7, atomicWeight: '14.007', valence: '3, 5', oxidationState: '-3, -2, -1, +1, +2, +3, +4, +5', electronegativity: '3.04', ionicRadius: '146 (-3)', firstIonizationPotential: '1402.3', secondIonizationPotential: '2856.1', standardPotential: 'N/A', density: '0.0012506', boilingPoint: '-195.79', meltingPoint: '-210.00' },
    { element: 'Oxígeno', symbol: 'O', atomicNumber: 8, atomicWeight: '15.999', valence: '2', oxidationState: '-2', electronegativity: '3.44', ionicRadius: '140 (-2)', firstIonizationPotential: '1313.9', secondIonizationPotential: '3388.3', standardPotential: 'N/A', density: '0.001429', boilingPoint: '-182.95', meltingPoint: '-218.79' },
    { element: 'Flúor', symbol: 'F', atomicNumber: 9, atomicWeight: '18.998', valence: '1', oxidationState: '-1', electronegativity: '3.98', ionicRadius: '133 (-1)', firstIonizationPotential: '1681.0', secondIonizationPotential: '3374.2', standardPotential: 'N/A', density: '0.001696', boilingPoint: '-188.12', meltingPoint: '-219.67' },
    { element: 'Neón', symbol: 'Ne', atomicNumber: 10, atomicWeight: '20.180', valence: '0', oxidationState: '0', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: '2080.7', secondIonizationPotential: '3952.3', standardPotential: 'N/A', density: '0.0009002', boilingPoint: '-246.08', meltingPoint: '-248.59' },
    { element: 'Sodio', symbol: 'Na', atomicNumber: 11, atomicWeight: '22.990', valence: '1', oxidationState: '+1', electronegativity: '0.93', ionicRadius: '102 (+1)', firstIonizationPotential: '495.8', secondIonizationPotential: '4562', standardPotential: '-2.71', density: '0.971', boilingPoint: '883', meltingPoint: '97.72' },
    { element: 'Magnesio', symbol: 'Mg', atomicNumber: 12, atomicWeight: '24.305', valence: '2', oxidationState: '+2', electronegativity: '1.31', ionicRadius: '72 (+2)', firstIonizationPotential: '737.7', secondIonizationPotential: '1450.7', standardPotential: '-2.37', density: '1.738', boilingPoint: '1090', meltingPoint: '650' },
    { element: 'Aluminio', symbol: 'Al', atomicNumber: 13, atomicWeight: '26.982', valence: '3', oxidationState: '+3', electronegativity: '1.61', ionicRadius: '53.5 (+3)', firstIonizationPotential: '577.5', secondIonizationPotential: '1816.7', standardPotential: '-1.66', density: '2.70', boilingPoint: '2519', meltingPoint: '660.32' },
    { element: 'Silicio', symbol: 'Si', atomicNumber: 14, atomicWeight: '28.085', valence: '4', oxidationState: '+4, -4', electronegativity: '1.90', ionicRadius: '40 (+4)', firstIonizationPotential: '786.5', secondIonizationPotential: '1577.1', standardPotential: '-0.91', density: '2.329', boilingPoint: '3265', meltingPoint: '1414' },
    { element: 'Fósforo', symbol: 'P', atomicNumber: 15, atomicWeight: '30.974', valence: '3, 5', oxidationState: '-3, +3, +5', electronegativity: '2.19', ionicRadius: '212 (-3)', firstIonizationPotential: '1011.8', secondIonizationPotential: '1907', standardPotential: 'N/A', density: '1.823', boilingPoint: '280.5', meltingPoint: '44.15' },
    { element: 'Azufre', symbol: 'S', atomicNumber: 16, atomicWeight: '32.06', valence: '2, 4, 6', oxidationState: '-2, +4, +6', electronegativity: '2.58', ionicRadius: '184 (-2)', firstIonizationPotential: '999.6', secondIonizationPotential: '2252', standardPotential: 'N/A', density: '2.07', boilingPoint: '444.6', meltingPoint: '115.21' },
    { element: 'Cloro', symbol: 'Cl', atomicNumber: 17, atomicWeight: '35.45', valence: '1, 3, 5, 7', oxidationState: '-1, +1, +3, +5, +7', electronegativity: '3.16', ionicRadius: '181 (-1)', firstIonizationPotential: '1251.2', secondIonizationPotential: '2298', standardPotential: 'N/A', density: '0.003214', boilingPoint: '-34.04', meltingPoint: '-101.5' },
    { element: 'Argón', symbol: 'Ar', atomicNumber: 18, atomicWeight: '39.948', valence: '0', oxidationState: '0', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: '1520.6', secondIonizationPotential: '2665.8', standardPotential: 'N/A', density: '0.001784', boilingPoint: '-185.8', meltingPoint: '-189.3' },
    { element: 'Potasio', symbol: 'K', atomicNumber: 19, atomicWeight: '39.098', valence: '1', oxidationState: '+1', electronegativity: '0.82', ionicRadius: '138 (+1)', firstIonizationPotential: '418.8', secondIonizationPotential: '3052', standardPotential: '-2.93', density: '0.862', boilingPoint: '759', meltingPoint: '63.38' },
    { element: 'Calcio', symbol: 'Ca', atomicNumber: 20, atomicWeight: '40.078', valence: '2', oxidationState: '+2', electronegativity: '1.00', ionicRadius: '100 (+2)', firstIonizationPotential: '589.8', secondIonizationPotential: '1145.4', standardPotential: '-2.87', density: '1.55', boilingPoint: '1484', meltingPoint: '842' },
    { element: 'Escandio', symbol: 'Sc', atomicNumber: 21, atomicWeight: '44.956', valence: '3', oxidationState: '+3', electronegativity: '1.36', ionicRadius: '74.5 (+3)', firstIonizationPotential: '633.1', secondIonizationPotential: '1235.0', standardPotential: '-2.03', density: '2.985', boilingPoint: '2836', meltingPoint: '1541' },
    { element: 'Titanio', symbol: 'Ti', atomicNumber: 22, atomicWeight: '47.867', valence: '2, 3, 4', oxidationState: '+2, +3, +4', electronegativity: '1.54', ionicRadius: '60.5 (+4)', firstIonizationPotential: '658.8', secondIonizationPotential: '1309.8', standardPotential: '-1.63', density: '4.506', boilingPoint: '3287', meltingPoint: '1668' },
    { element: 'Vanadio', symbol: 'V', atomicNumber: 23, atomicWeight: '50.942', valence: '2, 3, 4, 5', oxidationState: '+2, +3, +4, +5', electronegativity: '1.63', ionicRadius: '54 (+5)', firstIonizationPotential: '650.9', secondIonizationPotential: '1414', standardPotential: '-1.18', density: '6.11', boilingPoint: '3407', meltingPoint: '1910' },
    { element: 'Cromo', symbol: 'Cr', atomicNumber: 24, atomicWeight: '51.996', valence: '2, 3, 6', oxidationState: '+2, +3, +6', electronegativity: '1.66', ionicRadius: '61.5 (+3)', firstIonizationPotential: '652.9', secondIonizationPotential: '1590.6', standardPotential: '-0.74', density: '7.19', boilingPoint: '2671', meltingPoint: '1907' },
    { element: 'Manganeso', symbol: 'Mn', atomicNumber: 25, atomicWeight: '54.938', valence: '2, 3, 4, 6, 7', oxidationState: '+2, +3, +4, +6, +7', electronegativity: '1.55', ionicRadius: '83 (+2)', firstIonizationPotential: '717.3', secondIonizationPotential: '1509.0', standardPotential: '-1.18', density: '7.21', boilingPoint: '2061', meltingPoint: '1246' },
    { element: 'Hierro', symbol: 'Fe', atomicNumber: 26, atomicWeight: '55.845', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.83', ionicRadius: '78 (+2)', firstIonizationPotential: '762.5', secondIonizationPotential: '1561.9', standardPotential: '-0.44', density: '7.874', boilingPoint: '2861', meltingPoint: '1538' },
    { element: 'Cobalto', symbol: 'Co', atomicNumber: 27, atomicWeight: '58.933', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.88', ionicRadius: '74.5 (+2)', firstIonizationPotential: '760.4', secondIonizationPotential: '1648', standardPotential: '-0.28', density: '8.90', boilingPoint: '2927', meltingPoint: '1495' },
    { element: 'Níquel', symbol: 'Ni', atomicNumber: 28, atomicWeight: '58.693', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.91', ionicRadius: '69 (+2)', firstIonizationPotential: '737.1', secondIonizationPotential: '1753.0', standardPotential: '-0.25', density: '8.908', boilingPoint: '2730', meltingPoint: '1455' },
    { element: 'Cobre', symbol: 'Cu', atomicNumber: 29, atomicWeight: '63.546', valence: '1, 2', oxidationState: '+1, +2', electronegativity: '1.90', ionicRadius: '73 (+2)', firstIonizationPotential: '745.5', secondIonizationPotential: '1957.9', standardPotential: '+0.34', density: '8.96', boilingPoint: '2562', meltingPoint: '1084.62' },
    { element: 'Zinc', symbol: 'Zn', atomicNumber: 30, atomicWeight: '65.38', valence: '2', oxidationState: '+2', electronegativity: '1.65', ionicRadius: '74 (+2)', firstIonizationPotential: '906.4', secondIonizationPotential: '1733.3', standardPotential: '-0.76', density: '7.14', boilingPoint: '907', meltingPoint: '419.53' },
    { element: 'Galio', symbol: 'Ga', atomicNumber: 31, atomicWeight: '69.723', valence: '3', oxidationState: '+3', electronegativity: '1.81', ionicRadius: '62 (+3)', firstIonizationPotential: '578.8', secondIonizationPotential: '1979.3', standardPotential: '-0.53', density: '5.91', boilingPoint: '2204', meltingPoint: '29.76' },
    { element: 'Germanio', symbol: 'Ge', atomicNumber: 32, atomicWeight: '72.630', valence: '4', oxidationState: '+4', electronegativity: '2.01', ionicRadius: '53 (+4)', firstIonizationPotential: '762', secondIonizationPotential: '1537.5', standardPotential: '0.12', density: '5.323', boilingPoint: '2833', meltingPoint: '938.25' },
    { element: 'Arsénico', symbol: 'As', atomicNumber: 33, atomicWeight: '74.922', valence: '3, 5', oxidationState: '-3, +3, +5', electronegativity: '2.18', ionicRadius: '222 (-3)', firstIonizationPotential: '947.0', secondIonizationPotential: '1798', standardPotential: 'N/A', density: '5.727', boilingPoint: '613', meltingPoint: '817' },
    { element: 'Selenio', symbol: 'Se', atomicNumber: 34, atomicWeight: '78.971', valence: '2, 4, 6', oxidationState: '-2, +4, +6', electronegativity: '2.55', ionicRadius: '198 (-2)', firstIonizationPotential: '941.0', secondIonizationPotential: '2045', standardPotential: 'N/A', density: '4.81', boilingPoint: '685', meltingPoint: '221' },
    { element: 'Bromo', symbol: 'Br', atomicNumber: 35, atomicWeight: '79.904', valence: '1, 3, 5, 7', oxidationState: '-1, +1, +3, +5, +7', electronegativity: '2.96', ionicRadius: '196 (-1)', firstIonizationPotential: '1139.9', secondIonizationPotential: '2103', standardPotential: 'N/A', density: '3.1028', boilingPoint: '58.8', meltingPoint: '-7.2' },
    { element: 'Kriptón', symbol: 'Kr', atomicNumber: 36, atomicWeight: '83.798', valence: '0', oxidationState: '0, +2', electronegativity: '3.00', ionicRadius: 'N/A', firstIonizationPotential: '1350.8', secondIonizationPotential: '2350.4', standardPotential: 'N/A', density: '0.003749', boilingPoint: '-153.415', meltingPoint: '-157.36' },
    { element: 'Rubidio', symbol: 'Rb', atomicNumber: 37, atomicWeight: '85.468', valence: '1', oxidationState: '+1', electronegativity: '0.82', ionicRadius: '152 (+1)', firstIonizationPotential: '403.0', secondIonizationPotential: '2633', standardPotential: '-2.98', density: '1.532', boilingPoint: '688', meltingPoint: '39.31' },
    { element: 'Estroncio', symbol: 'Sr', atomicNumber: 38, atomicWeight: '87.62', valence: '2', oxidationState: '+2', electronegativity: '0.95', ionicRadius: '118 (+2)', firstIonizationPotential: '549.5', secondIonizationPotential: '1064.2', standardPotential: '-2.89', density: '2.64', boilingPoint: '1382', meltingPoint: '777' },
    { element: 'Itrio', symbol: 'Y', atomicNumber: 39, atomicWeight: '88.906', valence: '3', oxidationState: '+3', electronegativity: '1.22', ionicRadius: '90 (+3)', firstIonizationPotential: '600', secondIonizationPotential: '1180', standardPotential: '-2.37', density: '4.472', boilingPoint: '3345', meltingPoint: '1522' },
    { element: 'Zirconio', symbol: 'Zr', atomicNumber: 40, atomicWeight: '91.224', valence: '4', oxidationState: '+4', electronegativity: '1.33', ionicRadius: '72 (+4)', firstIonizationPotential: '640.1', secondIonizationPotential: '1270', standardPotential: '-1.55', density: '6.52', boilingPoint: '4409', meltingPoint: '1855' },
    { element: 'Niobio', symbol: 'Nb', atomicNumber: 41, atomicWeight: '92.906', valence: '3, 5', oxidationState: '+3, +5', electronegativity: '1.6', ionicRadius: '64 (+5)', firstIonizationPotential: '652.1', secondIonizationPotential: '1380', standardPotential: '-1.1', density: '8.57', boilingPoint: '4744', meltingPoint: '2477' },
    { element: 'Molibdeno', symbol: 'Mo', atomicNumber: 42, atomicWeight: '95.95', valence: '2, 3, 4, 5, 6', oxidationState: '+2, +3, +4, +5, +6', electronegativity: '2.16', ionicRadius: '59 (+6)', firstIonizationPotential: '684.3', secondIonizationPotential: '1560', standardPotential: '-0.2', density: '10.28', boilingPoint: '4639', meltingPoint: '2623' },
    { element: 'Tecnecio', symbol: 'Tc', atomicNumber: 43, atomicWeight: '(98)', valence: '2, 4, 5, 6, 7', oxidationState: '+4, +7', electronegativity: '1.9', ionicRadius: '56 (+7)', firstIonizationPotential: '702', secondIonizationPotential: '1470', standardPotential: 'N/A', density: '11.5', boilingPoint: '4265', meltingPoint: '2157' },
    { element: 'Rutenio', symbol: 'Ru', atomicNumber: 44, atomicWeight: '101.07', valence: '2, 3, 4, 6, 8', oxidationState: '+3, +4', electronegativity: '2.2', ionicRadius: '68 (+3)', firstIonizationPotential: '710.2', secondIonizationPotential: '1620', standardPotential: '0.249', density: '12.45', boilingPoint: '4150', meltingPoint: '2334' },
    { element: 'Rodio', symbol: 'Rh', atomicNumber: 45, atomicWeight: '102.91', valence: '2, 3, 4', oxidationState: '+3', electronegativity: '2.28', ionicRadius: '66.5 (+3)', firstIonizationPotential: '719.7', secondIonizationPotential: '1740', standardPotential: '0.758', density: '12.41', boilingPoint: '3695', meltingPoint: '1964' },
    { element: 'Paladio', symbol: 'Pd', atomicNumber: 46, atomicWeight: '106.42', valence: '2, 4', oxidationState: '+2, +4', electronegativity: '2.20', ionicRadius: '86 (+2)', firstIonizationPotential: '804.4', secondIonizationPotential: '1870', standardPotential: '0.915', density: '12.023', boilingPoint: '2963', meltingPoint: '1554.9' },
    { element: 'Plata', symbol: 'Ag', atomicNumber: 47, atomicWeight: '107.87', valence: '1', oxidationState: '+1', electronegativity: '1.93', ionicRadius: '115 (+1)', firstIonizationPotential: '731.0', secondIonizationPotential: '2070', standardPotential: '0.799', density: '10.49', boilingPoint: '2162', meltingPoint: '961.78' },
    { element: 'Cadmio', symbol: 'Cd', atomicNumber: 48, atomicWeight: '112.41', valence: '2', oxidationState: '+2', electronegativity: '1.69', ionicRadius: '95 (+2)', firstIonizationPotential: '867.8', secondIonizationPotential: '1631.4', standardPotential: '-0.403', density: '8.65', boilingPoint: '767', meltingPoint: '321.07' },
    { element: 'Indio', symbol: 'In', atomicNumber: 49, atomicWeight: '114.82', valence: '3', oxidationState: '+3', electronegativity: '1.78', ionicRadius: '80 (+3)', firstIonizationPotential: '558.3', secondIonizationPotential: '1820.7', standardPotential: '-0.34', density: '7.31', boilingPoint: '2072', meltingPoint: '156.60' },
    { element: 'Estaño', symbol: 'Sn', atomicNumber: 50, atomicWeight: '118.71', valence: '2, 4', oxidationState: '+2, +4', electronegativity: '1.96', ionicRadius: '69 (+4)', firstIonizationPotential: '708.6', secondIonizationPotential: '1411.8', standardPotential: '-0.137', density: '7.31', boilingPoint: '2602', meltingPoint: '231.93' },
    { element: 'Antimonio', symbol: 'Sb', atomicNumber: 51, atomicWeight: '121.76', valence: '3, 5', oxidationState: '-3, +3, +5', electronegativity: '2.05', ionicRadius: '245 (-3)', firstIonizationPotential: '834', secondIonizationPotential: '1594.9', standardPotential: 'N/A', density: '6.697', boilingPoint: '1587', meltingPoint: '630.63' },
    { element: 'Telurio', symbol: 'Te', atomicNumber: 52, atomicWeight: '127.60', valence: '2, 4, 6', oxidationState: '-2, +4, +6', electronegativity: '2.1', ionicRadius: '221 (-2)', firstIonizationPotential: '869.3', secondIonizationPotential: '1790', standardPotential: 'N/A', density: '6.24', boilingPoint: '988', meltingPoint: '449.51' },
    { element: 'Yodo', symbol: 'I', atomicNumber: 53, atomicWeight: '126.90', valence: '1, 3, 5, 7', oxidationState: '-1, +1, +3, +5, +7', electronegativity: '2.66', ionicRadius: '220 (-1)', firstIonizationPotential: '1008.4', secondIonizationPotential: '1845.9', standardPotential: 'N/A', density: '4.933', boilingPoint: '184.3', meltingPoint: '113.7' },
    { element: 'Xenón', symbol: 'Xe', atomicNumber: 54, atomicWeight: '131.29', valence: '0', oxidationState: '0, +2, +4, +6, +8', electronegativity: '2.6', ionicRadius: 'N/A', firstIonizationPotential: '1170.4', secondIonizationPotential: '2046.4', standardPotential: 'N/A', density: '0.005894', boilingPoint: '-108.0', meltingPoint: '-111.7' },
    { element: 'Cesio', symbol: 'Cs', atomicNumber: 55, atomicWeight: '132.91', valence: '1', oxidationState: '+1', electronegativity: '0.79', ionicRadius: '167 (+1)', firstIonizationPotential: '375.7', secondIonizationPotential: '2234.3', standardPotential: '-3.026', density: '1.93', boilingPoint: '671', meltingPoint: '28.44' },
    { element: 'Bario', symbol: 'Ba', atomicNumber: 56, atomicWeight: '137.33', valence: '2', oxidationState: '+2', electronegativity: '0.89', ionicRadius: '135 (+2)', firstIonizationPotential: '502.9', secondIonizationPotential: '965.2', standardPotential: '-2.92', density: '3.51', boilingPoint: '1897', meltingPoint: '727' },
    { element: 'Lantano', symbol: 'La', atomicNumber: 57, atomicWeight: '138.91', valence: '3', oxidationState: '+3', electronegativity: '1.10', ionicRadius: '103.2 (+3)', firstIonizationPotential: '538.1', secondIonizationPotential: '1067', standardPotential: '-2.52', density: '6.162', boilingPoint: '3464', meltingPoint: '920' },
    { element: 'Cerio', symbol: 'Ce', atomicNumber: 58, atomicWeight: '140.12', valence: '3, 4', oxidationState: '+3, +4', electronegativity: '1.12', ionicRadius: '102 (+3)', firstIonizationPotential: '534.4', secondIonizationPotential: '1050', standardPotential: '-2.48', density: '6.770', boilingPoint: '3443', meltingPoint: '798' },
    { element: 'Praseodimio', symbol: 'Pr', atomicNumber: 59, atomicWeight: '140.91', valence: '3, 4', oxidationState: '+3', electronegativity: '1.13', ionicRadius: '99 (+3)', firstIonizationPotential: '527', secondIonizationPotential: '1020', standardPotential: '-2.47', density: '6.77', boilingPoint: '3520', meltingPoint: '931' },
    { element: 'Neodimio', symbol: 'Nd', atomicNumber: 60, atomicWeight: '144.24', valence: '3', oxidationState: '+3', electronegativity: '1.14', ionicRadius: '98.3 (+3)', firstIonizationPotential: '533.1', secondIonizationPotential: '1040', standardPotential: '-2.44', density: '7.01', boilingPoint: '3074', meltingPoint: '1021' },
    { element: 'Prometio', symbol: 'Pm', atomicNumber: 61, atomicWeight: '(145)', valence: '3', oxidationState: '+3', electronegativity: '1.13', ionicRadius: '97 (+3)', firstIonizationPotential: '540', secondIonizationPotential: '1050', standardPotential: '-2.42', density: '7.26', boilingPoint: '3000', meltingPoint: '1042' },
    { element: 'Samario', symbol: 'Sm', atomicNumber: 62, atomicWeight: '150.36', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.17', ionicRadius: '95.8 (+3)', firstIonizationPotential: '544.5', secondIonizationPotential: '1070', standardPotential: '-2.41', density: '7.52', boilingPoint: '1794', meltingPoint: '1072' },
    { element: 'Europio', symbol: 'Eu', atomicNumber: 63, atomicWeight: '151.96', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.2', ionicRadius: '94.7 (+3)', firstIonizationPotential: '547.1', secondIonizationPotential: '1085', standardPotential: '-2.41', density: '5.244', boilingPoint: '1529', meltingPoint: '822' },
    { element: 'Gadolinio', symbol: 'Gd', atomicNumber: 64, atomicWeight: '157.25', valence: '3', oxidationState: '+3', electronegativity: '1.20', ionicRadius: '93.8 (+3)', firstIonizationPotential: '593.4', secondIonizationPotential: '1170', standardPotential: '-2.40', density: '7.90', boilingPoint: '3273', meltingPoint: '1313' },
    { element: 'Terbio', symbol: 'Tb', atomicNumber: 65, atomicWeight: '158.93', valence: '3, 4', oxidationState: '+3', electronegativity: '1.2', ionicRadius: '92.3 (+3)', firstIonizationPotential: '565.8', secondIonizationPotential: '1110', standardPotential: '-2.39', density: '8.23', boilingPoint: '3230', meltingPoint: '1356' },
    { element: 'Disprosio', symbol: 'Dy', atomicNumber: 66, atomicWeight: '162.50', valence: '3', oxidationState: '+3', electronegativity: '1.22', ionicRadius: '91.2 (+3)', firstIonizationPotential: '573.0', secondIonizationPotential: '1130', standardPotential: '-2.35', density: '8.551', boilingPoint: '2567', meltingPoint: '1412' },
    { element: 'Holmio', symbol: 'Ho', atomicNumber: 67, atomicWeight: '164.93', valence: '3', oxidationState: '+3', electronegativity: '1.23', ionicRadius: '90.1 (+3)', firstIonizationPotential: '581.0', secondIonizationPotential: '1140', standardPotential: '-2.32', density: '8.79', boilingPoint: '2700', meltingPoint: '1474' },
    { element: 'Erbio', symbol: 'Er', atomicNumber: 68, atomicWeight: '167.26', valence: '3', oxidationState: '+3', electronegativity: '1.24', ionicRadius: '89 (+3)', firstIonizationPotential: '589.3', secondIonizationPotential: '1150', standardPotential: '-2.30', density: '9.066', boilingPoint: '2868', meltingPoint: '1529' },
    { element: 'Tulio', symbol: 'Tm', atomicNumber: 69, atomicWeight: '168.93', valence: '2, 3', oxidationState: '+3', electronegativity: '1.25', ionicRadius: '88 (+3)', firstIonizationPotential: '596.7', secondIonizationPotential: '1160', standardPotential: '-2.28', density: '9.32', boilingPoint: '1950', meltingPoint: '1545' },
    { element: 'Iterbio', symbol: 'Yb', atomicNumber: 70, atomicWeight: '173.05', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.1', ionicRadius: '86.8 (+3)', firstIonizationPotential: '603.4', secondIonizationPotential: '1174.8', standardPotential: '-2.22', density: '6.90', boilingPoint: '1196', meltingPoint: '824' },
    { element: 'Lutecio', symbol: 'Lu', atomicNumber: 71, atomicWeight: '174.97', valence: '3', oxidationState: '+3', electronegativity: '1.27', ionicRadius: '86.1 (+3)', firstIonizationPotential: '523.5', secondIonizationPotential: '1340', standardPotential: '-2.25', density: '9.841', boilingPoint: '3402', meltingPoint: '1663' },
    { element: 'Hafnio', symbol: 'Hf', atomicNumber: 72, atomicWeight: '178.49', valence: '4', oxidationState: '+4', electronegativity: '1.3', ionicRadius: '71 (+4)', firstIonizationPotential: '658.5', secondIonizationPotential: '1440', standardPotential: '-1.57', density: '13.31', boilingPoint: '4603', meltingPoint: '2233' },
    { element: 'Tántalo', symbol: 'Ta', atomicNumber: 73, atomicWeight: '180.95', valence: '5', oxidationState: '+5', electronegativity: '1.5', ionicRadius: '64 (+5)', firstIonizationPotential: '761', secondIonizationPotential: '1500', standardPotential: '-0.6', density: '16.69', boilingPoint: '5458', meltingPoint: '3017' },
    { element: 'Wolframio', symbol: 'W', atomicNumber: 74, atomicWeight: '183.84', valence: '2, 3, 4, 5, 6', oxidationState: '+6', electronegativity: '2.36', ionicRadius: '60 (+6)', firstIonizationPotential: '770', secondIonizationPotential: '1700', standardPotential: '-0.09', density: '19.25', boilingPoint: '5555', meltingPoint: '3422' },
    { element: 'Renio', symbol: 'Re', atomicNumber: 75, atomicWeight: '186.21', valence: '2, 4, 6, 7', oxidationState: '+4, +7', electronegativity: '1.9', ionicRadius: '53 (+7)', firstIonizationPotential: '760', secondIonizationPotential: '1600', standardPotential: '0.3', density: '21.02', boilingPoint: '5596', meltingPoint: '3186' },
    { element: 'Osmio', symbol: 'Os', atomicNumber: 76, atomicWeight: '190.23', valence: '2, 3, 4, 6, 8', oxidationState: '+4', electronegativity: '2.2', ionicRadius: '63 (+4)', firstIonizationPotential: '840', secondIonizationPotential: '1600', standardPotential: '0.85', density: '22.59', boilingPoint: '5012', meltingPoint: '3033' },
    { element: 'Iridio', symbol: 'Ir', atomicNumber: 77, atomicWeight: '192.22', valence: '2, 3, 4, 6', oxidationState: '+4', electronegativity: '2.20', ionicRadius: '62.5 (+4)', firstIonizationPotential: '880', secondIonizationPotential: '1600', standardPotential: '1.156', density: '22.56', boilingPoint: '4428', meltingPoint: '2446' },
    { element: 'Platino', symbol: 'Pt', atomicNumber: 78, atomicWeight: '195.08', valence: '2, 4', oxidationState: '+2, +4', electronegativity: '2.28', ionicRadius: '80 (+2)', firstIonizationPotential: '870', secondIonizationPotential: '1791', standardPotential: '1.18', density: '21.45', boilingPoint: '3825', meltingPoint: '1768.3' },
    { element: 'Oro', symbol: 'Au', atomicNumber: 79, atomicWeight: '196.97', valence: '1, 3', oxidationState: '+1, +3', electronegativity: '2.54', ionicRadius: '137 (+1)', firstIonizationPotential: '890.1', secondIonizationPotential: '1980', standardPotential: '1.50', density: '19.30', boilingPoint: '2856', meltingPoint: '1064.18' },
    { element: 'Mercurio', symbol: 'Hg', atomicNumber: 80, atomicWeight: '200.59', valence: '1, 2', oxidationState: '+1, +2', electronegativity: '2.00', ionicRadius: '102 (+2)', firstIonizationPotential: '1007.1', secondIonizationPotential: '1810', standardPotential: '0.851', density: '13.534', boilingPoint: '356.73', meltingPoint: '-38.83' },
    { element: 'Talio', symbol: 'Tl', atomicNumber: 81, atomicWeight: '204.38', valence: '1, 3', oxidationState: '+1, +3', electronegativity: '1.62', ionicRadius: '150 (+1)', firstIonizationPotential: '589.4', secondIonizationPotential: '1971', standardPotential: '-0.336', density: '11.85', boilingPoint: '1473', meltingPoint: '304' },
    { element: 'Plomo', symbol: 'Pb', atomicNumber: 82, atomicWeight: '207.2', valence: '2, 4', oxidationState: '+2, +4', electronegativity: '2.33', ionicRadius: '119 (+2)', firstIonizationPotential: '715.6', secondIonizationPotential: '1450.5', standardPotential: '-0.126', density: '11.34', boilingPoint: '1749', meltingPoint: '327.46' },
    { element: 'Bismuto', symbol: 'Bi', atomicNumber: 83, atomicWeight: '208.98', valence: '3, 5', oxidationState: '+3', electronegativity: '2.02', ionicRadius: '103 (+3)', firstIonizationPotential: '703', secondIonizationPotential: '1610', standardPotential: '0.317', density: '9.78', boilingPoint: '1564', meltingPoint: '271.3' },
    { element: 'Polonio', symbol: 'Po', atomicNumber: 84, atomicWeight: '(209)', valence: '2, 4, 6', oxidationState: '+2, +4', electronegativity: '2.0', ionicRadius: '94 (+4)', firstIonizationPotential: '812.1', secondIonizationPotential: 'N/A', standardPotential: '0.4', density: '9.196', boilingPoint: '962', meltingPoint: '254' },
    { element: 'Astato', symbol: 'At', atomicNumber: 85, atomicWeight: '(210)', valence: '1, 3, 5, 7', oxidationState: '-1, +1, +3, +5, +7', electronegativity: '2.2', ionicRadius: '62 (+7)', firstIonizationPotential: '890', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: '337', meltingPoint: '302' },
    { element: 'Radón', symbol: 'Rn', atomicNumber: 86, atomicWeight: '(222)', valence: '0', oxidationState: '0', electronegativity: '2.2', ionicRadius: 'N/A', firstIonizationPotential: '1037', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: '0.00973', boilingPoint: '-61.7', meltingPoint: '-71' },
    { element: 'Francio', symbol: 'Fr', atomicNumber: 87, atomicWeight: '(223)', valence: '1', oxidationState: '+1', electronegativity: '0.7', ionicRadius: '180 (+1)', firstIonizationPotential: '380', secondIonizationPotential: 'N/A', standardPotential: '-2.9', density: 'N/A', boilingPoint: '677', meltingPoint: '27' },
    { element: 'Radio', symbol: 'Ra', atomicNumber: 88, atomicWeight: '(226)', valence: '2', oxidationState: '+2', electronegativity: '0.9', ionicRadius: '148 (+2)', firstIonizationPotential: '509.3', secondIonizationPotential: '979.0', standardPotential: '-2.916', density: '5.5', boilingPoint: '1737', meltingPoint: '700' },
    { element: 'Actinio', symbol: 'Ac', atomicNumber: 89, atomicWeight: '(227)', valence: '3', oxidationState: '+3', electronegativity: '1.1', ionicRadius: '112 (+3)', firstIonizationPotential: '499', secondIonizationPotential: '1170', standardPotential: '-2.13', density: '10.07', boilingPoint: '3198', meltingPoint: '1050' },
    { element: 'Torio', symbol: 'Th', atomicNumber: 90, atomicWeight: '232.04', valence: '4', oxidationState: '+4', electronegativity: '1.3', ionicRadius: '94 (+4)', firstIonizationPotential: '587', secondIonizationPotential: '1110', standardPotential: '-1.90', density: '11.724', boilingPoint: '4788', meltingPoint: '1750' },
    { element: 'Protactinio', symbol: 'Pa', atomicNumber: 91, atomicWeight: '231.04', valence: '4, 5', oxidationState: '+5', electronegativity: '1.5', ionicRadius: '96 (+4)', firstIonizationPotential: '568', secondIonizationPotential: 'N/A', standardPotential: '-1.4', density: '15.37', boilingPoint: '4027', meltingPoint: '1572' },
    { element: 'Uranio', symbol: 'U', atomicNumber: 92, atomicWeight: '238.03', valence: '3, 4, 5, 6', oxidationState: '+3, +4, +5, +6', electronegativity: '1.38', ionicRadius: '102.5 (+3)', firstIonizationPotential: '597.6', secondIonizationPotential: '1420', standardPotential: '-1.798', density: '19.1', boilingPoint: '4131', meltingPoint: '1132.2' },
    { element: 'Neptunio', symbol: 'Np', atomicNumber: 93, atomicWeight: '(237)', valence: '3, 4, 5, 6, 7', oxidationState: '+3, +4, +5, +6', electronegativity: '1.36', ionicRadius: '101 (+3)', firstIonizationPotential: '604.5', secondIonizationPotential: 'N/A', standardPotential: '-1.856', density: '20.45', boilingPoint: '3902', meltingPoint: '644' },
    { element: 'Plutonio', symbol: 'Pu', atomicNumber: 94, atomicWeight: '(244)', valence: '3, 4, 5, 6, 7', oxidationState: '+3, +4, +5, +6', electronegativity: '1.28', ionicRadius: '100 (+3)', firstIonizationPotential: '584.7', secondIonizationPotential: 'N/A', standardPotential: '-2.03', density: '19.816', boilingPoint: '3228', meltingPoint: '640' },
    { element: 'Americio', symbol: 'Am', atomicNumber: 95, atomicWeight: '(243)', valence: '2, 3, 4, 5, 6', oxidationState: '+3', electronegativity: '1.3', ionicRadius: '97.5 (+3)', firstIonizationPotential: '578', secondIonizationPotential: 'N/A', standardPotential: '-2.048', density: '13.67', boilingPoint: '2607', meltingPoint: '1176' },
    { element: 'Curio', symbol: 'Cm', atomicNumber: 96, atomicWeight: '(247)', valence: '3, 4', oxidationState: '+3', electronegativity: '1.3', ionicRadius: '97 (+3)', firstIonizationPotential: '581', secondIonizationPotential: 'N/A', standardPotential: '-2.06', density: '13.51', boilingPoint: '3110', meltingPoint: '1340' },
    { element: 'Berkelio', symbol: 'Bk', atomicNumber: 97, atomicWeight: '(247)', valence: '3, 4', oxidationState: '+3, +4', electronegativity: '1.3', ionicRadius: '96 (+3)', firstIonizationPotential: '601', secondIonizationPotential: 'N/A', standardPotential: '-2.01', density: '14.78', boilingPoint: '2627', meltingPoint: '986' },
    { element: 'Californio', symbol: 'Cf', atomicNumber: 98, atomicWeight: '(251)', valence: '2, 3, 4', oxidationState: '+3', electronegativity: '1.3', ionicRadius: '95 (+3)', firstIonizationPotential: '608', secondIonizationPotential: 'N/A', standardPotential: '-1.96', density: '15.1', boilingPoint: '1470', meltingPoint: '900' },
    { element: 'Einstenio', symbol: 'Es', atomicNumber: 99, atomicWeight: '(252)', valence: '2, 3', oxidationState: '+3', electronegativity: '1.3', ionicRadius: 'N/A', firstIonizationPotential: '619', secondIonizationPotential: 'N/A', standardPotential: '-1.99', density: '8.84', boilingPoint: '996', meltingPoint: '860' },
    { element: 'Fermio', symbol: 'Fm', atomicNumber: 100, atomicWeight: '(257)', valence: '2, 3', oxidationState: '+3', electronegativity: '1.3', ionicRadius: 'N/A', firstIonizationPotential: '627', secondIonizationPotential: 'N/A', standardPotential: '-2.06', density: 'N/A', boilingPoint: 'N/A', meltingPoint: '1527' },
    { element: 'Mendelevio', symbol: 'Md', atomicNumber: 101, atomicWeight: '(258)', valence: '2, 3', oxidationState: '+3', electronegativity: '1.3', ionicRadius: 'N/A', firstIonizationPotential: '635', secondIonizationPotential: 'N/A', standardPotential: '-1.74', density: 'N/A', boilingPoint: 'N/A', meltingPoint: '827' },
    { element: 'Nobelio', symbol: 'No', atomicNumber: 102, atomicWeight: '(259)', valence: '2, 3', oxidationState: '+2, +3', electronegativity: '1.3', ionicRadius: 'N/A', firstIonizationPotential: '642', secondIonizationPotential: 'N/A', standardPotential: '-1.26', density: 'N/A', boilingPoint: 'N/A', meltingPoint: '827' },
    { element: 'Lawrencio', symbol: 'Lr', atomicNumber: 103, atomicWeight: '(262)', valence: '3', oxidationState: '+3', electronegativity: '1.3', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: '1627' },
    { element: 'Rutherfordio', symbol: 'Rf', atomicNumber: 104, atomicWeight: '(267)', valence: '4', oxidationState: '+4', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Dubnio', symbol: 'Db', atomicNumber: 105, atomicWeight: '(268)', valence: '5', oxidationState: '+5', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Seaborgio', symbol: 'Sg', atomicNumber: 106, atomicWeight: '(271)', valence: '6', oxidationState: '+6', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Bohrio', symbol: 'Bh', atomicNumber: 107, atomicWeight: '(272)', valence: '7', oxidationState: '+7', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Hasio', symbol: 'Hs', atomicNumber: 108, atomicWeight: '(270)', valence: '8', oxidationState: '+8', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Meitnerio', symbol: 'Mt', atomicNumber: 109, atomicWeight: '(276)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Darmstatio', symbol: 'Ds', atomicNumber: 110, atomicWeight: '(281)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Roentgenio', symbol: 'Rg', atomicNumber: 111, atomicWeight: '(280)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Copernicio', symbol: 'Cn', atomicNumber: 112, atomicWeight: '(285)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Nihonio', symbol: 'Nh', atomicNumber: 113, atomicWeight: '(286)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Flerovio', symbol: 'Fl', atomicNumber: 114, atomicWeight: '(289)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Moscovio', symbol: 'Mc', atomicNumber: 115, atomicWeight: '(290)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Livermorio', symbol: 'Lv', atomicNumber: 116, atomicWeight: '(293)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Teneso', symbol: 'Ts', atomicNumber: 117, atomicWeight: '(294)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' },
    { element: 'Oganesón', symbol: 'Og', atomicNumber: 118, atomicWeight: '(294)', valence: 'N/A', oxidationState: 'N/A', electronegativity: 'N/A', ionicRadius: 'N/A', firstIonizationPotential: 'N/A', secondIonizationPotential: 'N/A', standardPotential: 'N/A', density: 'N/A', boilingPoint: 'N/A', meltingPoint: 'N/A' }
];

export interface FluidProperty {
    density: string;
    viscosity: string;
}

export const fluidProperties: { water: FluidProperty; air: FluidProperty } = {
    water: {
        density: '1000 kg/m³ (a 4°C)',
        viscosity: '1.002 mPa·s (a 20°C)',
    },
    air: {
        density: '1.225 kg/m³ (nivel del mar, 15°C)',
        viscosity: '18.1 μPa·s (a 15°C)',
    },
};

export interface WaterProperty {
  temp: number;
  density: string;
  viscosity: string;
}

export const waterPropertiesByTemp: WaterProperty[] = [
  { temp: 0, density: '999.84', viscosity: '1.792' },
  { temp: 10, density: '999.70', viscosity: '1.307' },
  { temp: 20, density: '998.21', viscosity: '1.002' },
  { temp: 30, density: '995.65', viscosity: '0.798' },
  { temp: 40, density: '992.22', viscosity: '0.653' },
  { temp: 50, density: '988.04', viscosity: '0.547' },
  { temp: 60, density: '983.20', viscosity: '0.467' },
  { temp: 70, density: '977.78', viscosity: '0.404' },
  { temp: 80, density: '971.82', viscosity: '0.355' },
  { temp: 90, density: '965.35', viscosity: '0.315' },
  { temp: 100, density: '958.40', viscosity: '0.282' },
];

export interface UniversalConstant {
    name: string;
    symbol: string;
    value: string;
    units: string;
    category: string;
}

export const universalConstants: UniversalConstant[] = [
    { name: 'Velocidad de la Luz en el vacío', symbol: 'c', value: '2.99792458 × 10⁸', units: 'm/s', category: 'Física' },
    { name: 'Constante de Planck', symbol: 'h', value: '6.62607015 × 10⁻³⁴', units: 'J·s', category: 'Física Cuántica' },
    { name: 'Constante de Gravitación Universal', symbol: 'G', value: '6.67430 × 10⁻¹¹', units: 'N·m²/kg²', category: 'Física' },
    { name: 'Número de Avogadro', symbol: 'Nₐ', value: '6.02214076 × 10²³', units: 'mol⁻¹', category: 'Química' },
    { name: 'Constante de Boltzmann', symbol: 'k', value: '1.380649 × 10⁻²³', units: 'J/K', category: 'Física' },
    { name: 'Constante Universal de los Gases', symbol: 'R', value: '8.314462618', units: 'J/(mol·K)', category: 'Química' },
    { name: 'Pi', symbol: 'π', value: '3.1415926535...', units: '', category: 'Matemáticas' },
    { name: 'Número de Euler', symbol: 'e', value: '2.7182818284...', units: '', category: 'Matemáticas' },
    { name: 'Identidad de Euler', symbol: 'e^(iπ) + 1 = 0', value: 'Relaciona 5 constantes fundamentales', units: '', category: 'Teoremas' },
];

export const scientificSymbols = [
  ...universalConstants.map(c => ({ name: c.name, symbol: c.symbol })),
  ...elementProperties.map(e => ({ name: e.element, symbol: e.symbol })),
];

// New data from images
export interface MetricPrefix {
  quantity: string;
  prefix: string;
  symbol: string;
}

export const metricPrefixes: MetricPrefix[] = [
  { quantity: '10⁻¹⁵', prefix: 'femto', symbol: 'f' },
  { quantity: '10⁻¹²', prefix: 'pico', symbol: 'p' },
  { quantity: '10⁻⁹', prefix: 'nano', symbol: 'n' },
  { quantity: '10⁻⁶', prefix: 'micro', symbol: 'μ' },
  { quantity: '10⁻³', prefix: 'milli', symbol: 'm' },
  { quantity: '10⁻²', prefix: 'centi', symbol: 'c' },
  { quantity: '10⁻¹', prefix: 'deci', symbol: 'd' },
  { quantity: '10', prefix: 'deka', symbol: 'da' },
  { quantity: '10²', prefix: 'hecto', symbol: 'h' },
  { quantity: '10³', prefix: 'kilo', symbol: 'k' },
  { quantity: '10⁶', prefix: 'mega', symbol: 'M' },
  { quantity: '10⁹', prefix: 'giga', symbol: 'G' },
  { quantity: '10¹²', prefix: 'tera', symbol: 'T' },
  { quantity: '10¹⁵', prefix: 'peta', symbol: 'p' }, // Note: Symbol in image is 'p', should be 'P'
  { quantity: '10¹⁸', prefix: 'exa', symbol: 'E' },
  { quantity: '10²¹', prefix: 'zetta', symbol: 'Z' },
  { quantity: '10²⁴', prefix: 'yotta', symbol: 'Y' },
];

export interface RadonDecayStep {
  isotope: string;
  emission: string;
  halfLife: string;
}

export const radonDecayChain: RadonDecayStep[] = [
  { isotope: 'Rn-222', emission: 'α', halfLife: '3.8 day' },
  { isotope: 'Po-218', emission: 'α', halfLife: '3.05 min' },
  { isotope: 'Pb-214', emission: 'β', halfLife: '26.8 min' },
  { isotope: 'Bi-214', emission: 'β', halfLife: '19.7 min' },
  { isotope: 'Po-214', emission: 'α', halfLife: '160 μsec' },
  { isotope: 'Pb-210', emission: 'β', halfLife: '19.4 yr' },
  { isotope: 'Ti-210', emission: 'β', halfLife: '1.32 min' }, // Note: The image seems to have a typo or unusual decay, this is transcribed as seen. It's more commonly Pb-210 -> Bi-210
  { isotope: 'Bi-210', emission: 'β', halfLife: '4.85 day' },
  { isotope: 'Po-210', emission: 'α', halfLife: '1.38 day' }, // Note: Half-life seems short, usually 138 days. Transcribed as seen.
  { isotope: 'Pb-206', emission: '—', halfLife: 'stable' },
];

export interface CoalConsumption {
  growthRate: number;
  '500': number;
  '1000': number;
  '2000': number;
}

export const coalReserveConsumptionYears: CoalConsumption[] = [
  { growthRate: 0, '500': 82, '1000': 164, '2000': 328 },
  { growthRate: 1, '500': 60, '1000': 97, '2000': 145 },
  { growthRate: 2, '500': 49, '1000': 73, '2000': 101 },
  { growthRate: 3, '500': 41, '1000': 59, '2000': 79 },
  { growthRate: 4, '500': 36, '1000': 51, '2000': 66 },
  { growthRate: 5, '500': 33, '1000': 44, '2000': 57 },
];

export interface PopulationStat {
  statistic: string;
  world: string;
  moreDeveloped: string;
  lessDeveloped: string;
  china: string;
  usa: string;
}

export const populationStatistics2006: PopulationStat[] = [
  { statistic: 'Population (millions)', world: '6,555', moreDeveloped: '1,216', lessDeveloped: '4,028', china: '1,311', usa: '299' },
  { statistic: '% of world population', world: '100', moreDeveloped: '19', lessDeveloped: '61', china: '20', usa: '4.6' },
  { statistic: 'Crude birth rate, b', world: '21', moreDeveloped: '11', lessDeveloped: '27', china: '12', usa: '14' },
  { statistic: 'Crude death rate, d', world: '9', moreDeveloped: '10', lessDeveloped: '9', china: '7', usa: '8' },
  { statistic: 'Natural increase, r %', world: '1.2', moreDeveloped: '0.1', lessDeveloped: '1.8', china: '0.5', usa: '0.6' },
  { statistic: '% Population under age 15', world: '29', moreDeveloped: '17', lessDeveloped: '35', china: '20', usa: '20' },
  { statistic: 'Total fertility rate', world: '2.7', moreDeveloped: '1.6', lessDeveloped: '3.4', china: '1.6', usa: '2.0' },
  { statistic: 'Infant mortality rate', world: '52', moreDeveloped: '6', lessDeveloped: '61', china: '27', usa: '6.7' },
  { statistic: '% of total added 2006 to 2050', world: '41', moreDeveloped: '4', lessDeveloped: '63', china: '10', usa: '40' }, // Note: World looks miscalculated in the image (4+63+10+40 != 100), but transcribed as is.
  { statistic: 'Per capita GNIª (US$)', world: '9,190', moreDeveloped: '27,790', lessDeveloped: '4,410', china: '6,600', usa: '41,950' },
  { statistic: '% Urban', world: '48', moreDeveloped: '77', lessDeveloped: '42', china: '37', usa: '79' },
  { statistic: 'Est. population 2025 (millions)', world: '7,940', moreDeveloped: '1,255', lessDeveloped: '5,209', china: '1,476', usa: '349' },
  { statistic: 'Added pop. 2006 to 2025 (millions)', world: '1,385', moreDeveloped: '39', lessDeveloped: '1,181', china: '165', usa: '50' },
];

export interface USPopulationProjection {
  ageInterval: string;
  lx_s: string;
  p_1985: string;
  p_1990: string;
}

export const usPopulationProjection1990: USPopulationProjection[] = [
    { ageInterval: '0–4', lx_s: '0.9979', p_1985: '18,020', p_1990: '18,156' },
    { ageInterval: '5–9', lx_s: '0.9989', p_1985: '17,000', p_1990: '17,982' },
    { ageInterval: '10–14', lx_s: '0.9973', p_1985: '16,068', p_1990: '16,981' },
    { ageInterval: '15–19', lx_s: '0.9951', p_1985: '18,245', p_1990: '16,025' },
    { ageInterval: '20–24', lx_s: '0.9944', p_1985: '20,491', p_1990: '18,156' },
    { ageInterval: '25–29', lx_s: '0.9940', p_1985: '21,896', p_1990: '20,376' },
    { ageInterval: '30–34', lx_s: '0.9927', p_1985: '20,178', p_1990: '21,765' }, // Note: Image P0(1990) for this row is not visible. Calculated 21,896 * 0.9940 = 21765
    { ageInterval: '35–39', lx_s: '0.9898', p_1985: '18,756', p_1990: '20,031' },
    { ageInterval: '40–44', lx_s: '0.9841', p_1985: '14,362', p_1990: '18,564' },
    { ageInterval: '45–49', lx_s: '0.9745', p_1985: '11,912', p_1990: '14,134' },
    { ageInterval: '50–54', lx_s: '0.9597', p_1985: '11,609', p_1990: '11,609' },
    { ageInterval: '55–59', lx_s: '0.9381', p_1985: '11,132', p_1990: '11,141' }, // Note: P0(1990) seems miscalculated in image (11609*0.9597=11141). Transcribed as seen in Px(Thousands) 1990.
    { ageInterval: '60–64', lx_s: '0.9082', p_1985: '10,948', p_1990: '10,314' },
    { ageInterval: '65–69', lx_s: '0.8658', p_1985: '9,420', p_1990: '10,443' },
    { ageInterval: '70–74', lx_s: '0.8050', p_1985: '7,616', p_1990: '9,943' },
    { ageInterval: '75–79', lx_s: '0.7163', p_1985: '5,410', p_1990: '8,156' },
    { ageInterval: '80–84', lx_s: '0.9660', p_1985: '3,312', p_1990: '6,131' }, // Note: Lx_s is likely a typo in the book, should be much lower. Transcribed as seen.
    { ageInterval: '85 and over', lx_s: '0.0000', p_1985: '2,113', p_1990: '3,875' },
];
