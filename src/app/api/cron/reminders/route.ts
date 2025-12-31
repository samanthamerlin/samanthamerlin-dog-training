import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";

// This endpoint should be called by a cron job (e.g., daily at 6am)
// You can use Render's cron jobs, Vercel Cron, or an external service like cron-job.org

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find bookings scheduled for tomorrow
    const bookings = await prisma.bookingRequest.findMany({
      where: {
        status: "CONFIRMED",
        confirmedDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        client: {
          include: {
            user: {
              include: {
                notificationPreference: true,
              },
            },
          },
        },
        serviceType: true,
      },
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const booking of bookings) {
      const user = booking.client?.user;

      // Skip if user has disabled booking reminders
      if (user?.notificationPreference?.bookingReminders === false) {
        skippedCount++;
        continue;
      }

      if (user?.email) {
        const clientName = user.name || "Client";
        const serviceName = booking.serviceType?.name || "Service";
        const date = booking.confirmedDate?.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) || "TBD";
        const time = booking.confirmedTime?.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }) || "TBD";

        try {
          const template = emailTemplates.bookingReminder({
            clientName,
            serviceName,
            date,
            time,
          });

          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
          });

          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalBookings: bookings.length,
      sentCount,
      skippedCount,
    });
  } catch (error) {
    console.error("Failed to send reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
