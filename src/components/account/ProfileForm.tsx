"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProfileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { updateProfileAction } from "@/app/[locale]/(account)/account/profile/actions";

const fieldClass =
  "h-12 rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export function ProfileForm({
  firstName,
  lastName,
  email,
  phone,
  isEditing,
  onEditStart,
  onEditEnd,
}: ProfileFormProps) {
  const t = useTranslations("account.profile");

  const profileSchema = useMemo(() => createProfileSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName, lastName, phone },
  });

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfileAction(values);
    if (result.success) {
      form.reset(values);
      toast.success(t("toastUpdateSuccess"));
      onEditEnd();
    } else {
      toast.error(t("toastUpdateError"));
    }
  }

  function handleCancel() {
    form.reset();
    onEditEnd();
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold">
                  <User className="size-4 text-primary" />
                  {t("firstName")}
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} className={fieldClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold">
                  <User className="size-4 text-primary" />
                  {t("lastName")}
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} className={fieldClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormLabel className="flex items-center gap-2 font-bold">
              <Mail className="size-4 text-primary" />
              {t("email")}
            </FormLabel>
            <Input type="email" value={email} readOnly disabled className={fieldClass} />
          </div>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold">
                  <Phone className="size-4 text-primary" />
                  {t("phone")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("phonePlaceholder")}
                    disabled={!isEditing}
                    className={fieldClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="default"
                disabled={form.formState.isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              >
                {form.formState.isSubmitting ? t("saving") : t("saveButton")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
              >
                {t("cancelButton")}
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={onEditStart}>
              {t("editButton")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
