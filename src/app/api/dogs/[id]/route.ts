import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateDogSchema = z.object({
  name: z.string().min(1).optional(),
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

// GET - Get a single dog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const dog = await prisma.dog.findUnique({
      where: { id },
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
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    // Non-admins can only view their own dogs
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || dog.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({ dog });
  } catch (error) {
    console.error("Failed to fetch dog:", error);
    return NextResponse.json(
      { error: "Failed to fetch dog" },
      { status: 500 }
    );
  }
}

// PATCH - Update a dog
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDogSchema.parse(body);

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    // Non-admins can only update their own dogs
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || dog.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.breed !== undefined) updateData.breed = validatedData.breed;
    if (validatedData.birthDate !== undefined) {
      updateData.birthDate = validatedData.birthDate ? new Date(validatedData.birthDate) : null;
    }
    if (validatedData.weight !== undefined) updateData.weight = validatedData.weight;
    if (validatedData.gender !== undefined) updateData.gender = validatedData.gender;
    if (validatedData.isNeutered !== undefined) updateData.isNeutered = validatedData.isNeutered;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;
    if (validatedData.vaccinationsUpToDate !== undefined) {
      updateData.vaccinationsUpToDate = validatedData.vaccinationsUpToDate;
    }
    if (validatedData.vaccinationExpiry !== undefined) {
      updateData.vaccinationExpiry = validatedData.vaccinationExpiry
        ? new Date(validatedData.vaccinationExpiry)
        : null;
    }
    if (validatedData.medicalConditions !== undefined) {
      updateData.medicalConditions = validatedData.medicalConditions;
    }
    if (validatedData.medications !== undefined) updateData.medications = validatedData.medications;
    if (validatedData.dietaryNeeds !== undefined) updateData.dietaryNeeds = validatedData.dietaryNeeds;
    if (validatedData.temperament !== undefined) updateData.temperament = validatedData.temperament;
    if (validatedData.goodWithOtherDogs !== undefined) {
      updateData.goodWithOtherDogs = validatedData.goodWithOtherDogs;
    }
    if (validatedData.goodWithChildren !== undefined) {
      updateData.goodWithChildren = validatedData.goodWithChildren;
    }
    if (validatedData.trainingLevel !== undefined) {
      updateData.trainingLevel = validatedData.trainingLevel;
    }
    if (validatedData.specialInstructions !== undefined) {
      updateData.specialInstructions = validatedData.specialInstructions;
    }

    const updatedDog = await prisma.dog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ dog: updatedDog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update dog:", error);
    return NextResponse.json(
      { error: "Failed to update dog" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a dog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    // Non-admins can only delete their own dogs
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || dog.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Soft delete by setting isActive to false
    await prisma.dog.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete dog:", error);
    return NextResponse.json(
      { error: "Failed to delete dog" },
      { status: 500 }
    );
  }
}
