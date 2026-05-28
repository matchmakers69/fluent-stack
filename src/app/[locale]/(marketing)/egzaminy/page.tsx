import type { Metadata } from "next"
import { buildAlternates, buildOpenGraph, buildTwitterCard, buildCanonicalUrl } from "@/lib/seo"
import { courseSchema } from "@/lib/structured-data"
import type { SupportedLocale } from "@/lib/seo"

type Params = Promise<{ locale: string }>

const meta = {
  pl: {
    title: "Przygotowanie do Matury i CAE Online | Egzaminy z Angielskiego",
    description:
      "Skuteczne przygotowanie do matury z angielskiego i egzaminów Cambridge: FCE (B2 First) i CAE (C1 Advanced). Indywidualne lekcje online z doświadczonym nauczycielem.",
    keywords: [
      "przygotowanie do matury angielski",
      "przygotowanie do CAE",
      "przygotowanie do FCE",
      "egzamin CAE online",
      "egzamin FCE online",
      "matura angielski korepetycje",
      "przygotowanie do C1 angielski",
      "przygotowanie do B2 angielski",
      "Cambridge exam preparation online",
    ],
  },
  en: {
    title: "Cambridge & Matura Exam Preparation Online",
    description:
      "Expert preparation for Cambridge exams — B2 First (FCE) and C1 Advanced (CAE) — and Polish Matura. Individual online lessons with an experienced teacher.",
    keywords: [
      "cambridge exam preparation online",
      "cae preparation online",
      "fce preparation online",
      "b2 first preparation",
      "c1 advanced preparation",
      "matura english preparation",
    ],
  },
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale
  const m = meta[l]

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: buildAlternates(l, "/egzaminy"),
    openGraph: buildOpenGraph({
      title: m.title,
      description: m.description,
      locale: l,
      path: "/egzaminy",
    }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  }
}

export default async function EgzaminyPage({ params }: { params: Params }) {
  const { locale } = await params
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale

  const schema = courseSchema({
    name:
      l === "pl"
        ? "Przygotowanie do matury i egzaminów Cambridge"
        : "Cambridge & Matura Exam Preparation",
    description: meta[l].description,
    url: buildCanonicalUrl(l, "/egzaminy"),
    teaches:
      l === "pl"
        ? ["matura z angielskiego", "Cambridge FCE B2 First", "Cambridge CAE C1 Advanced", "strategie egzaminacyjne"]
        : ["English Matura exam", "Cambridge FCE B2 First", "Cambridge CAE C1 Advanced", "exam strategies"],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
        <h1>
          {l === "pl" ? "Przygotowanie do egzaminów" : "Exam Preparation"}
        </h1>
      </main>
    </>
  )
}
