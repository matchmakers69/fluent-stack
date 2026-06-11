"use client";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  scrolled?: boolean;
}

export function UserMenu({ scrolled = false }: UserMenuProps) {
  const { user, signOut } = useClerk();
  const t = useTranslations("navigation");
  const router = useRouter();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "cursor-pointer rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            scrolled ? "text-white" : "text-foreground"
          )}
          aria-label={t("accountMenu")}
        >
          <CircleUser className="size-7" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64 rounded-sm">
        <DropdownMenuLabel className="px-3 py-2 font-normal">
          <div className="flex flex-col gap-0.5">
            {fullName && (
              <span className="font-bold text-foreground truncate">{fullName}</span>
            )}
            {email && (
              <span className="text-xs text-muted-foreground truncate">{email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer px-3 py-2 font-semibold"
          onClick={() => router.push("/account/profile")}
        >
          {t("manageAccount")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer px-3 py-2 font-semibold"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
