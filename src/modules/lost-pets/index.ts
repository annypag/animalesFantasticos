import { prisma } from "@/lib/prisma";

export async function createLostPet(data: any) {
  // Asumiendo un esquema similar al de foundPets pero para reportes de pérdida
  return await prisma.lostPet.create({
    data: {
      name: data.pet.name,
      species: data.pet.species,
      breed: data.pet.breed,
      imageUrl: data.pet.imageUrl,
      description: data.pet.description,
      locationText: data.pet.locationText,
      latitude: data.pet.latitude,
      longitude: data.pet.longitude,
      lastSeen: data.pet.lastSeen,
      // Relación con el dueño/responsable
      owner: {
        create: {
          fullName: data.owner.fullName,
          phone: data.owner.phone,
        },
      },
    },
    include: {
      owner: true,
    },
  });
}