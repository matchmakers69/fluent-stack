import type { Metadata } from "next"
import { buildAlternates, buildOpenGraph, buildTwitterCard } from "@/lib/seo"
import type { SupportedLocale } from "@/lib/seo"

type Params = Promise<{ locale: string }>

const meta = {
  pl: {
    title: "Kontakt | Angielski Online",
    description:
      "Skontaktuj się w sprawie lekcji angielskiego online. Chętnie odpowiem na pytania dotyczące angielskiego dla programistów, Business English, matury i egzaminów Cambridge.",
    keywords: ["kontakt angielski online", "lekcje angielskiego kontakt"],
  },
  en: {
    title: "Contact | Online English Lessons",
    description:
      "Get in touch about online English lessons. Happy to answer questions about English for developers, Business English or exam preparation.",
    keywords: ["contact english tutor", "online english lessons contact"],
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
    alternates: buildAlternates(l, "/kontakt"),
    openGraph: buildOpenGraph({ title: m.title, description: m.description, locale: l, path: "/kontakt" }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  }
}

export default function KontaktPage() {
  return (
    <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
      <h1>Kontakt</h1>
    </main>
  )
}
