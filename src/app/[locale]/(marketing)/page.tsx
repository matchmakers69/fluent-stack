import type { Metadata } from "next";
import { Hero } from "@/components/marketing";
import { buildAlternates, buildOpenGraph, buildTwitterCard } from "@/lib/seo";
import { localBusinessSchema, faqPageSchema } from "@/lib/structured-data";
import type { SupportedLocale } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

const meta = {
  pl: {
    title: "Angielski Online | Korepetycje z Angielskiego",
    description:
      "Indywidualne lekcje angielskiego online. Angielski dla programistów, Business English, przygotowanie do matury i egzaminów Cambridge CAE/FCE. Zarezerwuj lekcję próbną.",
    keywords: [
      "angielski online",
      "korepetycje z angielskiego",
      "lekcje angielskiego online",
      "angielski dla programistów",
      "business english online",
      "przygotowanie do matury angielski",
      "przygotowanie do CAE",
      "przygotowanie do FCE",
      "angielski dla dorosłych online",
    ],
  },
  en: {
    title: "Online English Lessons | English Tutor Poland",
    description:
      "Individual online English lessons. Specialising in English for developers, Business English, Matura and Cambridge exam preparation. Book a trial lesson.",
    keywords: [
      "online english lessons",
      "english tutor poland",
      "english for developers",
      "business english online",
      "cambridge exam preparation",
    ],
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
    alternates: buildAlternates(l, "/"),
    openGraph: buildOpenGraph({ title: m.title, description: m.description, locale: l }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  };
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(l)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(l)) }}
      />
      <Hero />
    </>
  );
}
