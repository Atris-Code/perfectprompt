import React from 'react';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-3xl font-bold text-cyan-400 mb-4 pb-2 border-b border-gray-700">{title}</h2>
    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
      {children}
    </div>
  </section>
);

export const Manifesto: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white p-8 rounded-lg min-h-full font-sans">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold">Manifiesto del Nexo Sinérgico</h1>
        <p className="text-xl text-gray-400 mt-4">De los Datos al Discurso. Del Conflicto al Consenso.</p>
        <p className="mt-6 max-w-3xl mx-auto text-gray-300">Este es el documento. Es la brújula para cualquiera que se una o invierta en este ecosistema.</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-12">
        <Section title="1. Nuestra Visión">
          <p>El "Nexo Sinérgico" nace de una convicción: los problemas más complejos de nuestro tiempo, como la economía circular y la sostenibilidad industrial, no pueden resolverse en silos.</p>
          <p>No somos una plataforma de simulación. No somos una herramienta creativa. Somos un <strong>ecosistema de innovación aumentada</strong> diseñado para gestionar el ciclo de vida completo de una idea: desde su concepción analítica hasta su comunicación estratégica y su gobernanza colaborativa.</p>
          <p>Unimos la rigorosidad del "Ala Analítica" con el poder narrativo del "Ala Creativa".</p>
        </Section>

        <Section title="2. Nuestra Filosofía: Los 4 Pilares">
          <ol className="space-y-6">
            <li>
              <strong>Más Allá de los Silos:</strong> Creemos que un científico de datos, un consultor financiero, un líder comunitario y un estratega de marketing deben operar desde la misma fuente de verdad. Nuestra plataforma está diseñada para ser el nexo que conecta a investigadores, industriales, inversores y policymakers.
            </li>
            <li>
              <strong>Del Dato al Discurso:</strong> Creemos que un dato no tiene valor hasta que se convierte en una decisión. Nuestro "Gemelo Digital Creativo" garantiza que cada simulación técnica o análisis financiero sea la materia prima para una narrativa transmedia clara, persuasiva y dirigida.
            </li>
            <li>
              <strong>La Confianza es Verificable:</strong> Creemos que la confianza no se promete, se programa. Nuestro ecosistema no se basa en la buena voluntad, sino en reglas de gobernanza inmutables. Usamos Smart Contracts (Pilar 2) para gestionar de forma transparente la propiedad intelectual, la distribución de beneficios y la resolución de conflictos.
            </li>
            <li>
              <strong>La Influencia se Gana:</strong> Creemos en la meritocracia. En este ecosistema, el poder de voto no es estático; es un reflejo de su contribución y confianza. Su influencia es un activo que usted construye.
            </li>
          </ol>
        </Section>

        <Section title="3. Nuestra Arquitectura: El Ecosistema Vivo">
            <p>Para un nuevo miembro, la plataforma se divide en tres áreas interconectadas:</p>
            <ul className="space-y-6">
                <li className="flex items-start gap-4"><span className="text-3xl">🔬</span><div><strong>El Ala Analítica (El Laboratorio):</strong> Aquí es donde se forja la verdad. Es donde usted interactúa con nuestros asistentes de IA expertos (como el "Asistente de Laboratorio" o el "Analista de Riesgos") para ejecutar simulaciones industriales (M3), analizar datos (M4) y modelar escenarios financieros (M5) usando técnicas avanzadas como Monte Carlo.</div></li>
                <li className="flex items-start gap-4"><span className="text-3xl">✨</span><div><strong>El Ala Creativa (El Estudio):</strong> Aquí es donde la verdad se traduce. Es donde nuestro "Director de Narrativa Transmedia" (M1) toma los complejos insights del Ala Analítica y los convierte en comunicados para inversores, metáforas artísticas o estrategias de comunicación pública.</div></li>
                <li className="flex items-start gap-4"><span className="text-3xl">🏛️</span><div><strong>El Nexo (La Sala de Control):</strong> Este es el "Panel de Control del Proyecto". Es el cerebro que sintetiza los datos analíticos y los conflictos en un Panel de Decisión claro, sugiriendo acciones concretas para la gobernanza y la comunicación.</div></li>
            </ul>
        </Section>

        <Section title="4. Nuestro Contrato Social: Gobernanza y Reputación">
            <p>Usted no es un simple "usuario". Es un "miembro" con poder real, regido por dos sistemas:</p>
            <ol className="space-y-4">
                <li>
                    <strong>El Motor de Gobernanza (DAO-light):</strong> Las decisiones se toman colectivamente. Su poder de voto se pondera según el contexto: un Investigador tiene más peso en una votación científica; una Comunidad Local tiene poder de veto sobre un impacto social. Las reglas de conflicto no son ambiguas, sino que están codificadas en el ProjectContract.
                </li>
                <li>
                    <strong>El Bucle de Reputación (Meritocracia):</strong> Este es el corazón de nuestra filosofía.
                    <ul className="mt-4 space-y-2 list-disc list-inside">
                        <li><strong>Bucle Positivo:</strong> Cuando usted realiza una contribución valiosa (ej. una simulación M3) y esta es validada por sus pares (M6), su puntuación de reputación aumenta.</li>
                        <li><strong>Bucle Negativo:</strong> Si usted actúa en contra de los intereses de la comunidad (ej. un conflicto de interés no declarado) y el concilio lo valida, su puntuación disminuye.</li>
                        <li><strong>El Resultado:</strong> Su reputación (Pilar 1) actualiza automáticamente su "Multiplicador de Voto" (Pilar 2). A medida que usted construye confianza, su influencia en el ecosistema crece.</li>
                    </ul>
                </li>
            </ol>
        </Section>

        <Section title="5. Nuestra Promesa">
            <ul className="space-y-4">
                <li>
                    <strong>Para el Miembro (Investigador, Industrial, Creador):</strong> Le ofrecemos un ecosistema donde su trabajo es visible, sus contribuciones son recompensadas con influencia real y puede colaborar en proyectos más grandes que usted.
                </li>
                <li>
                    <strong>Para el Inversor:</strong> Le ofrecemos una transparencia sin precedentes. Usted no invierte en una "caja negra". Invierte en un ecosistema con gobernanza verificable, gestión de conflictos programada y un sistema meritocrático que impulsa la innovación de forma autónoma.
                </li>
            </ul>
        </Section>
        
        <footer className="text-center pt-8 border-t border-gray-700">
             <p className="text-xl font-semibold text-gray-300">Bienvenido al Nexo Sinérgico.</p>
        </footer>
      </div>
    </div>
  );
};
