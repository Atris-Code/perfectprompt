import React, { useState, useMemo } from 'react';
import { 
    conversionFactors, 
    elementProperties, 
    fluidProperties, 
    universalConstants, 
    waterPropertiesByTemp,
    metricPrefixes,
    radonDecayChain,
    coalReserveConsumptionYears,
    populationStatistics2006,
    usPopulationProjection1990
} from '../data/scientificData';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
      active
        ? 'border-blue-600 text-blue-700'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode; subTitle?: string }> = ({ title, subTitle, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">{title}</h3>
        {subTitle && <p className="text-sm text-gray-500 mb-4">{subTitle}</p>}
        {children}
    </div>
);

const ScientificAppendixModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('conversions');
  const [searchTerm, setSearchTerm] = useState('');

  const lowercasedSearchTerm = searchTerm.toLowerCase();

  const filteredConversionFactors = useMemo(() => {
    if (!lowercasedSearchTerm) return conversionFactors;
    return conversionFactors.map(category => ({
      ...category,
      conversions: category.conversions.filter(conv =>
        conv.from.toLowerCase().includes(lowercasedSearchTerm) ||
        conv.to.toLowerCase().includes(lowercasedSearchTerm)
      )
    })).filter(category => category.conversions.length > 0);
  }, [lowercasedSearchTerm]);

  const filteredElementProperties = useMemo(() => {
    if (!lowercasedSearchTerm) return elementProperties;
    return elementProperties.filter(el =>
      el.element.toLowerCase().includes(lowercasedSearchTerm) ||
      el.symbol.toLowerCase().includes(lowercasedSearchTerm) ||
      String(el.atomicNumber).includes(lowercasedSearchTerm)
    );
  }, [lowercasedSearchTerm]);
  
  const filteredWaterProperties = useMemo(() => {
    if (!lowercasedSearchTerm) return waterPropertiesByTemp;
    return waterPropertiesByTemp.filter(prop =>
      String(prop.temp).includes(lowercasedSearchTerm)
    );
  }, [lowercasedSearchTerm]);

  const filteredUniversalConstants = useMemo(() => {
    if (!lowercasedSearchTerm) return universalConstants;
    return universalConstants.filter(c =>
      c.name.toLowerCase().includes(lowercasedSearchTerm) ||
      c.symbol.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [lowercasedSearchTerm]);

  const filteredMetricPrefixes = useMemo(() => {
    if (!lowercasedSearchTerm) return metricPrefixes;
    return metricPrefixes.filter(p =>
        p.prefix.toLowerCase().includes(lowercasedSearchTerm) ||
        p.symbol.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [lowercasedSearchTerm]);

  const filteredRadonDecayChain = useMemo(() => {
    if (!lowercasedSearchTerm) return radonDecayChain;
    return radonDecayChain.filter(step =>
        step.isotope.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [lowercasedSearchTerm]);

  const filteredCoalConsumption = useMemo(() => {
      if (!lowercasedSearchTerm) return coalReserveConsumptionYears;
      return coalReserveConsumptionYears.filter(row => 
          String(row.growthRate).includes(lowercasedSearchTerm)
      );
  }, [lowercasedSearchTerm]);

  const filteredPopulationStats = useMemo(() => {
      if (!lowercasedSearchTerm) return populationStatistics2006;
      return populationStatistics2006.filter(stat =>
          stat.statistic.toLowerCase().includes(lowercasedSearchTerm)
      );
  }, [lowercasedSearchTerm]);
  
  const filteredUSPopulation = useMemo(() => {
      if (!lowercasedSearchTerm) return usPopulationProjection1990;
      return usPopulationProjection1990.filter(row =>
          row.ageInterval.toLowerCase().includes(lowercasedSearchTerm)
      );
  }, [lowercasedSearchTerm]);


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appendix-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <h3 id="appendix-modal-title" className="text-xl font-bold text-gray-800">Apéndice Científico Local</h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 rounded-full hover:bg-gray-200">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <nav className="border-b px-5 flex-shrink-0 overflow-x-auto">
            <div className="flex space-x-2 -mb-px">
                <TabButton active={activeTab === 'conversions'} onClick={() => setActiveTab('conversions')}>Factores de Conversión</TabButton>
                <TabButton active={activeTab === 'elements'} onClick={() => setActiveTab('elements')}>Propiedades de Elementos</TabButton>
                <TabButton active={activeTab === 'fluids'} onClick={() => setActiveTab('fluids')}>Propiedades de Fluidos</TabButton>
                <TabButton active={activeTab === 'water'} onClick={() => setActiveTab('water')}>Propiedades del Agua</TabButton>
                <TabButton active={activeTab === 'constants'} onClick={() => setActiveTab('constants')}>Constantes Universales</TabButton>
                <TabButton active={activeTab === 'prefixes'} onClick={() => setActiveTab('prefixes')}>Prefijos Métricos</TabButton>
                <TabButton active={activeTab === 'radon'} onClick={() => setActiveTab('radon')}>Desintegración Radón</TabButton>
                <TabButton active={activeTab === 'coal'} onClick={() => setActiveTab('coal')}>Reservas Carbón</TabButton>
                <TabButton active={activeTab === 'population'} onClick={() => setActiveTab('population')}>Población (2006)</TabButton>
                <TabButton active={activeTab === 'us_population'} onClick={() => setActiveTab('us_population')}>Población EEUU (1990)</TabButton>
            </div>
        </nav>

        <div className="p-6 border-b flex-shrink-0">
            <input
              type="search"
              placeholder="Buscar en la pestaña actual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>

        <main className="p-8 overflow-y-auto">
          {activeTab === 'conversions' && (
            <div>
              {filteredConversionFactors.map(category => (
                <Section key={category.category} title={category.category}>
                  <table className="w-full text-sm text-left text-gray-700 border-collapse">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-4 py-2 border">Conversión (Original)</th>
                            <th scope="col" className="px-4 py-2 border">Conversión (Estándar)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {category.conversions.map(conv => (
                            <tr key={conv.from} className="bg-white border-b">
                                <td className="px-4 py-2 border font-mono">{conv.from}</td>
                                <td className="px-4 py-2 border font-mono">{conv.to}</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </Section>
              ))}
            </div>
          )}
          {activeTab === 'elements' && (
            <Section title="Tabla Periódica de los Elementos">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 border-collapse whitespace-nowrap">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                      <tr>
                          <th scope="col" className="px-3 py-2 border">Elemento</th>
                          <th scope="col" className="px-3 py-2 border">Símbolo</th>
                          <th scope="col" className="px-3 py-2 border">N° Atómico</th>
                          <th scope="col" className="px-3 py-2 border">Peso Atómico</th>
                          <th scope="col" className="px-3 py-2 border">Valencia</th>
                          <th scope="col" className="px-3 py-2 border">Edo. Oxidación</th>
                          <th scope="col" className="px-3 py-2 border">Electronegatividad</th>
                          <th scope="col" className="px-3 py-2 border">Radio Iónico (pm)</th>
                          <th scope="col" className="px-3 py-2 border">1er Pot. Ionización (kJ/mol)</th>
                          <th scope="col" className="px-3 py-2 border">2do Pot. Ionización (kJ/mol)</th>
                          <th scope="col" className="px-3 py-2 border">Pot. Estándar (V)</th>
                          <th scope="col" className="px-3 py-2 border">Densidad (g/cm³)</th>
                          <th scope="col" className="px-3 py-2 border">Pto. Ebullición (°C)</th>
                          <th scope="col" className="px-3 py-2 border">Pto. Fusión (°C)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredElementProperties.map(el => (
                          <tr key={el.symbol} className="bg-white border-b">
                              <td className="px-3 py-2 border font-semibold">{el.element}</td>
                              <td className="px-3 py-2 border font-mono text-center">{el.symbol}</td>
                              <td className="px-3 py-2 border text-center">{el.atomicNumber}</td>
                              <td className="px-3 py-2 border font-mono text-right">{el.atomicWeight}</td>
                              <td className="px-3 py-2 border text-center">{el.valence || 'N/A'}</td>
                              <td className="px-3 py-2 border text-center">{el.oxidationState || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.electronegativity || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.ionicRadius || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.firstIonizationPotential || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.secondIonizationPotential || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.standardPotential || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.density || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.boilingPoint || 'N/A'}</td>
                              <td className="px-3 py-2 border text-right">{el.meltingPoint || 'N/A'}</td>
                          </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
          {activeTab === 'fluids' && (
             <div>
                <Section title="Densidad y Viscosidad del Agua y el Aire (Condiciones Estándar)">
                    <table className="w-full text-sm text-left text-gray-700 border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-2 border">Fluido</th>
                                <th scope="col" className="px-4 py-2 border">Densidad</th>
                                <th scope="col" className="px-4 py-2 border">Viscosidad Dinámica</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b">
                                <td className="px-4 py-2 border font-semibold">Agua</td>
                                <td className="px-4 py-2 border font-mono">{fluidProperties.water.density}</td>
                                <td className="px-4 py-2 border font-mono">{fluidProperties.water.viscosity}</td>
                            </tr>
                            <tr className="bg-white border-b">
                                <td className="px-4 py-2 border font-semibold">Aire</td>
                                <td className="px-4 py-2 border font-mono">{fluidProperties.air.density}</td>
                                <td className="px-4 py-2 border font-mono">{fluidProperties.air.viscosity}</td>
                            </tr>
                        </tbody>
                    </table>
                </Section>
             </div>
          )}
           {activeTab === 'water' && (
            <Section title="Propiedades del Agua a Diferentes Temperaturas">
              <table className="w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="px-4 py-2 border">Temperatura (°C)</th>
                        <th scope="col" className="px-4 py-2 border">Densidad (kg/m³)</th>
                        <th scope="col" className="px-4 py-2 border">Viscosidad Dinámica (mPa·s)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWaterProperties.map(prop => (
                        <tr key={prop.temp} className="bg-white border-b">
                            <td className="px-4 py-2 border text-center">{prop.temp}</td>
                            <td className="px-4 py-2 border font-mono text-right">{prop.density}</td>
                            <td className="px-4 py-2 border font-mono text-right">{prop.viscosity}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </Section>
          )}
           {activeTab === 'constants' && (
            <Section title="Constantes Universales Útiles">
              <table className="w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="px-4 py-2 border">Constante</th>
                        <th scope="col" className="px-4 py-2 border">Símbolo</th>
                        <th scope="col" className="px-4 py-2 border">Valor y Unidades</th>
                        <th scope="col" className="px-4 py-2 border">Categoría</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUniversalConstants.map(c => (
                        <tr key={c.name} className="bg-white border-b">
                            <td className="px-4 py-2 border font-semibold">{c.name}</td>
                            <td className="px-4 py-2 border font-mono text-center">{c.symbol}</td>
                            <td className="px-4 py-2 border font-mono">{c.value} {c.units}</td>
                            <td className="px-4 py-2 border text-center">{c.category}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </Section>
          )}
          {activeTab === 'prefixes' && (
            <Section title="Prefijos Métricos Comunes">
              <table className="w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 border">Cantidad</th>
                    <th scope="col" className="px-4 py-2 border">Prefijo</th>
                    <th scope="col" className="px-4 py-2 border">Símbolo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetricPrefixes.map(p => (
                    <tr key={p.prefix} className="bg-white border-b">
                      <td className="px-4 py-2 border font-mono">{p.quantity}</td>
                      <td className="px-4 py-2 border">{p.prefix}</td>
                      <td className="px-4 py-2 border font-mono text-center">{p.symbol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
          {activeTab === 'radon' && (
            <Section title="Vidas Medias de la Cadena de Desintegración del Radón">
              <table className="w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 border">Isótopo</th>
                    <th scope="col" className="px-4 py-2 border">Emisión</th>
                    <th scope="col" className="px-4 py-2 border">Vida Media</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRadonDecayChain.map(s => (
                    <tr key={s.isotope} className="bg-white border-b">
                      <td className="px-4 py-2 border font-mono">{s.isotope}</td>
                      <td className="px-4 py-2 border font-mono text-center">{s.emission}</td>
                      <td className="px-4 py-2 border font-mono">{s.halfLife}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
          {activeTab === 'coal' && (
            <Section title="Años para Consumir Reservas de Carbón" subTitle="Asumiendo varias estimaciones de reserva y diferentes tasas de crecimiento de producción.">
              <table className="w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 border align-bottom" rowSpan={2}>Tasa de Crecimiento (%)</th>
                    <th scope="col" className="px-4 py-2 border text-center" colSpan={3}>Reservas (Billones de toneladas) - Años</th>
                  </tr>
                  <tr>
                    <th scope="col" className="px-4 py-2 border text-center font-semibold">500</th>
                    <th scope="col" className="px-4 py-2 border text-center font-semibold">1,000</th>
                    <th scope="col" className="px-4 py-2 border text-center font-semibold">2,000</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoalConsumption.map(row => (
                    <tr key={row.growthRate} className="bg-white border-b">
                      <td className="px-4 py-2 border text-center font-mono">{row.growthRate}</td>
                      <td className="px-4 py-2 border text-center font-mono">{row['500']}</td>
                      <td className="px-4 py-2 border text-center font-mono">{row['1000']}</td>
                      <td className="px-4 py-2 border text-center font-mono">{row['2000']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2"><sup>a</sup>Producción inicial 6.1 billones de toneladas/año (2005); reservas actuales estimadas en 1,100 billones de toneladas.</p>
            </Section>
          )}
          {activeTab === 'population' && (
             <Section title="Estadísticas de Población (2006)">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 border-collapse whitespace-nowrap">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                        <tr>
                            <th scope="col" className="px-3 py-2 border">Estadística</th>
                            <th scope="col" className="px-3 py-2 border">Mundo</th>
                            <th scope="col" className="px-3 py-2 border">Países Más Desarrollados</th>
                            <th scope="col" className="px-3 py-2 border">Países Menos Desarrollados (Excl. China)</th>
                            <th scope="col" className="px-3 py-2 border">China</th>
                            <th scope="col" className="px-3 py-2 border">EE. UU.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPopulationStats.map(stat => (
                            <tr key={stat.statistic} className="bg-white border-b">
                                <td className="px-3 py-2 border font-semibold">{stat.statistic}</td>
                                <td className="px-3 py-2 border font-mono text-right">{stat.world}</td>
                                <td className="px-3 py-2 border font-mono text-right">{stat.moreDeveloped}</td>
                                <td className="px-3 py-2 border font-mono text-right">{stat.lessDeveloped}</td>
                                <td className="px-3 py-2 border font-mono text-right">{stat.china}</td>
                                <td className="px-3 py-2 border font-mono text-right">{stat.usa}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
             </Section>
          )}
          {activeTab === 'us_population' && (
            <Section title="Proyección de Población de EE. UU. 1990" subTitle="Basado en la estructura de edad de 1985 (ignorando inmigración).">
                <table className="w-full text-sm text-left text-gray-700 border-collapse">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th rowSpan={2} className="px-4 py-2 border align-bottom">Intervalo de Edad</th>
                            <th rowSpan={2} className="px-4 py-2 border align-bottom">Lₓ₊₅/Lₓ</th>
                            <th colSpan={2} className="px-4 py-2 border text-center">Pₓ (Miles)</th>
                        </tr>
                        <tr>
                            <th className="px-4 py-2 border text-center font-semibold">1985</th>
                            <th className="px-4 py-2 border text-center font-semibold">1990</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUSPopulation.map(row => (
                            <tr key={row.ageInterval} className="bg-white border-b">
                                <td className="px-4 py-2 border font-mono">{row.ageInterval}</td>
                                <td className="px-4 py-2 border font-mono text-right">{row.lx_s}</td>
                                <td className="px-4 py-2 border font-mono text-right">{row.p_1985}</td>
                                <td className="px-4 py-2 border font-mono text-right">{row.p_1990}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScientificAppendixModal;