import React from 'react';

const Icon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-3 text-gray-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

export const WorkflowManual: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="p-8 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Manual de Flujo de Trabajo: De la Teoría al Resultado Final</h2>
        <p className="text-md text-gray-600 text-center mb-8">El sistema está diseñado para seguir un camino lógico: <strong>Aprender → Inspirarse → Crear → Perfeccionar</strong>.</p>
        
        <div className="mb-12">
          <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">I. Fase de Conceptualización y Conocimiento</h3>
          <div className="overflow-x-auto">
            <div className="min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Módulo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Objetivo Principal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paso a Paso</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Relación con otros Módulos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          <span className="font-semibold text-gray-900">Academia</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed"><strong className="font-semibold text-blue-600">Fundamentos:</strong> Aprender los principios cinematográficos (ángulos, iluminación, movimiento).</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">1. Explorar lecciones sobre un tema específico (ej. <strong className="font-semibold text-blue-600">Plano Holandés</strong>).<br/>2. Entender el <strong className="font-semibold text-blue-600">propósito dramático</strong> de esa técnica.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Proporciona el <strong className="font-semibold text-blue-600">lenguaje técnico</strong> para el Creador de Prompt y el Editor PEP.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          <span className="font-semibold text-gray-900">Galería de Inspiración</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed"><strong className="font-semibold text-blue-600">Referencia Visual:</strong> Almacenar prompts de alta calidad y estilos para reutilizar.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">3. Seleccionar un prompt existente (ej. <em className="italic text-blue-600">El Eco Imposible</em>).<br/>4. Copiar su estructura para modificarla.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Proporciona la <strong className="font-semibold text-blue-600">Capa Base</strong> para el Creador de Prompt y el <strong className="font-semibold text-blue-600">Estilo de Referencia</strong> para el Editor PEP.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">II. Fase de Creación (Editor Profesional PEP)</h3>
          <p className="text-sm text-gray-600 mb-4">Este flujo se centra en la edición avanzada de una imagen, demostrando la interacción de todas las nuevas herramientas:</p>
          <div className="overflow-x-auto">
             <div className="min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Módulo/Campo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acción del Usuario</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Justificación Técnica</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Relación con la Academia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          <span className="font-semibold text-gray-900">1. Imagen de Origen</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Cargar la foto a editar.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed">Establece el punto de partida visual.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">N/A</td>
                    </tr>
                     <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          <span className="font-semibold text-gray-900">2. Plantillas de Edición</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Seleccionar <strong className="font-semibold text-blue-600">MOOD</strong> (ej. Moda Editorial) y <strong className="font-semibold text-blue-600">TIPO</strong> (ej. Cambio de Atmósfera).</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed">Define el objetivo general de la edición.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Vincula la edición a una industria.</td>
                    </tr>
                     <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          <span className="font-semibold text-gray-900">3. Composición (PEP)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Elegir <strong className="font-semibold text-blue-600">Ángulo Bajo</strong> y <strong className="font-semibold text-blue-600">Regla de Tercios</strong>.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed"><strong className="font-semibold text-blue-600">Control Estructural:</strong> Dicta la relación de poder del sujeto y la composición.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Aplica la lección de <strong className="font-semibold text-blue-600">Ángulos</strong> y <strong className="font-semibold text-blue-600">Reglas Fotográficas</strong> de la Academia.</td>
                    </tr>
                     <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                           <Icon path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <span className="font-semibold text-gray-900">4. Dirección de Expresión</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Escribir: <em>Intensificar la mirada, con tensión sutil en la mandíbula.</em></td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed"><strong className="font-semibold text-blue-600">Control Emocional:</strong> Corrige o refina el <em>acting</em> post-producción.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Usa el lenguaje de la <strong className="font-semibold text-blue-600">Dirección de Actores</strong> enseñado en la Academia.</td>
                    </tr>
                     <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M12 22l-8.31-14h16.62L12 22z" className="h-5 w-5 mr-3 text-gray-400 rotate-90" />
                          <span className="font-semibold text-gray-900">5. Apertura (f-stop)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Seleccionar <strong className="font-semibold text-blue-600">f/1.4</strong> (Bokeh Máximo).</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed"><strong className="font-semibold text-blue-600">Control Óptico:</strong> Dicta la profundidad de campo y el foco narrativo.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Aplica la lección sobre <strong className="font-semibold text-blue-600">Lentes y Profundidad de Campo</strong>.</td>
                    </tr>
                     <tr>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center">
                          <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          <span className="font-semibold text-gray-900">6. Instrucciones Manuales</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Añadir detalles: <em>Aplicar luz de borde azul cian.</em></td>
                      <td className="px-6 py-4 align-top text-sm text-gray-600 italic leading-relaxed"><strong className="font-semibold text-blue-600">Refinamiento:</strong> Ajustes finales no cubiertos por los presets.</td>
                      <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">III. Fase de Validación y Mejora (Feedback Loop)</h3>
          <div className="overflow-x-auto">
             <div className="min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Módulo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Función de Asistencia</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Resultado para el Usuario</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Propósito de Mejora</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                          <td className="px-6 py-4 align-top font-semibold text-gray-900">Feedback de Consistencia Narrativa (FCN)</td>
                          <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">Mide el <strong>Índice de Cohesión</strong> de las Capas (ej. Ángulo Bajo + Iluminación Suave).</td>
                          <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">El sistema devuelve una puntuación de [-9 a +9] y un análisis justificando el resultado.</td>
                          <td className="px-6 py-4 align-top text-sm text-gray-800 leading-relaxed">El usuario aprende <em>por qué</em> una combinación funciona o falla, cerrando el ciclo de aprendizaje y volviendo a la <strong>Academia</strong> con un conocimiento práctico.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
           <p className="text-sm text-gray-600 mt-4 italic">Este manual asegura que cada módulo no sea solo una herramienta independiente, sino una etapa coherente en el proceso creativo del usuario.</p>
        </div>
      </div>
    </section>
  );
};
