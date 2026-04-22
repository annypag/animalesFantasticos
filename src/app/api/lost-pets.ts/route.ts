import { NextResponse } from "next/server";
import { createLostPet } from "@/modules/lost-pets"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Delegamos la creación al módulo de negocio
    const newLostPet = await createLostPet(body);
    
    // SOLUCIÓN AL ERROR 500: 
    // Prisma nos devuelve BigInts en los IDs, los convertimos a Number 
    // para que Next.js pueda enviarlos correctamente en el JSON.
    const formattedPet = {
      ...newLostPet,
      id: Number(newLostPet.id),
      ownerId: Number(newLostPet.ownerId),
      owner: {
        ...newLostPet.owner,
        id: Number(newLostPet.owner.id)
      }
    };
    
    return NextResponse.json({ pet: formattedPet }, { status: 201 });
  } catch (error) {
    console.error("[LOST_PETS_POST]", error);
    return NextResponse.json(
      { message: "Error interno al crear el reporte." },
      { status: 500 }
    );
  }
}