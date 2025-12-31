import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const lessonUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  videoDuration: z.number().int().positive().optional().nullable(),
  content: z.string().optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// PUT - Update a lesson
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
    const validatedData = lessonUpdateSchema.parse(body);

    // Check if lesson exists
    const existingLesson = await prisma.contentLesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = await prisma.contentLesson.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        youtubeVideoId: validatedData.youtubeVideoId,
        videoDuration: validatedData.videoDuration,
        content: validatedData.content,
        isFreePreview: validatedData.isFreePreview,
        isPublished: validatedData.isPublished,
        sortOrder: validatedData.sortOrder,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lesson
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

    // Check if lesson exists
    const existingLesson = await prisma.contentLesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Delete lesson
    await prisma.contentLesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
