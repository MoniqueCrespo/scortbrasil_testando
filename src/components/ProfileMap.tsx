import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ProfileMapProps {
  latitude: number;
  longitude: number;
  neighborhood: string;
  city: string;
}

export const ProfileMap = ({ latitude, longitude, neighborhood, city }: ProfileMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use a placeholder token - user should configure their own
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNGxxYm1iMzBmajIya3EwOWx6dnNmYnMifQ.placeholder';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 13,
        interactive: false, // Non-interactive for privacy
      });

      // Add marker at approximate location
      new mapboxgl.Marker({
        color: 'hsl(340, 82%, 52%)', // Using primary color
      })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add zoom controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
        }),
        'top-right'
      );
    } catch (error) {
      console.error('Erro ao carregar o mapa:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      <div 
        ref={mapContainer} 
        className="w-full h-[300px] rounded-lg overflow-hidden border border-border"
      />
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <span>📍</span>
        <span>Localização aproximada: {neighborhood}, {city}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        A localização exata será compartilhada após o contato inicial.
      </p>
    </div>
  );
};
