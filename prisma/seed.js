const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Contraseña de todos los usuarios seed: seed1234
const SEED_PASSWORD = "seed1234";

const baseUsers = [
  {
    fullName: "Sofía Pérez",
    email: "sofia@animalesfantasticos.local",
    phone: "11 5555-0101",
  },
  {
    fullName: "Martín López",
    email: "martin@animalesfantasticos.local",
    phone: "11 5555-0202",
  },
  {
    fullName: "Lucía Gómez",
    email: "lucia@animalesfantasticos.local",
    phone: "11 5555-0303",
  },
];

const foundPets = [
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Toby",
      sex: "MALE",
      species: "Perro",
      breed: "Labrador",
      imageUrl:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [
        {
          id: "toby-1",
          fileName: "toby-front.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      description: "Encontrado cerca de la plaza con collar azul y buen estado general.",
      locationText: "Plaza Serrano, Palermo",
      neighborhood: "Palermo",
      latitude: -34.588,
      longitude: -58.430,
      foundAt: new Date("2026-06-05T14:00:00.000Z"),
      reportDate: new Date("2026-06-05T14:00:00.000Z"),
    },
  },
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Mishi",
      sex: "FEMALE",
      species: "Gato",
      breed: "Mestiza",
      imageUrl:
        "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [
        {
          id: "mishi-1",
          fileName: "mishi-sitting.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      description: "Apareció en una cochera, muy tranquila y con pelaje gris.",
      locationText: "Recoleta, CABA",
      neighborhood: "Recoleta",
      latitude: -34.595,
      longitude: -58.392,
      foundAt: new Date("2026-06-06T10:30:00.000Z"),
      reportDate: new Date("2026-06-06T10:30:00.000Z"),
    },
  },
  {
    userEmail: "lucia@animalesfantasticos.local",
    data: {
      name: "Canela",
      sex: "UNKNOWN",
      species: "Perro",
      breed: "Cruza chica",
      imageUrl:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [
        {
          id: "canela-1",
          fileName: "canela-profile.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      description: "Encontrada cerca de un kiosco, sin placa y con buen comportamiento.",
      locationText: "Villa Crespo, Buenos Aires",
      neighborhood: "Villa Crespo",
      latitude: -34.602,
      longitude: -58.441,
      foundAt: new Date("2026-06-07T18:20:00.000Z"),
      reportDate: new Date("2026-06-07T18:20:00.000Z"),
    },
  },
];

const lostPets = [
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Pipo",
      sex: "MALE",
      species: "Perro",
      breed: "Beagle",
      imageUrl:
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80",
      description: "Se perdió al salir corriendo del departamento.",
      locationText: "Almagro, CABA",
      latitude: -34.609,
      longitude: -58.415,
      lastSeen: "Calle Medrano y Sarmiento",
    },
  },
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Lua",
      sex: "FEMALE",
      species: "Gato",
      breed: "Europea",
      imageUrl:
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80",
      description: "No vuelve desde anoche y responde al nombre Lua.",
      locationText: "Caballito, CABA",
      latitude: -34.618,
      longitude: -58.435,
      lastSeen: "Parque Centenario",
    },
  },
  {
    userEmail: "lucia@animalesfantasticos.local",
    data: {
      name: "Roco",
      sex: "UNKNOWN",
      species: "Perro",
      breed: "Mestizo",
      imageUrl:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
      description: "Se extravió durante un paseo por la tarde.",
      locationText: "Villa Urquiza, CABA",
      latitude: -34.569,
      longitude: -58.495,
      lastSeen: "Triunvirato y Congreso",
    },
  },
];

async function main() {
  await prisma.petMatch.deleteMany();
  await prisma.matchJob.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.foundPet.deleteMany();
  await prisma.lostPet.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const createdUsers = new Map();

  for (const user of baseUsers) {
    const createdUser = await prisma.user.create({
      data: { ...user, passwordHash },
    });

    createdUsers.set(user.email, createdUser);
  }

  for (const item of foundPets) {
    const owner = createdUsers.get(item.userEmail);
    if (!owner) {
      throw new Error(`No se pudo encontrar el usuario ${item.userEmail} para foundPets.`);
    }

    await prisma.foundPet.create({
      data: {
        userId: owner.id,
        name: item.data.name,
        sex: item.data.sex,
        species: item.data.species,
        breed: item.data.breed,
        imageUrl: item.data.imageUrl,
        imageUrls: item.data.imageUrls,
        description: item.data.description,
        locationText: item.data.locationText,
        neighborhood: item.data.neighborhood,
        latitude: item.data.latitude,
        longitude: item.data.longitude,
        foundAt: item.data.foundAt,
        reportDate: item.data.reportDate,
      },
    });
  }

  for (const item of lostPets) {
    const owner = createdUsers.get(item.userEmail);
    if (!owner) {
      throw new Error(`No se pudo encontrar el usuario ${item.userEmail} para lostPets.`);
    }

    await prisma.lostPet.create({
      data: {
        userId: owner.id,
        name: item.data.name,
        sex: item.data.sex,
        species: item.data.species,
        breed: item.data.breed,
        imageUrl: item.data.imageUrl,
        description: item.data.description,
        locationText: item.data.locationText,
        latitude: item.data.latitude,
        longitude: item.data.longitude,
        lastSeen: item.data.lastSeen,
      },
    });
  }

  console.log(`Seed completado: ${baseUsers.length} usuarios, ${foundPets.length} found pets y ${lostPets.length} lost pets.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
