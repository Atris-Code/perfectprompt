import React, { useState, useId, useEffect } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = true, isOpen: controlledIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [isOverflowVisible, setIsOverflowVisible] = useState(defaultOpen);
  const contentId = useId();

  const isControlled = controlledIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOverflowVisible(true);
      }, 500); // Match transition duration
      return () => clearTimeout(timer);
    } else {
      setIsOverflowVisible(false);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-lg mb-4 bg-white shadow-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-lg"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={contentId}
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'} ${isOverflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}
      >
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};