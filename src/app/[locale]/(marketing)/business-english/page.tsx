import type { Metadata } from "next";
import { buildAlternates, buildOpenGraph, buildTwitterCard, buildCanonicalUrl } from "@/lib/seo";
import { courseSchema } from "@/lib/structured-data";
import type { SupportedLocale } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

const meta = {
  pl: {
    title: "Business English Online | Angielski Biznesowy",
    description:
      "Profesjonalne lekcje Business English online. Nauka angielskiego do pracy w korporacji: prezentacje, negocjacje, e-maile biznesowe, rozmowy telefoniczne i spotkania po angielsku.",
    keywords: [
      "business english online",
      "angielski biznesowy",
      "kurs business english",
      "angielski do pracy",
      "angielski korporacyjny online",
      "business english dla dorosłych",
    ],
  },
  en: {
    title: "Business English Online Lessons",
    description:
      "Professional Business English lessons online. Improve your corporate communication: presentations, negotiations, business emails and meetings in English.",
    keywords: [
      "business english online",
      "business english lessons",
      "corporate english online",
      "professional english lessons",
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
    alternates: buildAlternates(l, "/business-english"),
    openGraph: buildOpenGraph({
      title: m.title,
      description: m.description,
      locale: l,
      path: "/business-english",
    }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  };
}

export default async function BusinessEnglishPage({ params }: { params: Params }) {
  const { locale } = await params;
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale;

  const schema = courseSchema({
    name: "Business English",
    description: meta[l].description,
    url: buildCanonicalUrl(l, "/business-english"),
    teaches:
      l === "pl"
        ? [
            "prezentacje po angielsku",
            "negocjacje w języku angielskim",
            "e-maile biznesowe",
            "spotkania korporacyjne",
          ]
        : [
            "presentations in English",
            "business negotiations",
            "business emails",
            "corporate meetings",
          ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
        <h1>Business English</h1>
      </main>
    </>
  );
}
