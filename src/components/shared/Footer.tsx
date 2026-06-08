import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Logo } from "./Logo";

type AppPathname = keyof typeof routing.pathnames;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("navigation");

  const navLinks: Array<{ label: string; href: AppPathname }> = [
    { label: tNav("home"), href: "/" },
    { label: tNav("about"), href: "/o-mnie" },
    { label: tNav("booking"), href: "/umow-konsultacje" },
    { label: tNav("contact"), href: "/kontakt" },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <div className="wrapper py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="text-white/70 text-sm max-w-[260px] leading-relaxed">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-bold text-secondary uppercase text-xs tracking-widest">
              {t("nav")}
            </span>
            <ul className="flex flex-col gap-3">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/75 hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex mt-10 mb-6 h-[3px] rounded-full overflow-hidden">
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-secondary" />
          <div className="flex-1 bg-destructive" />
          <div className="flex-1 bg-accent" />
          <div className="flex-1 bg-[--chart-1]" />
        </div>

        <p className="text-white/40 text-sm text-center">{t("copyright", { year })}</p>
      </div>
    </footer>
  );
}
