"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { serverProfileSchema } from "@/lib/validations/profile";

export async function updateProfileAction(input: z.infer<typeof serverProfileSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthenticated" };

  const parsed = serverProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const { firstName, lastName, phone } = parsed.data;

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName,
      lastName: lastName || undefined,
      unsafeMetadata: { phoneNumber: phone },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}
