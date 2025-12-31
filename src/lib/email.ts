import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Magic Paws <noreply@samanthamerlin.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

// Email templates
export function wrapEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magic Paws Dog Training</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #14b8a6;
    }
    .header h1 {
      color: #14b8a6;
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #14b8a6;
      color: white !important;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #14b8a6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Magic Paws Dog Training</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>Magic Paws Dog Training | Mill Valley, CA</p>
    <p><a href="${process.env.NEXTAUTH_URL || "https://samanthamerlin.com"}">Visit our website</a></p>
    <p style="font-size: 12px; color: #999;">
      If you no longer wish to receive these emails, you can
      <a href="${process.env.NEXTAUTH_URL || "https://samanthamerlin.com"}/dashboard/settings">update your preferences</a>.
    </p>
  </div>
</body>
</html>
  `.trim();
}

// Predefined email templates
export const emailTemplates = {
  bookingConfirmation: (data: { clientName: string; serviceName: string; date: string; time: string }) => ({
    subject: `Booking Confirmed: ${data.serviceName}`,
    html: wrapEmailTemplate(`
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${data.clientName},</p>
      <p>Great news! Your booking has been confirmed:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> ${data.serviceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
      </div>
      <p>If you need to make any changes, please contact us as soon as possible.</p>
      <p>Looking forward to seeing you and your pup!</p>
      <p>Best,<br>Samantha</p>
    `),
  }),

  bookingReminder: (data: { clientName: string; serviceName: string; date: string; time: string }) => ({
    subject: `Reminder: ${data.serviceName} Tomorrow`,
    html: wrapEmailTemplate(`
      <h2>Reminder: Your appointment is tomorrow!</h2>
      <p>Hi ${data.clientName},</p>
      <p>Just a friendly reminder about your upcoming appointment:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> ${data.serviceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
      </div>
      <p>If you need to reschedule, please let us know as soon as possible.</p>
      <p>See you tomorrow!</p>
      <p>Best,<br>Samantha</p>
    `),
  }),

  invoiceReady: (data: { clientName: string; amount: string; invoiceUrl: string }) => ({
    subject: "Your Invoice is Ready",
    html: wrapEmailTemplate(`
      <h2>Your invoice is ready</h2>
      <p>Hi ${data.clientName},</p>
      <p>Your invoice for <strong>${data.amount}</strong> is ready for payment.</p>
      <p style="text-align: center;">
        <a href="${data.invoiceUrl}" class="button">View & Pay Invoice</a>
      </p>
      <p>Thank you for choosing Magic Paws Dog Training!</p>
      <p>Best,<br>Samantha</p>
    `),
  }),

  newTrainingContent: (data: { clientName: string; tierName: string; contentTitle: string }) => ({
    subject: `New Training Content: ${data.contentTitle}`,
    html: wrapEmailTemplate(`
      <h2>New training content available!</h2>
      <p>Hi ${data.clientName},</p>
      <p>Exciting news! New content has been added to your <strong>${data.tierName}</strong> training tier:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>${data.contentTitle}</strong></p>
      </div>
      <p style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || "https://samanthamerlin.com"}/dashboard/training" class="button">Start Learning</a>
      </p>
      <p>Happy training!</p>
      <p>Best,<br>Samantha</p>
    `),
  }),
};
