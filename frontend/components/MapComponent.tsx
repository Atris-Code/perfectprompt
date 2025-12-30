import React, { useEffect, useRef } from 'react';
import type { MapClickPayload, Task } from '../types';

declare var L: any;

interface MapComponentProps {
  onMapClick: (payload: MapClickPayload) => void;
  tasks?: Task[];
  latitude?: string;
  longitude?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({ onMapClick, tasks = [], latitude, longitude }) => {
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      if (typeof L === 'undefined') {
          console.error("Leaflet library (L) not loaded.");
          if (mapContainerRef.current) {
              mapContainerRef.current.innerHTML = '<p class="text-center text-red-500 p-4">Error: No se pudo cargar la librería del mapa. Por favor, revisa tu conexión a internet.</p>';
          }
          return;
      }
      const map = L.map(mapContainerRef.current).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
      });
      
      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
  }, [onMapClick]);

  useEffect(() => {
    if (markerLayerRef.current && mapRef.current) {
        markerLayerRef.current.clearLayers();
        const markers: any[] = [];

        tasks.forEach(task => {
            if (task.latitude && task.longitude) {
                const marker = L.marker([task.latitude, task.longitude])
                    .bindPopup(`<b>${task.title}</b>`);
                markerLayerRef.current.addLayer(marker);
                markers.push(marker);
            }
        });
        
        if (latitude && longitude) {
            const latNum = parseFloat(latitude);
            const lonNum = parseFloat(longitude);
            if (!isNaN(latNum) && !isNaN(lonNum)) {
                const marker = L.marker([latNum, lonNum]).bindPopup('Ubicación Certificada');
                markerLayerRef.current.addLayer(marker);
                markers.push(marker);
            }
        }

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            if(tasks.length > 1) { // if multiple tasks, fit bounds
                mapRef.current.fitBounds(group.getBounds().pad(0.5));
            } else if (markers.length === 1) { // if one marker, center on it
                 mapRef.current.setView(markers[0].getLatLng(), 10);
            }
        }
    }
  }, [tasks, latitude, longitude]);

  return (
    <div ref={mapContainerRef} className="leaflet-container"></div>
  );
};