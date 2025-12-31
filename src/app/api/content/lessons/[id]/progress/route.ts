import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProgressSchema = z.object({
  lastPosition: z.number().optional(),
  isCompleted: z.boolean().optional(),
});

// POST - Update lesson progress
export async function POST(
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
    const validatedData = updateProgressSchema.parse(body);

    // Verify lesson exists and user has access
    const lesson = await prisma.contentLesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check access
    const purchase = await prisma.tierPurchase.findUnique({
      where: {
        userId_tierId: {
          userId: session.user.id,
          tierId: lesson.module.tierId,
        },
      },
    });

    const hasAccess = !!purchase || lesson.isFreePreview || session.user.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Upsert progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId: id,
          userId: session.user.id,
        },
      },
      create: {
        lessonId: id,
        userId: session.user.id,
        lastPosition: validatedData.lastPosition || 0,
        isCompleted: validatedData.isCompleted || false,
        completedAt: validatedData.isCompleted ? new Date() : null,
      },
      update: {
        lastPosition: validatedData.lastPosition,
        isCompleted: validatedData.isCompleted,
        completedAt: validatedData.isCompleted ? new Date() : undefined,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
