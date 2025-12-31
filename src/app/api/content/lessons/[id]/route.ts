import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get a single lesson (with access control)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check access
    let hasAccess = lesson.isFreePreview;

    if (session?.user && !hasAccess) {
      // Check if user purchased the tier
      const purchase = await prisma.tierPurchase.findUnique({
        where: {
          userId_tierId: {
            userId: session.user.id,
            tierId: lesson.module.tierId,
          },
        },
      });
      hasAccess = !!purchase;

      // Admin always has access
      if (session.user.role === "ADMIN") {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          lesson: {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            isFreePreview: lesson.isFreePreview,
            videoDuration: lesson.videoDuration,
            module: {
              title: lesson.module.title,
              tier: {
                name: lesson.module.tier.name,
                slug: lesson.module.tier.slug,
                price: lesson.module.tier.price,
              },
            },
          },
          hasAccess: false,
        },
        { status: 200 }
      );
    }

    // Get user's progress for this lesson
    let progress = null;
    if (session?.user) {
      progress = await prisma.lessonProgress.findUnique({
        where: {
          lessonId_userId: {
            lessonId: lesson.id,
            userId: session.user.id,
          },
        },
      });
    }

    // Get all lessons in the same tier for navigation
    const allLessons = await prisma.contentLesson.findMany({
      where: {
        module: {
          tierId: lesson.module.tierId,
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        module: {
          select: {
            sortOrder: true,
          },
        },
      },
      orderBy: [
        { module: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
    });

    // Find current lesson index and determine prev/next
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const previousLesson = currentIndex > 0 ? {
      id: allLessons[currentIndex - 1].id,
      title: allLessons[currentIndex - 1].title,
    } : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? {
      id: allLessons[currentIndex + 1].id,
      title: allLessons[currentIndex + 1].title,
    } : null;

    return NextResponse.json({
      lesson,
      hasAccess: true,
      progress,
      previousLesson,
      nextLesson,
    });
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
