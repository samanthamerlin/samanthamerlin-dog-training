import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const moduleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// PUT - Update a module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = moduleUpdateSchema.parse(body);

    // Check if module exists
    const existingModule = await prisma.contentModule.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const module = await prisma.contentModule.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
      },
    });

    return NextResponse.json({ module });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if module exists
    const existingModule = await prisma.contentModule.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Delete module (cascades to lessons)
    await prisma.contentModule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
