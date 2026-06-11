"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileAvatarUpload() {
  const { user } = useUser();
  const t = useTranslations("account.profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (() => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return "U";
  })();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error(t("toastImageSize"));
      return;
    }
    try {
      await user.setProfileImage({ file });
      toast.success(t("toastImageSuccess"));
    } catch {
      toast.error(t("toastImageError"));
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-secondary/20 p-5 text-center sm:text-left">
      <div className="relative shrink-0">
        <Avatar className="size-20 border-2 border-primary">
          <AvatarImage src={user?.imageUrl} alt={fullName || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="default"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 size-8 rounded-full p-0 shadow-none border-none"
          aria-label={t("photoButton")}
        >
          <Camera className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      <div>
        <p className="font-bold text-foreground">{t("photoTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("photoDescription")}</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3"
        >
          <Camera className="size-4" />
          {t("photoButton")}
        </Button>
      </div>
    </div>
  );
}
