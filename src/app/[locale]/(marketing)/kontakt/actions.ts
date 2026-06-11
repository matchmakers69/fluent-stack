"use server";

import { submitContactForm } from "@/lib/submitContactForm";
import { serverContactSchema } from "@/lib/validations/contact";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  const result = serverContactSchema.safeParse(data);

  if (!result.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { name, email, message } = result.data;

  const html = `<h2>Fluent Stack Contact Form Message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong> ${escapeHtml(message)}</p>`;

  try {
    const emailResult = await submitContactForm({
      to: "przemek.lewtak@gmail.com",
      subject: `Contact Form Message from ${escapeHtml(name)}`,
      html,
    });

    if (emailResult.success) {
      return { success: true, message: emailResult.message };
    } else {
      return { success: false, message: emailResult.error };
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Contact form error:", err.message, err.stack);
    } else {
      console.error("Contact form error:", err);
    }
    return { success: false, message: "Something went wrong. Server error." };
  }
}
