import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/shared/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    const adminEmail = process.env["ADMIN_EMAIL"] ?? "admin@devvelocity.in";

    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Auto-reply to sender
    await sendEmail({
      to: email,
      subject: "We received your message – DevVelocity",
      html: `
        <!DOCTYPE html><html><body style="font-family:sans-serif;color:#1e293b;padding:32px;">
        <h2>Thanks for reaching out, ${name}!</h2>
        <p>We received your message and will get back to you within 24 hours.</p>
        <p style="color:#64748b;">Your message: <em>${message}</em></p>
        <p>— DevVelocity Support Team</p>
        </body></html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. We will get back to you shortly.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
