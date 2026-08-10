import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.warn("Resend API key or audience ID missing, cannot process unsubscribe.");
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.contacts.list({ audienceId });

    // ✅ Type-safe check
    const contacts = result.data?.data || [];

    const contact = contacts.find((c) => c.email === email);

    if (!contact) {
      return NextResponse.json(
        { error: "Email not found in audience." },
        { status: 404 }
      );
    }

    // ✅ Unsubscribe contact by ID
    await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Unsubscribe failed." }, { status: 500 });
  }
}
