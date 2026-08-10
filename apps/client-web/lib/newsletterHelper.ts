import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";
import { getRecentProducts } from "@/lib/productHelper";

export const sendNewsletterToAudience = async () => {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.warn("Resend API key or audience ID missing, skipping newsletter.");
    return;
  }
  const resend = new Resend(apiKey);
  // 1. Fetch recent products
  const products = await getRecentProducts();

  // 2. Load EJS email template
  const templatePath = path.resolve(
    process.cwd(),
    "emails/templates/newsletter.ejs"
  );
  const htmlTemplate = await fs.readFile(templatePath, "utf-8");

  // 3. Get all subscribers from audience
  const result = await resend.contacts.list({ audienceId });
  const contacts = result.data?.data || [];

  if (contacts.length === 0) {
    return;
  }

  // 4. Loop through contacts and send email to each
  for (const contact of contacts) {
    if (contact.unsubscribed) continue;

    const html = ejs.render(htmlTemplate, {
      products,
      email: contact.email, // ✅ Inject email into template for unsubscribe link
    });

    const result = await resend.emails.send({
      from: "NasiStore <noreply@nasistore.com>",
      to: contact.email,
      subject: "🛒 New Products This Week at NasiStore!",
      html,
    });

  }
};
