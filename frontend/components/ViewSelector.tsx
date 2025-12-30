import React, { useMemo } from 'react';
import { SYSTEM_MAP } from '../data/systemMap';
import type { SystemElement, View, SystemCategory } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

const NavItem: React.FC<{
  item: SystemElement;
  isActive: boolean;
  onSelect: (view: View) => void;
}> = ({ item, isActive, onSelect }) => {
  const { t } = useTranslations();
  const commonClasses = "w-full text-left px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center group";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <li>
      <button
        onClick={() => onSelect(item.id)}
        className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.icon}
        {t(item.nameKey)}
      </button>
    </li>
  );
};


interface ViewSelectorProps {
  currentView: View;
  setView: (view: View) => void;
}

// FIX: Updated the 'key' values to match the valid SystemCategory types.
const CATEGORY_ORDER: { key: SystemCategory, nameKey: string }[] = [
    { key: 'Núcleo Creativo', nameKey: 'category.núcleo creativo' },
    { key: 'Estudios y Talleres', nameKey: 'category.estudios y talleres' },
    { key: 'Simulación Industrial', nameKey: 'category.simulación industrial' },
    { key: 'Análisis y Datos', nameKey: 'category.análisis y datos' },
    { key: 'Finanzas y Estrategia', nameKey: 'category.finanzas y estrategia' },
    { key: 'Colaboración y Sistema', nameKey: 'category.colaboración y sistema' }
];

export const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, setView }) => {
  const { t } = useTranslations();
  const groupedItems = useMemo(() => {
    return SYSTEM_MAP.reduce((acc, item) => {
      (acc[item.type] = acc[item.type] || []).push(item);
      return acc;
    }, {} as Record<SystemCategory, SystemElement[]>);
  }, []);

  return (
    <nav aria-label="Navegación Principal">
      {CATEGORY_ORDER.map((categoryInfo, index) => {
        const items = groupedItems[categoryInfo.key];
        if (!items || items.length === 0) return null;

        return (
          <div key={categoryInfo.key} className={index > 0 ? "mt-6 pt-4 border-t border-gray-200" : ""}>
            <h4 className="px-3 py-2 text-xs font-bold uppercase text-gray-500 tracking-wider">{t(categoryInfo.nameKey)}</h4>
            <ul className="space-y-1.5 mt-2">
              {items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={currentView === item.id}
                  onSelect={setView}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
};