'use client';
import OSMMap from './OSMMap';
import { useMap } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { NodeData } from '@/types';

const ambulanceIcon = L.divIcon({
  html: '<div class="material-symbols-outlined" style="font-size:24px; color: #ff0040;">emergency_share</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const hospitalIcon = L.divIcon({
  html: '<div class="material-symbols-outlined" style="font-size:28px; color: #00ff41;">local_hospital</div>',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

interface Props {
  nodes: NodeData[];
  ambulances: { id: number; name: string; lat: number; lng: number; eta: number }[];
  hospitalLat: number;
  hospitalLng: number;
}

export default function HospitalMap({ nodes, ambulances, hospitalLat, hospitalLng }: Props) {
  // We'll create a component that uses the map context to add markers
  // Because OSMMap is already a <MapContainer>, we need to nest extra markers inside.
  // We'll use a small child component that uses useMap and returns null, but adds markers.
  const HospitalMarker = () => {
    const map = useMap();
    useEffect(() => {
      // Add hospital marker
      const marker = L.marker([hospitalLat, hospitalLng], { icon: hospitalIcon }).addTo(map);
      marker.bindPopup('<span class="material-symbols-outlined text-sm align-middle">local_hospital</span> City General Hospital');
      // Add ambulance markers
      const ambMarkers: L.Marker[] = [];
      ambulances.forEach(a => {
        const m = L.marker([a.lat, a.lng], { icon: ambulanceIcon }).addTo(map);
        m.bindPopup(`${a.name} - ETA ${a.eta} min`);
        ambMarkers.push(m);
      });
      return () => {
        map.removeLayer(marker);
        ambMarkers.forEach(m => map.removeLayer(m));
      };
    }, [map, ambulances]);

    return null;
  };

  return (
    <>
      <OSMMap nodes={nodes} onNodeClick={() => {}} selectedNode={null} />
      <HospitalMarker />
    </>
  );
}