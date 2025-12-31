import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTierSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET - List all content tiers (public for browsing, includes purchase status for authenticated users)
export async function GET() {
  try {
    const session = await auth();

    const tiers = await prisma.contentTier.findMany({
      where: { isActive: true },
      include: {
        modules: {
          where: { isPublished: true },
          include: {
            lessons: {
              where: { isPublished: true },
              select: {
                id: true,
                title: true,
                isFreePreview: true,
                videoDuration: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            modules: { where: { isPublished: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // If user is authenticated, check their purchases
    let purchases: string[] = [];
    if (session?.user) {
      const userPurchases = await prisma.tierPurchase.findMany({
        where: { userId: session.user.id },
        select: { tierId: true },
      });
      purchases = userPurchases.map((p) => p.tierId);
    }

    // Add purchase status to each tier
    const tiersWithStatus = tiers.map((tier) => ({
      ...tier,
      isPurchased: purchases.includes(tier.id),
      moduleCount: tier._count.modules,
      lessonCount: tier.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      totalDuration: tier.modules.reduce(
        (acc, m) => acc + m.lessons.reduce((lacc, l) => lacc + (l.videoDuration || 0), 0),
        0
      ),
    }));

    return NextResponse.json({ tiers: tiersWithStatus });
  } catch (error) {
    console.error("Failed to fetch tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiers" },
      { status: 500 }
    );
  }
}

// POST - Create a new tier (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTierSchema.parse(body);

    const tier = await prisma.contentTier.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        sortOrder: validatedData.sortOrder,
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json({ tier }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create tier:", error);
    return NextResponse.json(
      { error: "Failed to create tier" },
      { status: 500 }
    );
  }
}
