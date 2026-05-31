import { SITE_URL, TEACHER_NAME, SITE_NAME } from "./seo";

type Locale = "pl" | "en";

export function personSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: TEACHER_NAME,
    jobTitle: locale === "pl" ? "Nauczyciel języka angielskiego" : "English Language Teacher",
    url: SITE_URL,
    worksFor: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    knowsAbout:
      locale === "pl"
        ? [
            "angielski dla programistów",
            "Business English",
            "przygotowanie do matury",
            "Cambridge CAE",
            "Cambridge FCE",
          ]
        : [
            "English for developers",
            "Business English",
            "Matura preparation",
            "Cambridge CAE",
            "Cambridge FCE",
          ],
  };
}

export function educationalOrganizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      locale === "pl"
        ? "Indywidualne lekcje angielskiego online dla programistów, biznesu i maturzystów."
        : "Individual online English lessons for developers, business professionals and exam candidates.",
    founder: { "@type": "Person", name: TEACHER_NAME },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "pl" ? "Kursy angielskiego" : "English Courses",
      itemListElement:
        locale === "pl"
          ? [
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "Angielski dla programistów" },
              },
              { "@type": "Offer", itemOffered: { "@type": "Course", name: "Business English" } },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "Przygotowanie do matury z angielskiego" },
              },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "Przygotowanie do CAE/FCE" },
              },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "Konwersacje po angielsku" },
              },
            ]
          : [
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "English for Developers" },
              },
              { "@type": "Offer", itemOffered: { "@type": "Course", name: "Business English" } },
              { "@type": "Offer", itemOffered: { "@type": "Course", name: "Matura Preparation" } },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Course", name: "Cambridge CAE/FCE Preparation" },
              },
              { "@type": "Offer", itemOffered: { "@type": "Course", name: "Speaking Practice" } },
            ],
    },
  };
}

export function localBusinessSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: SITE_NAME,
    description: locale === "pl" ? "Korepetycje z angielskiego online" : "Online English tutoring",
    url: SITE_URL,
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Poland" },
    availableLanguage: ["Polish", "English"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "21:00",
    },
  };
}

export function faqPageSchema(locale: Locale) {
  const faqs = {
    pl: [
      {
        q: "Jak wyglądają lekcje angielskiego online?",
        a: "Lekcje odbywają się przez wideokonferencję (Zoom lub Google Meet). Każda lekcja trwa 50 minut i jest w pełni dostosowana do Twoich potrzeb i celów nauki.",
      },
      {
        q: "Czy oferujesz angielski specjalnie dla programistów?",
        a: "Tak, specjalizuję się w angielskim technicznym dla programistów i osób IT. Pracujemy nad słownictwem z code review, standupów, dokumentacji technicznej i rozmów kwalifikacyjnych po angielsku.",
      },
      {
        q: "Jak przygotowujesz do matury z angielskiego?",
        a: "Prowadzę intensywne korepetycje do matury z angielskiego na poziomie podstawowym i rozszerzonym. Program obejmuje czytanie, słuchanie, pisanie i mówienie.",
      },
      {
        q: "Czy przygotowujesz do egzaminu CAE lub FCE Cambridge?",
        a: "Tak, przygotowuję do egzaminów FCE (B2 First) i CAE (C1 Advanced). Razem przerabiamy wszystkie cztery sprawności językowe i uczymy się strategii egzaminacyjnych.",
      },
      {
        q: "Jak zarezerwować pierwszą lekcję?",
        a: 'Kliknij przycisk "Zarezerwuj lekcję" i wybierz termin który Ci odpowiada. Pierwsza lekcja to rozmowa o Twoich celach i ustalenie indywidualnego planu nauki.',
      },
    ],
    en: [
      {
        q: "How do online English lessons work?",
        a: "Lessons take place via video conference (Zoom or Google Meet). Each lesson lasts 50 minutes and is fully tailored to your goals and needs.",
      },
      {
        q: "Do you offer English lessons for software developers?",
        a: "Yes, I specialise in technical English for developers and IT professionals — code reviews, stand-ups, technical documentation and English job interviews.",
      },
      {
        q: "Do you prepare students for Cambridge exams?",
        a: "Yes, I offer preparation for FCE (B2 First) and CAE (C1 Advanced), covering all four skills and exam strategies.",
      },
      {
        q: "How do I book a trial lesson?",
        a: 'Click "Book a lesson", choose a time that suits you, and we will discuss your goals and build a personalised study plan together.',
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs[locale].map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function courseSchema(params: {
  name: string;
  description: string;
  url: string;
  teaches?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    url: params.url,
    provider: { "@type": "Person", name: TEACHER_NAME, url: SITE_URL },
    teaches: params.teaches,
    courseMode: "online",
    educationalLevel: "Any",
    inLanguage: "en",
  };
}
