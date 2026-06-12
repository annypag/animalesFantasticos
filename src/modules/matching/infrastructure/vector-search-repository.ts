import { prisma } from "@/lib/prisma";

export interface VectorMatch {
  id: number;
  score: number;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  neighborhood: string;
  locationText: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  owner: { fullName: string; phone: string | null; email: string };
}

export class VectorSearchRepository {
  async saveFoundPetEmbedding(petId: number, embedding: number[]): Promise<void> {
    const vectorLiteral = `[${embedding.join(",")}]`;
    await prisma.$executeRaw`
      UPDATE found_pets
      SET embedding = ${vectorLiteral}::vector
      WHERE id = ${BigInt(petId)}
    `;
  }

  async findSimilarFoundPets(
    queryEmbedding: number[],
    limit = 5,
  ): Promise<VectorMatch[]> {
    const vectorLiteral = `[${queryEmbedding.join(",")}]`;
    const rows = await prisma.$queryRaw<
      Array<{
        id: bigint;
        score: number;
        name: string;
        species: string;
        breed: string;
        image_url: string;
        neighborhood: string;
        location_text: string;
        latitude: number;
        longitude: number;
        found_at: Date;
        full_name: string;
        phone: string | null;
        email: string;
      }>
    >`
      SELECT
        fp.id,
        1 - (fp.embedding <=> ${vectorLiteral}::vector) AS score,
        fp.name,
        fp.species,
        fp.breed,
        fp.image_url,
        fp.neighborhood,
        fp.location_text,
        fp.latitude,
        fp.longitude,
        fp.found_at,
        u.full_name,
        u.phone,
        u.email
      FROM found_pets fp
      JOIN users u ON u.id = fp.user_id
      WHERE fp.embedding IS NOT NULL
      ORDER BY fp.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: Number(row.id),
      score: Number(row.score),
      name: row.name,
      species: row.species,
      breed: row.breed,
      imageUrl: row.image_url,
      neighborhood: row.neighborhood,
      locationText: row.location_text,
      latitude: row.latitude,
      longitude: row.longitude,
      foundAt: row.found_at.toISOString(),
      owner: { fullName: row.full_name, phone: row.phone, email: row.email },
    }));
  }

  async getFoundPetsWithoutEmbedding(
    limit = 20,
  ): Promise<Array<{ id: number; imageUrl: string }>> {
    const rows = await prisma.$queryRaw<
      Array<{ id: bigint; image_url: string }>
    >`
      SELECT id, image_url FROM found_pets WHERE embedding IS NULL LIMIT ${limit}
    `;
    return rows.map((r) => ({ id: Number(r.id), imageUrl: r.image_url }));
  }
}
