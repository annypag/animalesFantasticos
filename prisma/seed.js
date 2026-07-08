const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Contraseña de todos los usuarios seed: seed1234
const SEED_PASSWORD = "seed1234";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/multimodalembeddings";
const VOYAGE_MODEL = "voyage-multimodal-3";

async function removeBackground(imageUrl) {
  try {
    const { removeBackground: removeBg } = await import("@imgly/background-removal-node");
    const blob = await removeBg(imageUrl);
    const ab = await blob.arrayBuffer();
    return Buffer.from(ab).toString("base64");
  } catch (err) {
    console.warn(`    ⚠ Background removal falló, usando imagen original: ${err.message}`);
    return null;
  }
}

async function generateImageEmbedding(imageUrl, textDescriptor) {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) return null;

  const bgBase64 = await removeBackground(imageUrl);

  let content;
  if (bgBase64) {
    content = [{ type: "image_base64", image_base64: `data:image/png;base64,${bgBase64}` }];
  } else {
    content = [{ type: "image_url", image_url: imageUrl }];
  }
  if (textDescriptor) content.push({ type: "text", text: textDescriptor });

  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: [{ content }],
        model: VOYAGE_MODEL,
        input_type: "document",
      }),
    });

    if (response.status === 429 && attempt < MAX_RETRIES - 1) {
      console.log(`    ⏳ Rate limit, esperando 65s antes de reintentar...`);
      await new Promise((resolve) => setTimeout(resolve, 65000));
      continue;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voyage AI error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  return null;
}

