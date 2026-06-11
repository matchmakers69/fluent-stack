import { Resend } from "resend";
// Initialize the Resend client with your API key
const resend = new Resend(process.env.RESEND_API_KEY);
export async function submitContactForm({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Fluent Stack <onboarding@resend.dev>", // Replace with your verified sender domain
      to: [to],
      subject, // Email subject line
      html, // Email body (HTML)
    });
    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: "Failed to send confirmation email. Please try again.",
      };
    }

    return {
      success: true,
      message: "Success! Your booking request has been sent. Check your email for confirmation.",
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
