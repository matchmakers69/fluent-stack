import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared"

export default function HomePage() {
  return (
    <main className="min-h-screen pt-32 px-8 md:px-16 max-w-4xl mx-auto">
      <p style={{ fontFamily: "var(--font-outfit)" }}>
        Outfit direct test
      </p>
      <h1>Plus Jakarta Sans — Heading h1</h1>
      <h2>Heading h2 — fluid and responsive</h2>
      <h3>Heading h3</h3>
      <h4>Heading h4</h4>
      <p>
        Outfit body text — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Fluid typography scales smoothly across all screen sizes. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur.
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
          labelVariant="yellow"
          title="Who is learning right now?"
          description="English tutoring for developers and students across all levels."
        />
        <SectionHeading
          label="O mnie"
          labelVariant="cyan"
          title="Cześć, jestem Piotr"
          align="center"
        />
        <SectionHeading
          label="Rezerwacja"
          labelVariant="pink"
          title="Zarezerwuj swoją lekcję"
          description="Wybierz termin który Ci odpowiada."
        />
      </div>
    </main>
  )
}
