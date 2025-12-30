import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transform animate-scale-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 id="about-modal-title" className="text-2xl font-bold text-gray-900">
            Acerca del Creador de Prompt Perfecto
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-8 overflow-y-auto space-y-6">
          <section>
            <h4 className="font-bold text-lg text-blue-700 mb-2">Propósito de la Aplicación</h4>
            <p className="text-gray-700 leading-relaxed">
              El <strong>Creador de Prompt Perfecto</strong> es una superherramienta creativa diseñada para ayudarte a construir prompts de alta calidad para cualquier IA generativa. Utilizando el poder de la <strong>API de Gemini de Google</strong>, esta aplicación refina tus ideas y las convierte en instrucciones claras y detalladas, asegurando que obtengas los mejores resultados posibles de los modelos de IA.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-lg text-blue-700 mb-3">¿Cómo se usa?</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4">1</div>
                <div>
                  <h5 className="font-semibold text-gray-800">Selecciona tu Módulo</h5>
                  <p className="text-gray-600">Comienza eligiendo uno de los tres módulos principales en la barra lateral izquierda según tu necesidad.</p>
                </div>
              </li>
              <li className="pl-12 border-l-2 border-gray-200 ml-4 pb-4">
                <details className="space-y-2 group" open>
                  <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    Creador de Prompt
                  </summary>
                  <div className="pl-6 space-y-3 text-gray-600">
                    <p>El corazón de la aplicación. Aquí es donde construyes tu prompt base.</p>
                    <p>• <strong>Para Texto, Audio y Código</strong>: Define tu objetivo y la IA creará un prompt directo y efectivo.</p>
                    <p>• <strong>Para Imagen</strong>: Describe tu visión, fusiona estilos de la biblioteca y genera prompts detallados.</p>
                    <p>• <strong>Para Video</strong>: Tienes dos modos potentes:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>
                            <strong>Constructor Manual</strong>: Elige y combina presets individuales de cámara, estilo, efectos y sonido para dirigir tu propia escena.
                        </li>
                        <li>
                            <strong>Agente Guionista Documental</strong>: ¡Transforma una idea en un guion completo! Dale al agente herramientas visuales para trabajar:
                            <ul className="list-['-_'] pl-5 mt-2 space-y-1">
                                <li><strong>Control Específico ('Narrador Visual')</strong>: Asigna estilos precisos para <strong>Entrevistas, Material de Archivo, B-Roll y Recreaciones</strong>.</li>
                                <li><strong>Estilo General ('Paquetes de Género')</strong>: Define la atmósfera global con paquetes como <strong>Cinéma Vérité</strong> o <strong>Naturaleza Épica</strong>.</li>
                            </ul>
                             <p className="mt-2 text-sm p-3 bg-blue-50 rounded-md border border-blue-200 text-blue-800">La IA combina de forma inteligente ambos sistemas, priorizando tus selecciones específicas para un control máximo con una coherencia profesional.</p>
                        </li>
                    </ul>
                  </div>
                </details>
              </li>
               <li className="pl-12 border-l-2 border-gray-200 ml-4 pb-4">
                <details className="space-y-2 group">
                  <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    Biblioteca de Estilos
                  </summary>
                  <p className="text-gray-600 pl-6">Explora una vasta colección de estilos artísticos y de video. Inspírate, copia paletas de colores, aplica combinaciones de presets de video a tus proyectos y añade tus propios estilos personalizados.</p>
                </details>
              </li>
              <li className="pl-12 border-l-2 border-gray-200 ml-4">
                <details className="space-y-2 group">
                   <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transition-transform transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    IA Pro Studio
                  </summary>
                  <p className="text-gray-600 pl-6">Para un control total sobre la imagen. Este módulo te permite actuar como un director de arte, especificando detalles técnicos avanzados como la composición, la teoría del color, el tipo de lente y la post-producción.</p>
                </details>
              </li>

              <li className="flex items-start mt-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4">2</div>
                <div>
                  <h5 className="font-semibold text-gray-800">Genera y Utiliza</h5>
                  <p className="text-gray-600">Haz clic en "Generar" y observa cómo la IA procesa tu solicitud. Copia el resultado para usarlo en tu plataforma de IA favorita. Si generas un prompt de imagen, ¡incluso puedes generar la imagen directamente aquí!</p>
                </div>
              </li>
            </ul>
          </section>

          <div className="text-center pt-4 text-sm text-gray-500">
            <p>Hecho con ❤️ y la magia de la IA Generativa.</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AboutModal;