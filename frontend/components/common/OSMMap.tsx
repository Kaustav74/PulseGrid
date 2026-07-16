'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NodeData } from '@/types';
import { getTriageColor } from '@/lib/data/triage';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const triageColors: Record<string, string> = {
  green: '#00ff41',
  yellow: '#ffaa00',
  red: '#ff0040',
  black: '#555',
};

function createNodeIcon(node: NodeData) {
  const color = triageColors[getTriageColor(node)];
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

interface ExtraMarker {
  position: [number, number];
  icon: L.DivIcon;
  popupContent?: string;
  key: string;
}

interface Props {
  nodes: NodeData[];
  selectedNode?: number | null;
  onNodeClick: (id: number) => void;
  ambulancePos?: [number, number];
  extraMarkers?: ExtraMarker[];       // ← new prop
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function OSMMap({
  nodes,
  selectedNode,
  onNodeClick,
  ambulancePos,
  extraMarkers,
}: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.warn('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const defaultCenter: [number, number] = ambulancePos || userPos || [12.9, 77.6];

  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden shadow-lg border border-gray-700/50">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={defaultCenter} />

        {/* Ambulance marker */}
        {ambulancePos && (
          <Marker
            position={ambulancePos}
            icon={L.divIcon({
              html: '<div class="material-symbols-outlined" style="font-size:24px; color: #ff0040;">emergency_share</div>',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
          >
            <Popup><span className="material-symbols-outlined text-sm align-middle">emergency_share</span> Your Ambulance</Popup>
          </Marker>
        )}

        {/* User Real Location Marker */}
        {userPos && (
          <Marker
            position={userPos}
            icon={L.divIcon({
              className: 'user-location-icon',
              html: '<div style="background:#4285F4;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(66,133,244,0.8);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>📍 You are here</Popup>
          </Marker>
        )}

        {/* Extra custom markers (hospital, other ambulances) */}
        {extraMarkers?.map((marker) => (
          <Marker key={marker.key} position={marker.position} icon={marker.icon}>
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        ))}

        {/* Patient nodes */}
        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={createNodeIcon(node)}
            eventHandlers={{ click: () => onNodeClick(node.id) }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Node #{node.id}</strong>
                <br />
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-accent-red">favorite</span> {node.hr} BPM | 
                  <span className="material-symbols-outlined text-[14px] text-accent-amber">pulmonology</span> {node.spo2}%
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-accent-green">speed</span> {node.gForce?.toFixed(1)} G | 
                  <span className="material-symbols-outlined text-[14px] text-text-secondary">battery_full</span> {node.battery}%
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}