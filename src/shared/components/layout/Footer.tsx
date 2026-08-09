import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Logo } from "./Logo";

type AppPathname = keyof typeof routing.pathnames;
const year = new Date().getFullYear();

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("navigation");

  const navLinks: Array<{ label: string; href: AppPathname }> = [
    { label: tNav("home"), href: "/" },
    { label: tNav("about"), href: "/o-mnie" },
    { label: tNav("booking"), href: "/umow-konsultacje" },
    { label: tNav("contact"), href: "/kontakt" },
  ];

  return (
    <footer className="bg-footer-bg text-white relative z-105 mt-25">
      <div
        id="footer-wave"
        className="absolute top-0 left-0 right-0 w-full zoom-100"
        style={{ transform: "translateY(calc(-100% + 2px))" }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 595 27"
          className="w-full block fill-footer-bg"
        >
          <path d="M595 27L595 7.506L587.626 4.865L579.829 8.47L575.701 8.383L563.747 14.926L555.428 14.383L554.889 13.358L547.445 16.622L537.815 19.473L532.042 18.094L524.582 16.64L515.858 14.508L516.26 14.807L510.32 14.951L504.857 13.73L501.227 9.501L493.842 9.059L485.202 8.846L481.729 13.224L480.763 12.371L475.78 11.903L465.068 16.339L463.015 14.259L454.014 19.879L452.491 18.042L445.323 19.187L436.83 19.618L433.851 21.517L427.105 22.101L416.404 21.627L405.582 16.677L395.22 16.857L393.175 15.286L385.945 10.479L374.779 11.381L371.637 14.648L360.858 18.91L356.651 17.775L350.088 15.82L332.208 12.062L323.534 8.376L325.549 10.297L318.002 7.475L311.028 13.85L301.59 8.818L298.612 9.74L292.275 9.102L288.849 1.393L280.658 7.616L270.154 9.891L251.242 7.974L247.857 0L235.28 4.563L219.98 1.144L217.031 2.575L210.687 1.805L206.759 0L202.257 1.231L199.144 1.575L194.128 3.747L192.593 6.172L175.609 14.072L173.424 15.192L170.546 12.633L162.935 18.322L155.1 19.513L151.063 15.053L148.872 12.366L140.965 14.171L135.822 7.746L128.334 5.476L129.009 0L118.435 0L111.528 2.698L92.464 4.726L86.653 3.13L75.635 11.602L58.31 10.315L47.468 16.427L34.834 15.101L31.265 9.956L28.981 10.914L26.422 5.413L23.534 7.894L13.221 0L10.174 2.904L4.453 0L0 0L0 27L595 27Z" />
        </svg>
      </div>
      <div className="wrapper py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="text-white/70 text-sm max-w-65 leading-relaxed">{t("tagline")}</p>
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

        <div className="flex mt-10 mb-6 h-0.75 rounded-full overflow-hidden">
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
