"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { User } from "@/modules/users/domain/user";

// Mock de usuario basado exactamente en tu entidad user.ts
const mockUser: User = {
  id: 1,
  fullName: "Juan Pérez",
  email: "juan.perez@ejemplo.com",
  phone: "+54 11 1234-5678",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);

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
        <div className="relative space-y-3 py-4 rounded-2xl border border-border bg-white p-5 shadow-sm flex flex-col items-center text-center h-fit lg:col-span-1">
          
          {/* Botón Editar Perfil */}
          <button
            onClick={() => setIsEditing(true)}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Editar perfil</span>
          </button>

          {/* Foto de Perfil */}
          <div className="relative mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-muted border border-border overflow-hidden shadow-sm">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mockUser.fullName)}&background=f1f5f9&color=0f172a&size=128`}
              alt={mockUser.fullName}
              className="h-full w-full object-cover"
            />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground">{mockUser.fullName}</h2>
          <p className="text-sm text-muted-foreground mb-8">{mockUser.email}</p>
          
          {/* Detalles de contacto */}
          <div className="w-full space-y-4 rounded-2xl bg-muted/40 p-5 text-left text-sm border border-border/50 mb-8">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Phone className="h-4 w-4" /> Teléfono
              </span>
              <span className="text-foreground font-semibold">
                {mockUser.phone || "No especificado"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="h-4 w-4" /> Miembro desde
              </span>
              <span className="text-foreground font-semibold">
                {new Date(mockUser.createdAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Botón Centro de Mensajes */}
          <Link 
            href="/mensajes"
            className=" py-2 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-2 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Centro de Mensajes</span>
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

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                <div className="mb-2 flex h-14 w-12 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">Aún no tienes publicaciones activas</p>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Si perdiste a tu mascota, puedes crear un reporte para que la comunidad te ayude.
                </p>
                <Link
                  href="/nuevoReporte"
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm"
                >
                  Reportar mascota perdida
                </Link>
              </div>
            </div>
          </div>

          {/* Sección: Mis Encontrados */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm ">
            <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Mis Mascotas Encontradas</h3>
                <p className="text-sm text-muted-foreground">Reportes de animales que rescataste o viste en la calle</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                <div className="mb-2 flex h-14 w-12 items-center justify-center rounded-full bg-muted">
                  <PawPrint className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">No has reportado mascotas encontradas</p>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  ¿Encontraste un animalito perdido? Haz un reporte rápido para avisar a sus dueños legítimos.
                </p>
                <Link
                  href="/nuevoReporte"
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm"
                >
                  Reportar mascota encontrada
                </Link>
              </div>
            </div>
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
                onClick={() => setIsEditing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form 
              className="p-6"
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditing(false);
              }}
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Correo electrónico <span className="text-xs font-normal text-muted-foreground">(No se puede cambiar)</span>
                  </label>
                  <input 
                    type="email" 
                    defaultValue={mockUser.email}
                    disabled
                    className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Nombre completo</label>
                  <input 
                    type="text" 
                    defaultValue={mockUser.fullName}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Teléfono</label>
                  <input 
                    type="tel" 
                    defaultValue={mockUser.phone || ""}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Ej. +54 11 1234-5678"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 py-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}