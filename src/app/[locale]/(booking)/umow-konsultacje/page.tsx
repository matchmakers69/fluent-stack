import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates, buildOpenGraph, buildTwitterCard } from "@/lib/seo";
import type { SupportedLocale } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

const meta = {
  pl: {
    title: "Zarezerwuj Lekcję Angielskiego Online",
    description:
      "Zarezerwuj swoją lekcję angielskiego online. Wybierz termin który Ci odpowiada i zacznij naukę już dziś. Angielski dla programistów, Business English, matura i Cambridge.",
    keywords: [
      "rezerwacja lekcji angielskiego",
      "zarezerwuj lekcję angielskiego",
      "lekcja angielskiego online rezerwacja",
    ],
  },
  en: {
    title: "Book an English Lesson Online",
    description:
      "Book your online English lesson. Choose a time that suits you and start learning today.",
    keywords: ["book english lesson", "online english lesson booking"],
  },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale;
  const m = meta[l];

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: buildAlternates(l, "/umow-konsultacje"),
    openGraph: buildOpenGraph({
      title: m.title,
      description: m.description,
      locale: l,
      path: "/umow-konsultacje",
    }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  };
}

export default async function UmowKonsultacjePage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return <h1>{t("title")}</h1>;
}
