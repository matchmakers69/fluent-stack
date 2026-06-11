"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const inputClass =
  "h-12 w-full rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow]";

export function SignInForm() {
  const { signIn } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();
  const t = useTranslations("authentication.signIn");

  const signInSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, t("form.errors.emailRequired"))
      .check(z.email({ error: t("form.errors.invalidEmail") })),
    password: z.string().min(1, t("form.errors.passwordRequired")),
  });

  type SignInFormValues = z.infer<typeof signInSchema>;

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);
    setGeneralError("");

    try {
      const { error: passwordError } = await signIn.password({
        emailAddress: values.email,
        password: values.password,
      });

      if (passwordError) {
        if (passwordError.code === "strategy_for_user_invalid") {
          setGeneralError(t("form.errors.googleOnly"));
        } else {
          setGeneralError(
            passwordError.longMessage ?? passwordError.message ?? t("form.errors.general")
          );
        }
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setGeneralError(t("form.errors.general"));
          return;
        }
        router.push("/account/profile");
      } else {
        setGeneralError(t("form.errors.general"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-8">
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="font-bold text-base">
                    {t("form.password")}
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <Link
                    href="/authentication/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    {t("form.forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" className={inputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {generalError && <FieldError message={generalError} className="justify-center" />}

          <Button type="submit" disabled={isLoading} size="default" className="w-full">
            {isLoading ? t("form.loading") : t("form.submit")}
          </Button>
        </form>
      </Form>

      <GoogleSignInButton label={t("form.googleButton")} />

      <p className="text-center text-sm">
        {t("form.noAccount")}{" "}
        <Link href="/authentication/sign-up" className="underline underline-offset-4">
          {t("form.signUpLink")}
        </Link>
      </p>
    </div>
  );
}
