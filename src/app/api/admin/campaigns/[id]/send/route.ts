import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, wrapEmailTemplate } from "@/lib/email";
import { UserRole } from "@prisma/client";

// POST - Send campaign to recipients
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Campaign has already been sent or is in progress" },
        { status: 400 }
      );
    }

    // Update campaign status to SENDING
    await prisma.emailCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    // Get target users based on campaign settings
    const whereClause: { role?: { in: UserRole[] }; notificationPreference?: { marketingEmails: boolean } } = {};

    if (!campaign.targetAll && campaign.targetRoles.length > 0) {
      whereClause.role = { in: campaign.targetRoles as UserRole[] };
    }

    // Only send to users who have marketing emails enabled
    whereClause.notificationPreference = { marketingEmails: true };

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { notificationPreference: { marketingEmails: true } },
          { notificationPreference: null }, // Users without preferences default to receiving
        ],
        ...(whereClause.role && { role: whereClause.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Create recipient records
    const recipients = await prisma.$transaction(
      users.map((user) =>
        prisma.emailRecipient.upsert({
          where: {
            campaignId_userId: {
              campaignId: id,
              userId: user.id,
            },
          },
          create: {
            campaignId: id,
            userId: user.id,
            email: user.email,
          },
          update: {},
        })
      )
    );

    // Send emails in batches
    const batchSize = 10;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (recipient) => {
          try {
            await sendEmail({
              to: recipient.email,
              subject: campaign.subject,
              html: wrapEmailTemplate(campaign.content),
            });

            await prisma.emailRecipient.update({
              where: { id: recipient.id },
              data: {
                status: "SENT",
                sentAt: new Date(),
              },
            });

            sentCount++;
          } catch (error) {
            console.error(`Failed to send to ${recipient.email}:`, error);

            await prisma.emailRecipient.update({
              where: { id: recipient.id },
              data: {
                status: "FAILED",
                error: error instanceof Error ? error.message : "Unknown error",
              },
            });

            failedCount++;
          }
        })
      );
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        sentCount,
      },
    });

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: recipients.length,
    });
  } catch (error) {
    console.error("Failed to send campaign:", error);

    // Revert campaign status on error
    const { id } = await params;
    await prisma.emailCampaign.update({
      where: { id },
      data: { status: "DRAFT" },
    }).catch(() => {});

    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 }
    );
  }
}
