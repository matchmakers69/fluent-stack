import type { Metadata } from "next"
import { buildAlternates, buildOpenGraph, buildTwitterCard, buildCanonicalUrl } from "@/lib/seo"
import { courseSchema } from "@/lib/structured-data"
import type { SupportedLocale } from "@/lib/seo"

type Params = Promise<{ locale: string }>

const meta = {
  pl: {
    title: "Angielski dla Programistów Online | IT English",
    description:
      "Kurs angielskiego specjalnie dla programistów i osób z branży IT. Code review, standupy, dokumentacja techniczna, rozmowy kwalifikacyjne — po angielsku. Lekcje online.",
    keywords: [
      "angielski dla programistów",
      "angielski IT online",
      "angielski techniczny online",
      "english dla programistów",
      "kurs angielskiego IT",
      "angielski dla developerów",
      "technical english online",
    ],
  },
  en: {
    title: "English for Developers & IT Professionals Online",
    description:
      "Specialised English lessons for software developers and IT professionals. Master code reviews, stand-ups, technical documentation and job interviews in English.",
    keywords: [
      "english for developers",
      "english for programmers",
      "technical english online",
      "it english lessons",
      "english for software engineers",
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
    alternates: buildAlternates(l, "/dla-programistow"),
    openGraph: buildOpenGraph({
      title: m.title,
      description: m.description,
      locale: l,
      path: "/dla-programistow",
    }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  }
}

export default async function DlaProgramistowPage({ params }: { params: Params }) {
  const { locale } = await params
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale

  const schema = courseSchema({
    name: l === "pl" ? "Angielski dla Programistów" : "English for Developers",
    description: meta[l].description,
    url: buildCanonicalUrl(l, "/dla-programistow"),
    teaches:
      l === "pl"
        ? ["code review po angielsku", "standupy w języku angielskim", "dokumentacja techniczna", "rozmowy kwalifikacyjne IT"]
        : ["code reviews in English", "stand-ups in English", "technical documentation", "IT job interviews"],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
        <h1>{l === "pl" ? "Angielski dla Programistów" : "English for Developers"}</h1>
      </main>
    </>
  )
}
