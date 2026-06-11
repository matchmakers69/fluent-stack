import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createProfileSchema(t: TranslateFn) {
  return z.object({
    firstName: z.string().trim().min(1, t("firstNameRequired")).max(50, t("firstNameMax")),
    lastName: z.string().trim().max(50, t("lastNameMax")),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || /^\+?[\d\s\-(). ]{7,}$/.test(val),
        { message: t("phoneInvalid") }
      ),
  });
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

export const serverProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().max(50),
  phone: z.string().trim().max(30),
});
