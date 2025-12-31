import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  videoDuration: z.number().int().positive().optional().nullable(),
  content: z.string().optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// POST - Create a new lesson
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = lessonSchema.parse(body);

    // Check if module exists
    const module = await prisma.contentModule.findUnique({
      where: { id: validatedData.moduleId },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get max sort order if not provided
    let sortOrder = validatedData.sortOrder;
    if (sortOrder === undefined) {
      const maxOrder = await prisma.contentLesson.findFirst({
        where: { moduleId: validatedData.moduleId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (maxOrder?.sortOrder ?? -1) + 1;
    }

    // Generate slug from title if not provided
    const slug = validatedData.slug || validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const lesson = await prisma.contentLesson.create({
      data: {
        moduleId: validatedData.moduleId,
        title: validatedData.title,
        slug,
        description: validatedData.description || null,
        youtubeVideoId: validatedData.youtubeVideoId || null,
        videoDuration: validatedData.videoDuration || null,
        content: validatedData.content || null,
        isFreePreview: validatedData.isFreePreview ?? false,
        isPublished: validatedData.isPublished ?? true,
        sortOrder,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
