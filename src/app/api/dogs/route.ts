import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createDogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z.number().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  isNeutered: z.boolean().optional(),
  color: z.string().optional(),
  vaccinationsUpToDate: z.boolean().optional(),
  vaccinationExpiry: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  temperament: z.string().optional(),
  goodWithOtherDogs: z.boolean().optional(),
  goodWithChildren: z.boolean().optional(),
  trainingLevel: z.enum(["NONE", "BASIC", "INTERMEDIATE", "ADVANCED"]).optional(),
  specialInstructions: z.string().optional(),
});

// GET - List dogs for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      // For admins viewing all dogs
      if (session.user.role === "ADMIN") {
        const dogs = await prisma.dog.findMany({
          where: { isActive: true },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ dogs });
      }

      return NextResponse.json({ dogs: [] });
    }

    const dogs = await prisma.dog.findMany({
      where: {
        clientId: clientProfile.id,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ dogs });
  } catch (error) {
    console.error("Failed to fetch dogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch dogs" },
      { status: 500 }
    );
  }
}

// POST - Create a new dog
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDogSchema.parse(body);

    // Get or create client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    const dog = await prisma.dog.create({
      data: {
        clientId: clientProfile.id,
        name: validatedData.name,
        breed: validatedData.breed,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        weight: validatedData.weight,
        gender: validatedData.gender,
        isNeutered: validatedData.isNeutered ?? false,
        color: validatedData.color,
        vaccinationsUpToDate: validatedData.vaccinationsUpToDate ?? false,
        vaccinationExpiry: validatedData.vaccinationExpiry
          ? new Date(validatedData.vaccinationExpiry)
          : null,
        medicalConditions: validatedData.medicalConditions,
        medications: validatedData.medications,
        dietaryNeeds: validatedData.dietaryNeeds,
        temperament: validatedData.temperament,
        goodWithOtherDogs: validatedData.goodWithOtherDogs ?? true,
        goodWithChildren: validatedData.goodWithChildren ?? true,
        trainingLevel: validatedData.trainingLevel ?? "NONE",
        specialInstructions: validatedData.specialInstructions,
      },
    });

    return NextResponse.json({ dog }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create dog:", error);
    return NextResponse.json(
      { error: "Failed to create dog" },
      { status: 500 }
    );
  }
}
