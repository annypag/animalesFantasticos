// src/features/landing/pages/landing-screen.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, PlusCircle, Map, Megaphone, Heart, HelpCircle } from 'lucide-react';

export function LandingScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/mapa?ubicacion=${encodeURIComponent(busqueda)}`);
    } else {
      router.push('/mapa');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-background px-4 py-4 md:px-8 lg:py-10 ">
      
      {/* ================= HERO SECTION (Horizontal y Limpio) ================= */}
      <section className="relative w-full bg-slate-50 border-b border-border pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden py-4 ">
       
        {/* Fondo decorativo sutil */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Columna Izquierda: Textos y Buscador */}
          <div className="flex-1 text-center md:text-left w-full py-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
              Encuentra a tu <span className="text-primary">mejor amigo</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto md:mx-0">
              La red comunitaria más grande para reportar y buscar mascotas perdidas y encontradas en tu barrio.
            </p>

           {/* BUSCADOR */}
<form onSubmit={handleSearch} className="flex flex-col gap-3  mx-auto py-4">
  <div className="relative flex-grow shadow-sm rounded-2xl">
    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
    <input 
      type="text" 
      placeholder="Ingresá tu barrio, ciudad o zona..." 
      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-lg"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />
  </div>
  <button 
    type="submit" 
    className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-5 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap text-lg mx-auto"
  >
    <Search className="h-5 w-5" />
    <span>Buscar</span>
  </button>
</form>

            {/* ACCIÓN SECUNDARIA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <span className="text-sm font-medium text-muted-foreground">¿Encontraste o perdiste una mascota?</span>
              <Link 
                href="/mapa?action=report" 
                className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Publicar Reporte YA
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Ilustración / Banner Horizontal */}
          <div className="flex-1 hidden md:flex justify-center w-full relative">
             <div className="relative w-full max-w-md aspect-square bg-white border border-border shadow-xl rounded-[3rem] p-8 flex flex-col items-center justify-center text-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Heart className="w-24 h-24 text-primary mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Comunidad Unida</h3>
                <p className="text-muted-foreground">Juntos hacemos posible que más familias se reencuentren todos los días.</p>
             </div>
          </div>

        </div>
      </section>

      {/* ================= SECCIÓN: CÓMO FUNCIONA (Tarjetas Horizontales) ================= */}
      <section className="py-20 px-4 max-w-7xl mx-auto py-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Tres simples pasos para ayudar o recibir ayuda de la comunidad en tiempo real.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 py-4">
          {/* Tarjeta 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5 ">
            <div className="flex-shrink-0 bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Map className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Busca en el Mapa</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Explora los pines en tu zona para ver animales reportados como encontrados o perdidos.</p>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5">
            <div className="flex-shrink-0 bg-orange-50 p-4 rounded-2xl text-orange-500">
              <Megaphone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Crea un Reporte</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Haz clic en el mapa para subir fotos, características exactas y detalles de la mascota.</p>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5">
            <div className="flex-shrink-0 bg-green-50 p-4 rounded-2xl text-green-600">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Reencuentro</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Conecta de forma directa y segura con los dueños a través de la información de contacto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECCIÓN: INFO & FAQ (Grid de 2 columnas) ================= */}
      <section className="bg-slate-50 border-t border-border py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          
          {/* Quiénes Somos */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4" /> Sobre el proyecto
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-6">¿Quiénes Somos?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Animales Fantásticos nació como un proyecto colaborativo para resolver un problema cotidiano y doloroso: la angustia de perder a un compañero de cuatro patas. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos una plataforma gratuita impulsada 100% por la comunidad, dedicada a centralizar la búsqueda y rescate de mascotas utilizando tecnología de geolocalización.
            </p>
          </div>

          {/* Preguntas Frecuentes */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              <details className="bg-white border border-border rounded-2xl p-5 group cursor-pointer shadow-sm">
                <summary className="font-semibold text-foreground list-none flex justify-between items-center">
                  ¿Tiene algún costo publicar un reporte?
                  <span className="text-primary group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">No, el uso de la aplicación es completamente gratuito. Nuestro único objetivo es ayudar a las mascotas a volver a su hogar sano y salvo.</p>
              </details>
              
              <details className="bg-white border border-border rounded-2xl p-5 group cursor-pointer shadow-sm">
                <summary className="font-semibold text-foreground list-none flex justify-between items-center">
                  ¿Qué pasa si encuentro a mi mascota?
                  <span className="text-primary group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">Podrás marcar tu reporte como &quot;Resuelto&quot; desde tu panel de usuario. Esto ocultará el pin para mantener el mapa organizado y actualizado para los demás.</p>
              </details>

              <details className="bg-white border border-border rounded-2xl p-5 group cursor-pointer shadow-sm">
                <summary className="font-semibold text-foreground list-none flex justify-between items-center">
                  ¿Cómo me contactan si ven a mi mascota?
                  <span className="text-primary group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">Al llenar el formulario, te pediremos un número de teléfono o correo de contacto. Esta información será visible de forma segura para quien encuentre a tu mascota en el mapa.</p>
              </details>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-muted py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <Heart className="w-8 h-8 text-primary mb-4" />
          <p className="text-slate-400 font-medium">© {new Date().getFullYear()} Animales Fantásticos. Creado con amor para la comunidad.</p>
        </div>
      </footer>
    </div>
  );
}