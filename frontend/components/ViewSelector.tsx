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

// Fase 3: taxonomía de 4 zonas alineada con el Manifiesto del Nexo Sinérgico.
const CATEGORY_ORDER: { key: SystemCategory, nameKey: string, emoji: string }[] = [
    { key: 'Ala Analítica', nameKey: 'category.ala analítica', emoji: '🔬' },
    { key: 'Ala Creativa', nameKey: 'category.ala creativa', emoji: '✨' },
    { key: 'Nexo', nameKey: 'category.nexo', emoji: '🏛️' },
    { key: 'Gobernanza y Sistema', nameKey: 'category.gobernanza y sistema', emoji: '⚖️' }
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
            <h4 className="px-3 py-2 text-xs font-bold uppercase text-gray-500 tracking-wider">{categoryInfo.emoji} {t(categoryInfo.nameKey)}</h4>
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