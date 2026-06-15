// src/features/landing/pages/landing-screen.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, MapPin, PlusCircle, Map, Megaphone, Heart, HelpCircle, Loader2, X } from 'lucide-react';

// ── Nominatim autocomplete ──────────────────────────────────────────────────

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    state?: string;
  };
};

async function fetchSuggestions(query: string): Promise<NominatimResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${query}, Argentina`);
  url.searchParams.set('countrycodes', 'ar');
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'es' },
  });
  if (!res.ok) return [];
  return res.json() as Promise<NominatimResult[]>;
}

function getLabel(r: NominatimResult) {
  const a = r.address;
  const neighborhood = a.suburb ?? a.neighbourhood ?? '';
  const city = a.city ?? a.town ?? '';
  const state = a.state ?? '';
  return [neighborhood, city, state].filter(Boolean).join(', ') || r.display_name;
}

// ── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Component ────────────────────────────────────────────────────────────────

export function LandingScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete fetch
  const handleInputChange = useCallback((value: string) => {
    setBusqueda(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await fetchSuggestions(value.trim());
        setSuggestions(results);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectSuggestion(result: NominatimResult) {
    const label = getLabel(result);
    setBusqueda(label);
    setShowDropdown(false);
    router.push(`/mapa?ubicacion=${encodeURIComponent(label)}`);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (busqueda.trim()) {
      router.push(`/mapa?ubicacion=${encodeURIComponent(busqueda)}`);
    } else {
      router.push('/mapa');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-background px-4 py-4 md:px-8 lg:py-10">

      {/* ================= HERO ================= */}
      <section className="relative w-full bg-slate-50 border-b border-border pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">

        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-20">

          {/* Columna Izquierda */}
          <motion.div
            className="flex-1 text-center md:text-left w-full py-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight"
            >
              Encuentra a tu{' '}
              <span className="text-primary">mejor amigo</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto md:mx-0"
            >
              La red comunitaria más grande para reportar y buscar mascotas
              perdidas y encontradas en tu barrio.
            </motion.p>

            {/* BUSCADOR CON AUTOCOMPLETE */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="relative">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 mx-auto py-4">
                <div className="relative flex-grow shadow-sm rounded-2xl">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6 z-10" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ingresá tu barrio, ciudad o zona..."
                    className="w-full pl-12 pr-10 py-4 rounded-2xl border border-border bg-white text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-lg"
                    value={busqueda}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    autoComplete="off"
                  />
                  {/* Spinner o clear button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loadingSuggestions && (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    {busqueda && !loadingSuggestions && (
                      <button
                        type="button"
                        onClick={() => { setBusqueda(''); setSuggestions([]); setShowDropdown(false); }}
                        className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown de sugerencias */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-border rounded-2xl shadow-xl overflow-hidden"
                  >
                    {suggestions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                        Sin resultados para &quot;{busqueda}&quot;
                      </p>
                    ) : (
                      suggestions.map((result) => (
                        <button
                          key={result.place_id}
                          type="button"
                          onClick={() => handleSelectSuggestion(result)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-foreground hover:bg-primary/5 hover:text-primary transition-colors border-b border-border last:border-0"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{getLabel(result)}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-5 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap text-lg mx-auto cursor-pointer"
                >
                  <Search className="h-5 w-5" />
                  <span>Buscar en el mapa</span>
                </button>
              </form>
            </motion.div>

            {/* Acción secundaria */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <span className="text-sm font-medium text-muted-foreground">
                ¿Encontraste o perdiste una mascota?
              </span>
              <Link
                href="/nuevoReporte"
                className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Publicar Reporte YA
              </Link>
            </motion.div>
          </motion.div>

          {/* Columna Derecha — Banner decorativo */}
          <motion.div
            className="flex-1 hidden md:flex justify-center w-full relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md aspect-square bg-white border border-border shadow-xl rounded-[3rem] p-8 flex flex-col items-center justify-center text-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Heart className="w-24 h-24 text-primary mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Comunidad Unida</h3>
              <p className="text-muted-foreground">
                Juntos hacemos posible que más familias se reencuentren todos los días.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA ================= */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos para ayudar o recibir ayuda de la comunidad en tiempo real.
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5"
          >
            <div className="flex-shrink-0 bg-blue-50 p-4 rounded-2xl text-blue-600">
              <Map className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Busca en el Mapa</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Explorá los pines en tu zona para ver animales reportados como encontrados o perdidos.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5"
          >
            <div className="flex-shrink-0 bg-orange-50 p-4 rounded-2xl text-orange-500">
              <Megaphone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Crea un Reporte</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Subí fotos, características exactas y detalles de la mascota en 3 simples pasos.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow gap-5"
          >
            <div className="flex-shrink-0 bg-green-50 p-4 rounded-2xl text-green-600">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">Reencuentro</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Conectá de forma directa y segura con los dueños a través de la información de contacto.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= INFO & FAQ ================= */}
      <section className="bg-slate-50 border-t border-border py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4" /> Sobre el proyecto
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-6">¿Quiénes Somos?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Animales Fantásticos nació como un proyecto colaborativo para resolver un problema
              cotidiano y doloroso: la angustia de perder a un compañero de cuatro patas.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Somos una plataforma gratuita impulsada 100% por la comunidad, dedicada a centralizar
              la búsqueda y rescate de mascotas utilizando tecnología de geolocalización.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: '¿Tiene algún costo publicar un reporte?',
                  a: 'No, el uso de la aplicación es completamente gratuito. Nuestro único objetivo es ayudar a las mascotas a volver a su hogar sano y salvo.',
                },
                {
                  q: '¿Qué pasa si encuentro a mi mascota?',
                  a: 'Podrás marcar tu reporte como "Resuelto" desde tu panel de usuario. Esto ocultará el pin para mantener el mapa organizado y actualizado para los demás.',
                },
                {
                  q: '¿Cómo me contactan si ven a mi mascota?',
                  a: 'Al llenar el formulario, te pediremos un número de teléfono o correo de contacto. Esta información será visible de forma segura para quien encuentre a tu mascota en el mapa.',
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="bg-white border border-border rounded-2xl p-5 group cursor-pointer shadow-sm"
                >
                  <summary className="font-semibold text-foreground list-none flex justify-between items-center">
                    {q}
                    <span className="text-primary group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-muted py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <Heart className="w-8 h-8 text-primary mb-4" />
          <p className="text-slate-400 font-medium">
            © {new Date().getFullYear()} Animales Fantásticos. Creado con amor para la comunidad.
          </p>
        </div>
      </footer>
    </div>
  );
}