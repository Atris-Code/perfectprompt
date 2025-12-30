import React from 'react';
import { CAMERA_MOVEMENTS } from '../data/cameraMovements';
import type { CameraMovement } from '../data/cameraMovements';

export const CameraMovementGallery: React.FC = () => {
  return (
    <section className="mt-12 pt-8 border-t">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Galería de Movimientos de Cámara Compuestos</h3>
      <p className="text-sm text-gray-600 mb-6">Explora combinaciones de movimientos de cámara para crear planos dinámicos y expresivos.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAMERA_MOVEMENTS.map((movement) => (
          <div key={movement.name} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:scale-[1.02] transform flex flex-col">
            <h4 className="font-bold text-md text-blue-700 mb-3">{movement.name}</h4>
            <div className="flex flex-wrap gap-2">
              {movement.actions.map((action, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
