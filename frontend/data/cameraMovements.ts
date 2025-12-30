export interface CameraMovement {
  name: string;
  actions: string[];
}

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  { name: 'Libertad (Freedom)', actions: ['Push out', 'Pedestal up', 'Tilt down'] },
  { name: 'Debut', actions: ['Truck left', 'Push in', 'Pan right'] },
  { name: 'Círculo Izquierdo (Left Circling)', actions: ['Truck left', 'Pan right', 'Tracking shot'] },
  { name: 'Círculo Derecho (Right Circling)', actions: ['Truck right', 'Pan left', 'Tracking shot'] },
  { name: 'Inclinación Ascendente (Upward Tilt)', actions: ['Push in', 'Pedestal up'] },
  { name: 'Caminata Izquierda (Left Walking)', actions: ['Walking'] },
  { name: 'Caminata Derecha (Right Walking)', actions: ['Walking'] },
  { name: 'Elevación y Desplazamiento (Rising Truck)', actions: ['Truck left', 'Pedestal up'] },
];
