import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
  steps: TutorialStep[];
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const previousHighlightedElement = useRef<HTMLElement | null>(null);

  const step = steps[currentStep];

  useEffect(() => {
    // Cleanup previous highlight
    if (previousHighlightedElement.current) {
      previousHighlightedElement.current.classList.remove('tutorial-highlight');
      previousHighlightedElement.current.style.zIndex = '';
    }

    if (!step) return;

    const targetElement = step.targetId ? document.getElementById(step.targetId) : null;
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const updatePosition = () => {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        
        const newStyle: React.CSSProperties = {};
        const position = step.position || 'bottom';
        const offset = 15;

        if (position === 'bottom') {
          newStyle.top = `${rect.bottom + offset}px`;
          newStyle.left = `${rect.left + rect.width / 2}px`;
          newStyle.transform = 'translateX(-50%)';
        } else if (position === 'top') {
          newStyle.top = `${rect.top - offset}px`;
          newStyle.left = `${rect.left + rect.width / 2}px`;
          newStyle.transform = 'translate(-50%, -100%)';
        } else if (position === 'right') {
          newStyle.top = `${rect.top + rect.height / 2}px`;
          newStyle.left = `${rect.right + offset}px`;
          newStyle.transform = 'translateY(-50%)';
        } else if (position === 'left') {
          newStyle.top = `${rect.top + rect.height / 2}px`;
          newStyle.left = `${rect.left - offset}px`;
          newStyle.transform = 'translate(-100%, -50%)';
        }
        setTooltipStyle(newStyle);
        
        targetElement.classList.add('tutorial-highlight');
        targetElement.style.zIndex = '10001';
        previousHighlightedElement.current = targetElement;
      };
      
      // Delay to allow for scroll to finish
      setTimeout(updatePosition, 300);
      
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);

    } else {
        // Handle step with no target (e.g., final message)
        setTargetRect(null);
        setTooltipStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        });
    }

  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!step) return null;

  return ReactDOM.createPortal(
    <>
      <div className="tutorial-overlay" onClick={onClose}></div>
      {targetRect && (
        <div
          className="tutorial-highlight-box"
          style={{
            width: `${targetRect.width + 10}px`,
            height: `${targetRect.height + 10}px`,
            top: `${targetRect.top - 5}px`,
            left: `${targetRect.left - 5}px`,
          }}
        ></div>
      )}
      <div className="tutorial-tooltip" style={tooltipStyle}>
        <h4 className="font-bold text-lg mb-2">{step.title}</h4>
        <p className="text-sm">{step.content}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs font-bold">{currentStep + 1} / {steps.length}</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800" aria-label="Cerrar tutorial">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <style>{`
        .tutorial-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 10000;
        }
        .tutorial-highlight {
          position: relative;
          background-color: white;
          transition: all 0.3s ease-in-out;
        }
        .tutorial-highlight-box {
            position: fixed;
            border: 2px solid #3B82F6;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
            z-index: 10000;
            transition: all 0.3s ease-in-out;
            pointer-events: none;
        }
        .tutorial-tooltip {
          position: fixed;
          background-color: white;
          padding: 1.25rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10002;
          max-width: 320px;
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>,
    document.body
  );
};
