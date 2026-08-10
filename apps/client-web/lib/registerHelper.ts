import { Resend } from "resend";
import ejs from "ejs";
import path from "path";
import fs from "fs/promises";

export const sendRegisterSuccessEmail = async (
  email: string,
  name: string
) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Resend API key missing, skipping registration email.");
    return;
  }
  const resend = new Resend(apiKey);
  // 1️⃣ Load template INSIDE function
  const templatePath = path.join(
    process.cwd(),
    "emails/templates/registration.ejs"
  );

  const template = await fs.readFile(templatePath, "utf-8");

  // 2️⃣ Render EJS with data
  const html = ejs.render(template, {
    name,
    year: new Date().getFullYear(),
  });

  // 3️⃣ Send email
  await resend.emails.send({
    from: "NasiStore <no-reply@nasistore.com>",
    to: email,
    subject: "Welcome to NasiStore 🎉",
    html,
  });
};
