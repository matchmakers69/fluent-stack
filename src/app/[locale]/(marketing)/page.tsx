import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared"
import { buildAlternates, buildOpenGraph, buildTwitterCard } from "@/lib/seo"
import { localBusinessSchema, faqPageSchema } from "@/lib/structured-data"
import type { SupportedLocale } from "@/lib/seo"

type Params = Promise<{ locale: string }>

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
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale
  const m = meta[l]

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: buildAlternates(l, "/"),
    openGraph: buildOpenGraph({ title: m.title, description: m.description, locale: l }),
    twitter: buildTwitterCard({ title: m.title, description: m.description }),
  }
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params
  const l = (locale === "en" ? "en" : "pl") as SupportedLocale

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
      <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
        <p style={{ fontFamily: "var(--font-outfit)" }}>Outfit direct test</p>
        <h1>Plus Jakarta Sans — Heading h1</h1>
        <h2>Heading h2 — fluid and responsive</h2>
        <h3>Heading h3</h3>
        <h4>Heading h4</h4>
        <p>
          Outfit body text — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fluid
          typography scales smoothly across all screen sizes. Sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <code>Geist Mono — code snippet</code>
        <div className="flex flex-wrap gap-4 mt-8">
          <Button variant="default">Default</Button>
          <Button variant="yellow">Yellow</Button>
          <Button variant="pink">Pink</Button>
          <Button variant="lavender">Lavender</Button>
          <Button variant="cyan">Cyan</Button>
        </div>

        <div className="mt-16 flex flex-col gap-16">
          <SectionHeading
            label="Featured"
            title="Who is learning right now?"
            description="English tutoring for developers and students across all levels."
          />
          <SectionHeading label="O mnie" title="Cześć, jestem Przemek" align="center" />
          <SectionHeading
            label="Rezerwacja"
            title="Zarezerwuj swoją lekcję"
            description="Wybierz termin który Ci odpowiada."
          />
        </div>

        <div className="mt-16 flex flex-col gap-8">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
            Display fonts
          </p>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Archivo Black — font-display</p>
            <p className="font-[family-name:var(--font-display)] text-5xl leading-tight">
              Learn English Your Way
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Anton — font-accent</p>
            <p className="font-[family-name:var(--font-accent)] text-5xl leading-tight">
              500+ STUDENTS
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
