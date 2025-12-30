export interface Unit {
  name: string;
  symbol: string;
  toBase: number;
}

export interface PhysicalQuantity {
  name: string;
  baseUnit: string;
  units: Unit[];
}

export const PHYSICAL_QUANTITIES: PhysicalQuantity[] = [
  {
    name: 'Tiempo',
    baseUnit: 's',
    units: [
      { name: 'nanosegundo', symbol: 'ns', toBase: 1e-9 },
      { name: 'microsegundo', symbol: 'μs', toBase: 1e-6 },
      { name: 'milisegundo', symbol: 'ms', toBase: 1e-3 },
      { name: 'segundo', symbol: 's', toBase: 1 },
      { name: 'minuto', symbol: 'min', toBase: 60 },
      { name: 'hora', symbol: 'h', toBase: 3600 },
      { name: 'día', symbol: 'd', toBase: 86400 },
      { name: 'semana', symbol: 'sem', toBase: 604800 },
      { name: 'año', symbol: 'año', toBase: 31536000 },
    ],
  },
  {
    name: 'Longitud',
    baseUnit: 'm',
    units: [
      { name: 'milímetro', symbol: 'mm', toBase: 0.001 },
      { name: 'centímetro', symbol: 'cm', toBase: 0.01 },
      { name: 'metro', symbol: 'm', toBase: 1 },
      { name: 'kilómetro', symbol: 'km', toBase: 1000 },
      { name: 'pulgada', symbol: 'in', toBase: 0.0254 },
      { name: 'pie', symbol: 'ft', toBase: 0.3048 },
      { name: 'yarda', symbol: 'yd', toBase: 0.9144 },
      { name: 'milla', symbol: 'mi', toBase: 1609.34 },
    ],
  },
  {
    name: 'Masa',
    baseUnit: 'kg',
    units: [
      { name: 'miligramo', symbol: 'mg', toBase: 1e-6 },
      { name: 'gramo', symbol: 'g', toBase: 1e-3 },
      { name: 'kilogramo', symbol: 'kg', toBase: 1 },
      { name: 'tonelada', symbol: 't', toBase: 1000 },
      { name: 'onza', symbol: 'oz', toBase: 0.0283495 },
      { name: 'libra', symbol: 'lb', toBase: 0.453592 },
    ],
  },
  {
    name: 'Energía',
    baseUnit: 'J',
    units: [
      { name: 'julio', symbol: 'J', toBase: 1 },
      { name: 'kilojulio', symbol: 'kJ', toBase: 1000 },
      { name: 'caloría', symbol: 'cal', toBase: 4.184 },
      { name: 'kilocaloría', symbol: 'kcal', toBase: 4184 },
      { name: 'vatio-hora', symbol: 'Wh', toBase: 3600 },
      { name: 'kilovatio-hora', symbol: 'kWh', toBase: 3.6e6 },
      { name: 'electronvoltio', symbol: 'eV', toBase: 1.60218e-19 },
    ],
  },
  {
    name: 'Presión',
    baseUnit: 'Pa',
    units: [
      { name: 'pascal', symbol: 'Pa', toBase: 1 },
      { name: 'kilopascal', symbol: 'kPa', toBase: 1000 },
      { name: 'megapascal', symbol: 'MPa', toBase: 1e6 },
      { name: 'bar', symbol: 'bar', toBase: 100000 },
      { name: 'atmósfera', symbol: 'atm', toBase: 101325 },
      { name: 'psi', symbol: 'psi', toBase: 6894.76 },
      { name: 'torr', symbol: 'torr', toBase: 133.322 },
    ],
  },
  {
    name: 'Frecuencia',
    baseUnit: 'Hz',
    units: [
      { name: 'hercio', symbol: 'Hz', toBase: 1 },
      { name: 'kilohercio', symbol: 'kHz', toBase: 1e3 },
      { name: 'megahercio', symbol: 'MHz', toBase: 1e6 },
      { name: 'gigahercio', symbol: 'GHz', toBase: 1e9 },
    ],
  },
];
