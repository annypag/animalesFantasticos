import { Suspense } from 'react';
import 'leaflet/dist/leaflet.css'; // Mantenemos el import de Leaflet aquí como dicta AGENTS.md
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { HomeScreen } from '@/features/home/pages/home-screen'; 

export const metadata = {
  title: 'Mapa de Mascotas - Animales Fantásticos',
  description: 'Busca y reporta mascotas perdidas o encontradas en tu zona.',
};

export default function MapaPage() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}