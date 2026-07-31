import { z } from "zod";

type TranslateFn = (key: string) => string;

const NAME_REGEX = /^[\p{L}]+([ '-][\p{L}']+)*$/u;

export function createContactSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("form.nameError"))
      .max(50, t("form.nameMaxError"))
      .regex(NAME_REGEX, t("form.nameFormatError")),
    email: z
      .string()
      .trim()
      .min(1, t("form.emailError"))
      .check(z.email({ error: t("form.emailError") })),
    message: z.string().min(10, t("form.messageError")),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;

export const serverContactSchema = z.object({
  name: z.string().trim().min(2).max(50).regex(NAME_REGEX),
  email: z.string().trim().check(z.email()).max(254),
  message: z.string().trim().min(10).max(5000),
});
