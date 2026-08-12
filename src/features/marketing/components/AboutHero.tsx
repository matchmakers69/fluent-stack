import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

export function AboutHero() {
  const t = useTranslations("about");

  return (
    <section id="about-page">
      <div className="px-8 md:px-16 lg:px-20 pt-6 md:pt-8">
        <h1>{t("title")}</h1>
        <p className="text-muted-foreground mt-4 mb-8 max-w-md">{t("intro")}</p>
        <Button asChild variant="default" size="lg">
          <Link href="/umow-konsultacje">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