async function saveEmbedding(petId, embedding) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRawUnsafe(
    `UPDATE found_pets SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    petId,
  );
}

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
      breed: "Corgi",
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
      description: "Corgi encontrado en la plaza, muy activo y sin collar. Muy amigable.",
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
  // --- Sofia: más mascotas encontradas ---
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Manchas",
      sex: "UNKNOWN",
      species: "Gato",
      breed: "Atigrado",
      imageUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "manchas-1", fileName: "manchas.jpg", fileUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=1200&q=80" }],
      description: "Gato atigrado encontrado en el jardín, muy amigable y bien cuidado.",
      locationText: "Palermo Soho, CABA",
      neighborhood: "Palermo",
      latitude: -34.5892,
      longitude: -58.4315,
      foundAt: new Date("2026-06-08T09:00:00.000Z"),
      reportDate: new Date("2026-06-08T09:00:00.000Z"),
    },
  },
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Rufo",
      sex: "MALE",
      species: "Perro",
      breed: "Pastor Australiano",
      imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "rufo-1", fileName: "rufo.jpg", fileUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80" }],
      description: "Pastor australiano encontrado sin collar cerca del parque. Muy dócil y obediente.",
      locationText: "Plaza Armenia, Palermo",
      neighborhood: "Palermo",
      latitude: -34.5875,
      longitude: -58.4295,
      foundAt: new Date("2026-06-09T11:30:00.000Z"),
      reportDate: new Date("2026-06-09T11:30:00.000Z"),
    },
  },
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Nala",
      sex: "FEMALE",
      species: "Perro",
      breed: "Golden Retriever",
      imageUrl: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "nala-1", fileName: "nala.jpg", fileUrl: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=1200&q=80" }],
      description: "Golden hembra joven, collarina roja desgastada, muy juguetona.",
      locationText: "Belgrano R, CABA",
      neighborhood: "Belgrano",
      latitude: -34.5598,
      longitude: -58.4571,
      foundAt: new Date("2026-06-10T16:00:00.000Z"),
      reportDate: new Date("2026-06-10T16:00:00.000Z"),
    },
  },
  {
    userEmail: "sofia@animalesfantasticos.local",
    data: {
      name: "Perla",
      sex: "FEMALE",
      species: "Gato",
      breed: "Atigrado dorado",
      imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "perla-1", fileName: "perla.jpg", fileUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80" }],
      description: "Gatita dorada muy juguetona, encontrada en escalera de edificio. Muy activa.",
      locationText: "Núñez, CABA",
      neighborhood: "Núñez",
      latitude: -34.5458,
      longitude: -58.4629,
      foundAt: new Date("2026-06-11T08:15:00.000Z"),
      reportDate: new Date("2026-06-11T08:15:00.000Z"),
    },
  },

  // --- Martín: más mascotas encontradas ---
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Bruno",
      sex: "MALE",
      species: "Perro",
      breed: "Husky Siberiano",
      imageUrl: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "bruno-1", fileName: "bruno.jpg", fileUrl: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=1200&q=80" }],
      description: "Husky siberiano de ojos celestes encontrado en la calle, con collar pero sin placa. Muy amigable.",
      locationText: "San Telmo, CABA",
      neighborhood: "San Telmo",
      latitude: -34.6218,
      longitude: -58.3695,
      foundAt: new Date("2026-06-08T13:00:00.000Z"),
      reportDate: new Date("2026-06-08T13:00:00.000Z"),
    },
  },
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Cleo",
      sex: "FEMALE",
      species: "Gato",
      breed: "Bicolor",
      imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "cleo-1", fileName: "cleo.jpg", fileUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=1200&q=80" }],
      description: "Gata bicolor, blanca y naranja, muy tranquila. Encontrada en patio de edificio.",
      locationText: "Recoleta, CABA",
      neighborhood: "Recoleta",
      latitude: -34.5962,
      longitude: -58.3935,
      foundAt: new Date("2026-06-09T19:00:00.000Z"),
      reportDate: new Date("2026-06-09T19:00:00.000Z"),
    },
  },
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Rex",
      sex: "MALE",
      species: "Perro",
      breed: "Pastor Alemán",
      imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "rex-1", fileName: "rex.jpg", fileUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=1200&q=80" }],
      description: "Pastor alemán joven con placa pero sin datos legibles. Muy obediente.",
      locationText: "Flores, CABA",
      neighborhood: "Flores",
      latitude: -34.6281,
      longitude: -58.4623,
      foundAt: new Date("2026-06-10T07:45:00.000Z"),
      reportDate: new Date("2026-06-10T07:45:00.000Z"),
    },
  },
  {
    userEmail: "martin@animalesfantasticos.local",
    data: {
      name: "Copito",
      sex: "UNKNOWN",
      species: "Gato",
      breed: "Atigrado",
      imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=1200&q=80",
      imageUrls: [{ id: "copito-1", fileName: "copito.jpg", fileUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=1200&q=80" }],
      description: "Gatito atigrado muy pequeño y asustado. Encontrado en Palermo, aparenta ser joven.",
      locationText: "Palermo Hollywood, CABA",
      neighborhood: "Palermo",
      latitude: -34.5865,
      longitude: -58.4338,
      foundAt: new Date("2026-06-11T14:20:00.000Z"),
      reportDate: new Date("2026-06-11T14:20:00.000Z"),
    },
  },

  // --- Lucia: mascota encontrada ---
  {
    userEmail: "lucia@animalesfantasticos.local",
    data: {
      name: "Canela",
      sex: "UNKNOWN",
      species: "Perro",
      breed: "Golden Retriever",
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
      description: "Cachorro Golden Retriever encontrado cerca de un kiosco, sin placa y muy tranquilo.",
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

  let embeddingsGenerated = 0;
  let embeddingRequestCount = 0;

  for (const item of foundPets) {
    const owner = createdUsers.get(item.userEmail);
    if (!owner) {
      throw new Error(`No se pudo encontrar el usuario ${item.userEmail} para foundPets.`);
    }

    const created = await prisma.foundPet.create({
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

    try {
      // Voyage AI free tier: 3 RPM → 21s entre llamadas para mantenerse bajo el límite
      if (embeddingRequestCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 21000));
      }
      embeddingRequestCount++;
      const textDescriptor = [item.data.species, item.data.breed, item.data.description].filter(Boolean).join(", ");
      const embedding = await generateImageEmbedding(item.data.imageUrl, textDescriptor);
      if (embedding) {
        await saveEmbedding(created.id, embedding);
        embeddingsGenerated++;
        console.log(`  ✓ Embedding generado para ${item.data.name}`);
      }
    } catch (err) {
      console.warn(`  ✗ Error generando embedding para ${item.data.name}:`, err.message);
    }
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

  console.log(`Seed completado: ${baseUsers.length} usuarios, ${foundPets.length} found pets (${embeddingsGenerated} con embedding) y ${lostPets.length} lost pets.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
