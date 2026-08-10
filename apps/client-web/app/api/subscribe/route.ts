import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import { addToAudience, sendEmail } from "@/lib/emailHelper";


export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    // Load EJS template
    const templatePath = path.resolve(process.cwd(), "emails/templates/subscription.ejs");
    const template = await fs.readFile(templatePath, "utf-8");
    const html = ejs.render(template, { name, email });

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: "Thank you for subscribing to NasiStore",
      html,
    });

    const contactResult = await addToAudience({
      email, 
      firstName: name,
      lastName: "", // Assuming last name is not provided
      audienceId: process.env.RESEND_AUDIENCE_ID || "default-audience-id", // Use your actual audience ID
    });

    if (!emailResult.success || !contactResult.success) {
      return NextResponse.json({ error: "Failed to send email"}, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscription email sent" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}
