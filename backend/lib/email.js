import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
let resend;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn("⚠️ RESEND_API_KEY is not set. Email sending is disabled.");
}

export async function sendOtpEmail(email, code) {
  if (!resend) {
    console.warn(`Email sending skipped for ${email} because RESEND_API_KEY is missing.`);
    return false;
  }

  try {
    await resend.emails.send({
      from: "GG Gadgets <onboarding@resend.dev>", // swap for your verified domain once set up
      to: email,
      subject: "Your GG Gadgets verification code",
      html: `
        <p>Your verification code is:</p>
        <h2 style="letter-spacing: 4px;">${code}</h2>
        <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return false;
  }
}