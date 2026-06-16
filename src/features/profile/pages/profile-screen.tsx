"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Megaphone, 
  PawPrint, 
  CheckCircle2, 
  Calendar, 
  Phone,
  Pencil,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { FoundPet } from "@/modules/found-pets/domain/found-pet";
import type { LostPet } from "@/modules/lost-pets/domain/lost-pet";

export function ProfileScreen() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myFoundPets, setMyFoundPets] = useState<FoundPet[]>([]);
  const [myLostPets, setMyLostPets] = useState<LostPet[]>([]);
  const [loadingFoundPets, setLoadingFoundPets] = useState(false);
  const [loadingLostPets, setLoadingLostPets] = useState(false);
  const [foundPetsError, setFoundPetsError] = useState<string | null>(null);
  const [lostPetsError, setLostPetsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoadingFoundPets(true);
    setFoundPetsError(null);
    fetch(`/api/found-pets?userId=${user.id}&includeResolved=true`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar tus mascotas encontradas.");
        return r.json() as Promise<{ pets: FoundPet[] }>;
      })
      .then((data) => setMyFoundPets(data.pets ?? []))
      .catch((err: Error) => setFoundPetsError(err.message))
      .finally(() => setLoadingFoundPets(false));

    setLoadingLostPets(true);
    setLostPetsError(null);
    fetch(`/api/lost-pets?userId=${user.id}&includeResolved=true`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar tus mascotas perdidas.");
        return r.json() as Promise<{ pets: LostPet[] }>;
      })
      .then((data) => setMyLostPets(data.pets ?? []))
      .catch((err: Error) => setLostPetsError(err.message))
      .finally(() => setLoadingLostPets(false));
  }, [user]);

  // Proteger la ruta: Si no está cargando y no hay usuario, redirigir al login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Mostrar estado de carga mientras resolvemos la sesión
  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Nota: Si el backend luego envía la fecha de creación, la extraemos. 
  // Por ahora la interfaz AuthUser no lo tiene fuertemente tipado.
  const memberSince = (user as any).createdAt 
    ? new Date((user as any).createdAt).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
      })
    : "Fecha no disponible";
 
  return (
   <div className="w-full max-w-5xl mx-auto bg-background px-4 py-4 md:px-8 lg:py-10  ">
    
      {/* Encabezado de la página */}
      <div className="mb-10 py-4 ">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-base text-muted-foreground mt-1">
          Gestiona tu información personal, mensajes y el historial de reportes.
        </p>
      </div>

      {/* 2. CAMBIO CLAVE: Usamos grid-cols-4 en pantallas grandes para darle más proporción a la derecha */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16 space-y-3 ">
        
        {/* Columna Izquierda: Información del Usuario (Ocupa exactamente 1 columna de 4) */}
        {/* Se agregó 'relative' a este div para poder posicionar el botón de editar */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex flex-col items-center text-center h-fit lg:col-span-1">

          {/* Foto de Perfil */}
          <div className="relative mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-muted border border-border overflow-hidden shadow-sm">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f1f5f9&color=0f172a&size=128`}
              alt={user.fullName}
              className="h-full w-full object-cover"
            />
          </div>

          <h2 className="text-xl font-semibold text-foreground">{user.fullName}</h2>
          <p className="text-sm text-muted-foreground w-full break-all">{user.email}</p>

          {/* Botón Editar Perfil */}
          <button
            onClick={() => setIsEditing(true)}
            className="mb-6 mt-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Editar perfil</span>
          </button>
          
          {/* Detalles de contacto */}
          <div className="w-full divide-y divide-border/50 rounded-2xl bg-muted/40 border border-border/50 mb-8 text-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-semibold text-foreground">{user.phone || "No especificado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Miembro desde</p>
                <p className="font-semibold text-foreground">{memberSince}</p>
              </div>
            </div>
          </div>

          {/* Botón Centro de Mensajes */}
          <Link
            href="/mensajes"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>Centro de mensajes</span>
          </Link>
        </div>

        {/* Columna Derecha: Ocupa las 3 columnas restantes (lg:col-span-3), estirando los módulos */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Sección: Mis Publicaciones */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Mis Publicaciones (Perdidos)</h3>
                <p className="text-sm text-muted-foreground">Mascotas tuyas que estás buscando actualmente</p>
              </div>
            </div>

            {lostPetsError ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{lostPetsError}</p>
            ) : loadingLostPets ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : myLostPets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                <div className="mb-2 flex h-14 w-12 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">Aún no tenés publicaciones activas</p>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Si perdiste a tu mascota, podés crear un reporte para que la comunidad te ayude.
                </p>
                <Link
                  href="/nuevoReporte"
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm"
                >
                  Reportar mascota perdida
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {myLostPets.map((pet) => (
                  <div key={pet.id} className="flex gap-3 rounded-xl border border-border bg-muted/20 p-3">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{pet.name}</p>
                        {pet.resolvedAt ? (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Resuelto</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Buscando</span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{pet.breed} · {pet.locationText}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pet.lastSeen).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección: Mis Encontrados */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Mis Mascotas Encontradas</h3>
                <p className="text-sm text-muted-foreground">Reportes de animales que rescataste o viste en la calle</p>
              </div>
            </div>

            {foundPetsError ? (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{foundPetsError}</p>
            ) : loadingFoundPets ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : myFoundPets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                <div className="mb-2 flex h-14 w-12 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">No has reportado mascotas encontradas</p>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  ¿Encontraste un animalito perdido? Hacé un reporte rápido para avisar a sus dueños.
                </p>
                <Link
                  href="/nuevoReporte"
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm"
                >
                  Reportar mascota encontrada
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {myFoundPets.map((pet) => (
                  <div key={pet.id} className="flex gap-3 rounded-xl border border-border bg-muted/20 p-3">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{pet.name}</p>
                        {pet.resolvedAt ? (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Resuelto</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Activo</span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{pet.breed} · {pet.neighborhood}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pet.foundAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL DE EDICIÓN DE PERFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
              <h3 className="text-lg font-bold text-foreground">Editar Perfil</h3>
              <button 
                onClick={() => { setIsEditing(false); setError(null); }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              className="p-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setIsSubmitting(true);

                const formData = new FormData(e.currentTarget);
                const fullName = formData.get("fullName") as string;
                const phone = formData.get("phone") as string;

                try {
                  // Ejecuta la llamada al back e hidrata el estado global
                  await updateUser(fullName, phone);
                  setIsEditing(false);
                } catch (err: any) {
                  setError(err.message || "Ocurrió un error inesperado.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="space-y-5">
                {/* Mensaje de Error en caso de fallo */}
                {error && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Correo electrónico <span className="text-xs font-normal text-muted-foreground">(No se puede cambiar)</span>
                  </label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Nombre completo</label>
                  <input 
                    type="text" 
                    name="fullName" // <-- Asegurar que tenga el atributo name
                    defaultValue={user.fullName}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Teléfono</label>
                  <input 
                    type="tel" 
                    name="phone" // <-- Asegurar que tenga el atributo name
                    defaultValue={user.phone || ""}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Ej. +54 11 1234-5678"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 py-4">
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setError(null); }}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}