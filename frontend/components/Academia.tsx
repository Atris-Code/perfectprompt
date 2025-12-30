import React, { useState, useRef } from 'react';
import { ExperimentationLab } from './ExperimentationLab';
import { CameraMovementGallery } from './CameraMovementGallery';
import { CinematicTechniqueLibrary } from './CinematicTechniqueLibrary';
import { CinematicPromptLibrary } from './CinematicPromptLibrary';
import { CinematicFormulaLibrary } from './CinematicFormulaLibrary';
import { WorkflowManual } from './WorkflowManual';
import { CINEMATIC_PROMPTS } from '../data/cinematicPrompts';
import { CINEMATIC_TECHNIQUES } from '../data/cinematicTechniques';
import { CAMERA_MOVEMENTS } from '../data/cameraMovements';
import { formulaData } from '../data/cinematicFormulas';
import { ALL_VIDEO_PRESETS } from '../data/videoPresets';


const StatCard: React.FC<{ count: number; label: string; icon: React.ReactNode }> = ({ count, label, icon }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md">
    <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-blue-700 text-2xl">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

const AIPromptingPrinciples: React.FC = () => {
  const [openPrinciple, setOpenPrinciple] = useState<number | null>(0);

  const principles = [
    {
      title: 'El Principio del Contexto',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      content: 'La IA no "sabe", solo predice. Cuanto más contexto le des, mejor será su predicción. Trátala como un asistente increíblemente inteligente pero sin memoria a largo plazo. Debes darle toda la información relevante en cada prompt.',
      example: 'Mal: "Escribe sobre coches."\n\nBien: "Escribe un artículo de 500 palabras para un blog de entusiastas del motor sobre la historia y el impacto del Ford Mustang, enfocándote en su diseño de los años 60."',
    },
    {
      title: 'El Principio del Rol',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      content: 'Asignar un rol a la IA es una de las técnicas más poderosas. Al decirle "Actúa como...", la enfocas en un dominio específico, mejorando drásticamente la calidad y el estilo de la respuesta.',
      example: 'En lugar de "Dame ideas de marketing", prueba:\n"Eres un Director de Marketing experto en marcas de lujo. Dame tres ideas innovadoras para lanzar un nuevo reloj suizo."',
    },
    {
      title: 'El Principio del Formato',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
      content: 'Sé explícito sobre cómo quieres la respuesta. Si no especificas el formato, la IA te dará un párrafo de texto por defecto. Pedir formatos específicos es clave para obtener resultados usables.',
      example: 'Pide: "en formato de lista con viñetas", "como una tabla Markdown", "en formato JSON con las claves \'nombre\' y \'descripcion\'", "como un poema haiku".',
    },
    {
      title: 'El Principio del Tono y Estilo',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
      content: 'La IA puede adoptar cualquier estilo de escritura. Define el tono para alinear la respuesta con tu audiencia y objetivo. Un mismo mensaje puede tener un impacto completamente diferente según el tono.',
      example: 'Prueba a añadir modificadores como: "con un tono formal y académico", "con un tono humorístico y sarcástico", "al estilo de un guionista de cine negro".',
    },
    {
      title: 'El Principio de la Restricción',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
      content: 'A veces, lo más importante es decirle a la IA qué NO hacer. Las restricciones evitan que divague o incluya información no deseada, haciendo la salida más precisa.',
      example: 'Añade instrucciones como: "No uses jerga técnica", "Mantén la respuesta por debajo de 100 palabras", "Evita mencionar precios", "No incluyas una conclusión".',
    },
    {
      title: 'El Principio de la Iteración',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4 9a9 9 0 109-9" /></svg>,
      content: 'El primer prompt rara vez es el último. Considera la interacción con la IA como una conversación. Usa la primera respuesta como base y refínala con prompts sucesivos.',
      example: 'Prompt 1: "Dame ideas para un post de blog."\nPrompt 2 (después de la respuesta): "Me gusta la idea 3. Expándela en un esquema de 5 puntos con un título atractivo."',
    }
  ];

  return (
    <section className="mb-12">
      <div className="p-8 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Principios Fundamentales de la Interacción con IA</h2>
        <p className="text-md text-gray-600 text-center mb-8">Domina estas seis reglas para transformar tus ideas en prompts de clase mundial.</p>
        <div className="space-y-3">
          {principles.map((principle, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50/50">
              <button
                type="button"
                onClick={() => setOpenPrinciple(openPrinciple === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-gray-100"
                aria-expanded={openPrinciple === index}
              >
                <span className="flex items-center">
                  <span className="text-blue-600 mr-3">{principle.icon}</span>
                  {principle.title}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform duration-300 text-gray-500 ${openPrinciple === index ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openPrinciple === index ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="p-5 border-t border-gray-200 bg-white">
                  <p className="text-gray-600 mb-4">{principle.content}</p>
                  <pre className="text-sm bg-gray-100 text-gray-700 p-3 rounded-md whitespace-pre-wrap font-mono">{principle.example}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CinematicContrastMatrix: React.FC = () => {
    const angles = CINEMATIC_TECHNIQUES.filter(t => t.type === 'Ángulo');
    const movements = CINEMATIC_TECHNIQUES.filter(t => t.type === 'Movimiento');
    const visualStyles = ALL_VIDEO_PRESETS.filter(p => p.category === "Estilos Visuales y Fílmicos");
    const lightingStyles = [
        { name: "Chiaroscuro (Alto Contraste)", prompt_block: "dramatic chiaroscuro lighting, deep shadows" },
        { name: "High Key (Bajo Contraste)", prompt_block: "high-key lighting, bright, soft, minimal shadows" },
        { name: "Luz Natural (Suave)", prompt_block: "soft, diffused natural light from a large window" },
        { name: "Hora Dorada (Atardecer)", prompt_block: "warm, golden hour lighting creating long shadows" },
        { name: "Luz de Neón (Urbano Nocturno)", prompt_block: "lit by neon signs, with colorful reflections on wet surfaces" },
        { name: "Volumétrica (Rayos de Luz)", prompt_block: "dramatic volumetric lighting (god rays) cutting through atmospheric haze" }
    ];

    const [selectedAngle, setSelectedAngle] = useState('');
    const [selectedMovement, setSelectedMovement] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [selectedLighting, setSelectedLighting] = useState('');
    const [combinedPrompt, setCombinedPrompt] = useState('');
    const [isPromptCopied, setIsPromptCopied] = useState(false);

    const generateCombinedPrompt = () => {
        const parts = [];
        if (selectedAngle) {
            const angle = angles.find(a => a.id === selectedAngle);
            if (angle) parts.push(angle.prompt_block);
        }
        if (selectedMovement) {
            const movement = movements.find(m => m.id === selectedMovement);
            if (movement) parts.push(movement.prompt_block);
        }
        if (selectedLighting) {
            const lighting = lightingStyles.find(l => l.name === selectedLighting);
            if (lighting) parts.push(lighting.prompt_block);
        }
        if (selectedStyle) {
            const style = visualStyles.find(s => s.preset_name === selectedStyle);
            if (style) parts.push(style.prompt_block);
        }

        const prompt = parts.join(', ');
        setCombinedPrompt(prompt);
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(combinedPrompt).then(() => {
            setIsPromptCopied(true);
            setTimeout(() => setIsPromptCopied(false), 2000);
        });
    };

    return (
        <section className="mt-12">
            <div className="p-8 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Matriz de Contraste Cinematográfico</h2>
                <p className="text-md text-gray-600 text-center mb-8">Experimenta combinando diferentes elementos cinematográficos para crear un prompt único.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ángulo de Cámara</label>
                        <select value={selectedAngle} onChange={e => setSelectedAngle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Ninguno</option>
                            {angles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Movimiento de Cámara</label>
                        <select value={selectedMovement} onChange={e => setSelectedMovement(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Ninguno</option>
                            {movements.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estilo de Iluminación</label>
                        <select value={selectedLighting} onChange={e => setSelectedLighting(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Ninguno</option>
                            {lightingStyles.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estilo Visual / Color</label>
                        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="">Ninguno</option>
                            {visualStyles.map(s => <option key={s.preset_name} value={s.preset_name}>{s.preset_name}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={generateCombinedPrompt} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Generar Prompt Combinado
                </button>

                {combinedPrompt && (
                    <div className="mt-6 relative p-4 bg-gray-800 text-gray-100 rounded-lg shadow-inner">
                        <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase">Prompt Combinado</h4>
                        <pre className="whitespace-pre-wrap text-sm font-mono">{combinedPrompt}</pre>
                        <button onClick={handleCopy} className="absolute top-2 right-2 bg-green-500 text-white font-bold py-1 px-2 rounded-md hover:bg-green-600 text-xs">{isPromptCopied ? '¡Copiado!' : 'Copiar'}</button>
                    </div>
                )}
            </div>
        </section>
    );
};


export const Academia: React.FC = () => {
  const [labAction, setLabAction] = useState('');
  const labRef = useRef<HTMLDivElement>(null);

  const handleUsePromptInLab = (prompt: string) => {
    setLabAction(prompt);
    labRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Focus the textarea after scrolling
    setTimeout(() => {
        const textarea = document.getElementById('action');
        if (textarea) {
            textarea.focus();
        }
    }, 500); // 500ms should be enough for smooth scroll
  };
  
  const stats = {
    prompts: CINEMATIC_PROMPTS.length + (formulaData[0]?.prompts?.length || 0),
    techniques: CINEMATIC_TECHNIQUES.length,
    movements: CAMERA_MOVEMENTS.length
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Módulo Academia</h2>
        <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
          Un espacio interactivo para aprender y dominar el arte de la cinematografía y la creación de prompts, fusionando la teoría con la práctica.
        </p>
      </header>

      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          count={stats.prompts}
          label="Prompts Cinematográficos"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard 
          count={stats.techniques}
          label="Técnicas Cinematográficas"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard 
          count={stats.movements}
          label="Movimientos Compuestos"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      <AIPromptingPrinciples />
      <WorkflowManual />
      
      <CinematicContrastMatrix />

      <div ref={labRef}>
        <ExperimentationLab action={labAction} onActionChange={setLabAction} />
      </div>

      <CinematicFormulaLibrary onUseInLab={handleUsePromptInLab} />
      <CinematicPromptLibrary onUseInLab={handleUsePromptInLab} />
      <CinematicTechniqueLibrary />
      <CameraMovementGallery />
    </div>
  );
};
