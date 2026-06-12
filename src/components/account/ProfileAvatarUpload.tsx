"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};
const MAGIC_BYTES: { type: string; bytes: number[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
];

function readMagicBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

function matchesMagicBytes(bytes: Uint8Array): boolean {
  return MAGIC_BYTES.some(({ bytes: signature }) =>
    signature.every((byte, i) => bytes[i] === byte)
  );
}

export function ProfileAvatarUpload() {
  const { user } = useUser();
  const t = useTranslations("account.profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    e.target.value = "";

    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("toastImageSize"));
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("toastImageError"));
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS[file.type]?.includes(ext)) {
      toast.error(t("toastImageError"));
      return;
    }

    const magicBytes = await readMagicBytes(file);
    if (!matchesMagicBytes(magicBytes)) {
      toast.error(t("toastImageError"));
      return;
    }

    setIsUploading(true);
    try {
      await user.setProfileImage({ file });
      toast.success(t("toastImageSuccess"));
    } catch {
      toast.error(t("toastImageError"));
    } finally {
      setIsUploading(false);
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
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 size-8 rounded-full p-0 shadow-none border-none"
          aria-label={t("photoButton")}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
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
          disabled={isUploading}
          className="mt-3"
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {t("photoButton")}
        </Button>
      </div>
    </div>
  );
}
