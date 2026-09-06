import React from 'react';
import type { User, View } from '../types';

interface DashboardProps {
  user: User | null;
  setView: (view: View) => void;
}

interface QuickLink {
  label: string;
  description: string;
  view: View;
  emoji: string;
}

const hasRole = (user: User | null, role: string): boolean =>
  !!user?.roles?.some((r) => r.name === role);

const ROLE_META: Record<string, { emoji: string; label: string; color: string }> = {
  Admin: { emoji: '🛡️', label: 'Administrador', color: 'bg-red-100 text-red-700 border-red-200' },
  Academico: { emoji: '🎓', label: 'Académico', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  Auditor: { emoji: '🧾', label: 'Auditor', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  Operador: { emoji: '⚙️', label: 'Operador', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  Viewer: { emoji: '👁️', label: 'Observador', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  Colaborador: { emoji: '🤝', label: 'Colaborador', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const Section: React.FC<{
  title: string;
  emoji: string;
  links: QuickLink[];
  setView: (v: View) => void;
}> = ({ title, emoji, links, setView }) => (
  <section className="mb-8">
    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
      {emoji} {title}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <button
          key={link.view}
          onClick={() => setView(link.view)}
          className="text-left bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{link.emoji}</span>
            <span className="font-semibold text-gray-800 group-hover:text-blue-700">{link.label}</span>
          </div>
          <p className="text-sm text-gray-500">{link.description}</p>
        </button>
      ))}
    </div>
  </section>
);

export const Dashboard: React.FC<DashboardProps> = ({ user, setView }) => {
  const roles = user?.roles?.map((r) => r.name) ?? [];
  const isAdmin = hasRole(user, 'Admin');
  const isAcademico = hasRole(user, 'Academico');
  const isAuditor = hasRole(user, 'Auditor');

  const adminLinks: QuickLink[] = [
    { label: 'Consola de Administración', description: 'Usuarios, roles y operación del sistema.', view: 'admin-console', emoji: '🛡️' },
    { label: 'Reporte de Estado del Sistema', description: 'Salud de módulos y servicios.', view: 'system-status-report', emoji: '📊' },
    { label: 'Perfil de Usuario', description: 'Certificaciones e historial de gobernanza.', view: 'user-profile', emoji: '👤' },
    { label: 'Manifiesto', description: 'Principios y arquitectura del Nexo Sinérgico.', view: 'manifesto', emoji: '📜' },
  ];

  const academicoLinks: QuickLink[] = [
    { label: 'Academia', description: 'Formación guiada por módulos.', view: 'academia', emoji: '🎓' },
    { label: 'Laboratorio de Fundamentos', description: 'Conceptos interactivos de la analítica.', view: 'interactive-fundamentals-lab', emoji: '🧪' },
    { label: 'Hub de Pirólisis', description: 'Base unificada de 135 biomasas.', view: 'pyrolysis-hub', emoji: '🔬' },
    { label: 'Base de Conocimiento', description: 'Documentación y referencias técnicas.', view: 'knowledge-base', emoji: '📚' },
  ];

  const auditorLinks: QuickLink[] = [
    { label: 'Panel Kairos', description: 'Auditoría financiera y viabilidad STO.', view: 'kairos-panel', emoji: '🧾' },
    { label: 'Evaluador de Viabilidad', description: 'Análisis global de viabilidad.', view: 'viability-assessor', emoji: '📈' },
    { label: 'Simulador Project Finance CFO', description: 'Estructuración de deuda y bancabilidad DSCR.', view: 'cfo-finance-simulator', emoji: '🏦' },
    { label: 'Diligencia Debida (A&G)', description: 'Análisis de due diligence.', view: 'due-diligence-analyzer', emoji: '🔍' },
  ];

  const commonLinks: QuickLink[] = [
    { label: 'Creador de Prompts', description: 'Ala Creativa · Estudio.', view: 'creator', emoji: '✨' },
    { label: 'Hub de Pirólisis', description: 'Ala Analítica · Laboratorio.', view: 'pyrolysis-hub', emoji: '🔬' },
    { label: 'Nexo Bridge', description: 'Sala de control e integración.', view: 'nexo-bridge', emoji: '🏛️' },
    { label: 'Manifiesto', description: 'Gobernanza y principios.', view: 'manifesto', emoji: '📜' },
  ];

  const sections: Array<{ title: string; emoji: string; links: QuickLink[] }> = [];
  if (isAdmin) sections.push({ title: 'Administración', emoji: '🛡️', links: adminLinks });
  if (isAcademico) sections.push({ title: 'Ala Académica', emoji: '🎓', links: academicoLinks });
  if (isAuditor) sections.push({ title: 'Auditoría', emoji: '🧾', links: auditorLinks });
  sections.push({ title: 'Navegación General', emoji: '🧭', links: commonLinks });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <header className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hola, {user?.full_name || 'Usuario'} 👋
            </h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.length === 0 && (
              <span className="px-3 py-1 rounded-full text-sm border bg-gray-100 text-gray-600 border-gray-200">
                Sin rol asignado
              </span>
            )}
            {roles.map((role) => {
              const meta = ROLE_META[role] ?? { emoji: '🔹', label: role, color: 'bg-gray-100 text-gray-600 border-gray-200' };
              return (
                <span key={role} className={`px-3 py-1 rounded-full text-sm border ${meta.color}`}>
                  {meta.emoji} {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      </header>

      {/* Secciones por perfil */}
      {sections.map((section) => (
        <Section
          key={section.title}
          title={section.title}
          emoji={section.emoji}
          links={section.links}
          setView={setView}
        />
      ))}
    </div>
  );
};
