import { Resend } from 'resend';

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key missing, skipping sendEmail');
      return { success: false, error: 'Missing Resend API key' };
    }
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: 'NasiStore <noreply@nasistore.com>',
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend email error:", error);
    return { success: false, error };
  }
};

export const addToAudience = async ({
  email,
  firstName = "",
  lastName = "",
  audienceId
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  audienceId: string;
}) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key missing, skipping addToAudience');
      return { success: false, error: 'Missing Resend API key' };
    }
    const resend = new Resend(apiKey);
    const response = await resend.contacts.create({
      email,
      firstName,
      lastName,
      audienceId,
      unsubscribed: false,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Resend addToAudience error:", error);
    return { success: false, error };
  }
};
