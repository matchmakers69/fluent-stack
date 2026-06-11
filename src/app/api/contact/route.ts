import { submitContactForm } from "@/lib/submitContactForm";

export async function POST(request: Request) {
  try {
    // Parse the JSON body of the request
    const { name, email, message } = await request.json();
    // Validate required fields - only to make sure that all 3 fields were provided
    if (!name || !email || !message) {
      // Return a 400 error Bad Request if any of the required fields are missing
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), {
        status: 400,
      });
    }
    // Send the email

    // Construct the email boddy

    const html = `<h2>NFluent Stack Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      `;
    // Attempt to send the email, the HTML content for the email

    const success = await submitContactForm({
      to: "przemek.lewtak@gmail.com",
      subject: `Contact Form Message from ${name}`,
      html,
    });

    // Return success or failure
    if (success.success) {
      return new Response(
        JSON.stringify({
          success: true,
        }),
        { status: 200 }
      );
    } else {
      // Return 500 Internal Server Error if email sending failed
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send email",
        }),
        {
          status: 500,
        }
      );
    }
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server Error",
      }),
      { status: 500 }
    );
  }
}
