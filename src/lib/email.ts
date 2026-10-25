import nodemailer from "nodemailer";

/**
 * Returns a configured Nodemailer transporter using Gmail SMTP.
 * Requires EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env.local
 */
export function getEmailTransporter() {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
}

/**
 * Sends a notification email to the store owner when a customer submits the contact form
 */
export async function sendContactNotification({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string;
  message: string;
}) {
  const recipient = (process.env.OWNER_EMAIL || "occassions.flowers@gmail.com").trim();
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.warn(
      "[Email Service] EMAIL_USER or EMAIL_PASS (Gmail App Password) is not configured in .env.local. Inquiry saved to database, but notification email was not dispatched."
    );
    return { sent: false, reason: "credentials_not_configured" };
  }

  const senderUser = process.env.EMAIL_USER || recipient;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #E90046; padding-bottom: 18px;">
        <h1 style="color: #E90046; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Occasions Florist & Event Decor</h1>
        <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13.5px;">New Customer Contact Message</p>
      </div>

      <p style="font-size: 15px; color: #1f2937; margin-bottom: 18px;">
        You have received a new inquiry from the Occasions website contact form:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden;">
        <tr style="background-color: #f9fafb;">
          <td style="padding: 12px 14px; font-weight: 600; color: #4b5563; width: 130px; border-bottom: 1px solid #e5e7eb; font-size: 13.5px;">Customer Name:</td>
          <td style="padding: 12px 14px; color: #111827; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 14px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; font-size: 13.5px;">Email Address:</td>
          <td style="padding: 12px 14px; color: #111827; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
            <a href="mailto:${email}" style="color: #E90046; text-decoration: none; font-weight: 500;">${email}</a>
          </td>
        </tr>
        ${
          phone
            ? `<tr style="background-color: #f9fafb;">
          <td style="padding: 12px 14px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; font-size: 13.5px;">Phone Number:</td>
          <td style="padding: 12px 14px; color: #111827; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
            <a href="tel:${phone}" style="color: #111827; text-decoration: none;">${phone}</a>
          </td>
        </tr>`
            : ""
        }
        <tr ${phone ? "" : 'style="background-color: #f9fafb;"'}>
          <td style="padding: 12px 14px; font-weight: 600; color: #4b5563; font-size: 13.5px;">Subject:</td>
          <td style="padding: 12px 14px; color: #111827; font-size: 14px;">${subject || "General Website Inquiry"}</td>
        </tr>
      </table>

      <div style="background-color: #FDF2F4; border-left: 4px solid #E90046; padding: 16px 18px; margin: 24px 0; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0; color: #E90046; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Message:</h4>
        <p style="margin: 0; color: #1f2937; line-height: 1.65; font-size: 14.5px; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry with Occasions Florist')}" 
           style="display: inline-block; background-color: #E90046; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(233, 0, 70, 0.25);">
          Reply to ${name}
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 14px; line-height: 1.5;">
          Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST<br/>
          Occasions Calicut • Near CH Flyover, Kannur Road, Calicut, Kerala 673001
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Occasions Contact Form" <${senderUser}>`,
      to: recipient,
      replyTo: email,
      subject: `[New Contact Message] ${name} - ${subject || "Website Inquiry"}`,
      text: `New contact form submission from ${name} (${email}${phone ? ', Phone: ' + phone : ''}):\n\n${message}`,
      html: htmlContent,
    });
    console.log("[Email Service] Successfully sent contact notification email:", info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Email Service] Failed to send email via SMTP:", err);
    return { sent: false, error: err.message };
  }
}
