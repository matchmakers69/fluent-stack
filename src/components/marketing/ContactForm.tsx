"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { sendContactMessage } from "@/app/[locale]/(marketing)/kontakt/actions";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContactSchema, type ContactFormValues } from "@/lib/validations/contact";

const inputClass =
  "h-12 w-full rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow]";

const textareaClass =
  "w-full rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow] min-h-[140px] resize-none";

export function ContactForm() {
  const t = useTranslations("contact");

  const contactSchema = createContactSchema(t);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onContactFormSubmit(_values: ContactFormValues) {
    try {
      const response = await sendContactMessage(_values);

      if (response.success) {
        form.reset();
        toast.success(response.message ?? t("form.successMessage"));
      } else {
        toast.error(response.message ?? t("form.errorMessage"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("form.errorMessage"));
    }
  }

  return (
    <div id="contact-form-container" className="w-full space-y-8">
      <SectionHeading
        label={t("form.sectionLabel")}
        title={t("form.sectionTitle")}
        description={t("form.sectionDescription")}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onContactFormSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-base">
                  {t("form.name")}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.namePlaceholder")}
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-base">
                  {t("form.email")}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("form.emailPlaceholder")}
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-base">
                  {t("form.message")}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("form.messagePlaceholder")}
                    className={textareaClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="default">
            {t("form.submit")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
