import React, { useState } from 'react';
import { Login } from './Login';

interface LandingPageProps {
  onLogin: (token: string) => void;
}

/**
 * LandingPage — Página pública de Nexo Sinérgico (pre-login).
 *
 * Estructura semántica: <header> (nav), <main> (hero + secciones), <footer> (privacidad).
 * Tema visual: oscuro (slate) con acentos cyan/azul, coherente con el resto del sistema.
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-md mx-auto pt-6 px-4">
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="text-slate-400 hover:text-cyan-400 text-sm inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
            aria-label="Volver a la página principal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>
        </div>
        <Login onLogin={onLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* ===== Header / Nav ===== */}
      <header className="border-b border-slate-800/70 sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
        <nav
          className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
          aria-label="Navegación principal"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm" aria-hidden="true">N</span>
            </div>
            <span className="font-bold text-white tracking-tight">Nexo Sinérgico</span>
          </div>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Acceder
          </button>
        </nav>
      </header>

      {/* ===== Main ===== */}
      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b border-slate-800/60"
          aria-labelledby="hero-title"
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.15),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
            <p className="text-cyan-400 font-semibold text-sm md:text-base tracking-wide uppercase mb-4">
              De los Datos al Discurso · Del Conflicto al Consenso
            </p>
            <h1
              id="hero-title"
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight"
            >
              Nexo Sinérgico
            </h1>
            <p className="mt-6 text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Un ecosistema de innovación aumentada que une el rigor del{' '}
              <span className="text-cyan-300">Ala Analítica</span> con el poder narrativo del{' '}
              <span className="text-blue-300">Ala Creativa</span> — para gestionar el ciclo completo
              de una idea: del dato técnico a la decisión y la comunicación estratégica.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-lg shadow-cyan-900/30"
              >
                Acceder al Sistema
              </button>
              <a
                href="#alas"
                className="w-full sm:w-auto border border-slate-700 hover:border-cyan-500 text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                Conocer el ecosistema
              </a>
            </div>
          </div>
        </section>

        {/* Tres Alas */}
        <section
          id="alas"
          className="max-w-6xl mx-auto px-6 py-20"
          aria-labelledby="alas-title"
        >
          <h2 id="alas-title" className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Tres áreas, un solo ecosistema
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-700 transition-colors">
              <div className="text-3xl mb-4" aria-hidden="true">🔬</div>
              <h3 className="text-lg font-bold text-white mb-2">Ala Analítica</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                El Laboratorio donde se forja la verdad: simulaciones industriales, análisis de
                datos y modelado financiero con técnicas como Monte Carlo.
              </p>
            </article>
            <article className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-700 transition-colors">
              <div className="text-3xl mb-4" aria-hidden="true">✨</div>
              <h3 className="text-lg font-bold text-white mb-2">Ala Creativa</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                El Estudio donde la verdad se traduce: narrativa transmedia, prompts, guiones y
                comunicación estratégica para cada audiencia.
              </p>
            </article>
            <article className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-purple-700 transition-colors">
              <div className="text-3xl mb-4" aria-hidden="true">🏛️</div>
              <h3 className="text-lg font-bold text-white mb-2">El Nexo</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                La Sala de Control que sintetiza datos y conflictos en un panel de decisión claro,
                con gobernanza y reputación programadas.
              </p>
            </article>
          </div>
        </section>
      </main>

      {/* ===== Footer con privacidad ===== */}
      <footer className="border-t border-slate-800/70 bg-slate-900/40" aria-labelledby="footer-title">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
          <div>
            <h2 id="footer-title" className="text-white font-bold mb-3">Nexo Sinérgico</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ecosistema de innovación aumentada para la economía circular y la sostenibilidad
              industrial.
            </p>
          </div>

          <div id="privacidad">
            <h3 className="text-white font-semibold mb-3">Privacidad</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tus credenciales y datos de simulación se procesan de forma segura. Las claves de IA
              residen exclusivamente en el servidor y nunca se exponen al navegador.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacidad" className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#privacidad" className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded">
                  Términos de Uso
                </a>
              </li>
              <li>
                <a href="mailto:soporte@nexo.com" className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/60">
          <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Nexo Sinérgico · Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};
