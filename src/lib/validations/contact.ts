import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createContactSchema(t: TranslateFn) {
  return z.object({
    name: z.string().trim().min(2, t("form.nameError")),
    email: z
      .string()
      .trim()
      .min(1, t("form.emailError"))
      .check(z.email({ error: t("form.emailError") })),
    message: z.string().min(10, t("form.messageError")),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
