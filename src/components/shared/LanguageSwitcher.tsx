"use client"
import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LOCALE_FLAGS: Record<string, string> = {
  pl: "🇵🇱",
  en: "🇬🇧",
}

interface LanguageSwitcherProps {
  scrolled?: boolean
  mobile?: boolean
}

export function LanguageSwitcher({
  scrolled = false,
  mobile = false,
}: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("languages")

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {
      locale: newLocale as (typeof routing.locales)[number],
    })
  }

  if (mobile) {
    return (
      <div className="flex gap-2 mb-4">
        {routing.locales.map((loc) => (
          <Button
            key={loc}
            variant={loc === locale ? "white" : "auth-signout"}
            size="sm"
            onClick={() => handleLocaleChange(loc)}
            className="flex-1"
          >
            {LOCALE_FLAGS[loc]} {t(loc)}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "font-bold",
            scrolled
              ? "text-white hover:text-white hover:bg-white/20"
              : "text-foreground"
          )}
        >
          {LOCALE_FLAGS[locale]} {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              "font-bold cursor-pointer",
              loc === locale && "bg-muted"
            )}
          >
            {LOCALE_FLAGS[loc]} {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
