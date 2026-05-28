import type { Metadata } from "next"
import { buildAlternates, buildOpenGraph, buildTwitterCard } from "@/lib/seo"
import type { SupportedLocale } from "@/lib/seo"

type Params = Promise<{ locale: string }>

const meta = {
  pl: {
    title: "O Mnie | Nauczyciel Angielskiego Online",
    description:
      "Poznaj swojego nauczyciela angielskiego. Doświadczony lektor specjalizujący się w angielskim dla programistów, Business English i przygotowaniu do matury oraz egzaminów Cambridge.",
    keywords: [
      "nauczyciel angielskiego online",
      "lektor angielskiego",
      "korepetycje angielski online",
    ],
  },
  en: {
    title: "About Me | Online English Teacher",
    description:
      "Meet your English teacher. Experienced tutor specialising in English for developers, Business English, Matura and Cambridge exam preparation.",
    keywords: ["english teacher online", "english tutor", "online english teacher poland"],
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
    alternates: buildAlternates(l, "/o-mnie"),
    openGraph: buildOpenGraph({ title: m.title, description: m.description, locale: l, path: "/o-mnie" }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  }
}

export default function AboutMePage() {
  return <h1>O mnie</h1>
}
