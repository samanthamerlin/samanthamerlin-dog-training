import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTierSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a single tier with modules and lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const { slug } = await params;

    const tier = await prisma.contentTier.findUnique({
      where: { slug },
      include: {
        modules: {
          where: { isPublished: true },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // Check if user has purchased this tier
    let isPurchased = false;
    if (session?.user) {
      const purchase = await prisma.tierPurchase.findUnique({
        where: {
          userId_tierId: {
            userId: session.user.id,
            tierId: tier.id,
          },
        },
      });
      isPurchased = !!purchase;
    }

    // If not purchased, hide video IDs (only show free previews)
    const modulesWithAccess = tier.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        youtubeVideoId: isPurchased || lesson.isFreePreview ? lesson.youtubeVideoId : null,
        content: isPurchased || lesson.isFreePreview ? lesson.content : null,
      })),
    }));

    return NextResponse.json({
      tier: {
        ...tier,
        modules: modulesWithAccess,
        isPurchased,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tier:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier" },
      { status: 500 }
    );
  }
}

// PATCH - Update a tier (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const validatedData = updateTierSchema.parse(body);

    const tier = await prisma.contentTier.findUnique({
      where: { slug },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    const updatedTier = await prisma.contentTier.update({
      where: { slug },
      data: validatedData,
    });

    return NextResponse.json({ tier: updatedTier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update tier:", error);
    return NextResponse.json(
      { error: "Failed to update tier" },
      { status: 500 }
    );
  }
}
