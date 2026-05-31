import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <p className="font-accent text-[6rem] md:text-[10rem] leading-none text-destructive select-none">
        404
      </p>
      <h1 className="mt-4 mb-3">{t("title")}</h1>
      <p className="text-muted-foreground max-w-md mb-8">{t("description")}</p>
      <Button asChild variant="default" size="lg">
        <Link href="/">{t("cta")}</Link>
      </Button>
    </main>
  );
}
