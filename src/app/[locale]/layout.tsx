import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { personSchema, educationalOrganizationSchema } from "@/lib/structured-data";
import type { SupportedLocale } from "@/lib/seo";
import NextTopLoader from "nextjs-toploader";

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const l = (hasLocale(routing.locales, locale) ? locale : "pl") as SupportedLocale;

  return {
    alternates: buildAlternates(l, "/"),
    openGraph: buildOpenGraph({
      title: l === "pl" ? "FluentStack — Angielski Online" : "FluentStack — Online English Lessons",
      description:
        l === "pl"
          ? "Indywidualne lekcje angielskiego online. Angielski dla programistów, Business English, matura i Cambridge."
          : "Individual online English lessons. English for developers, Business English, Matura and Cambridge exams.",
      locale: l,
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  const l = locale as SupportedLocale;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema(l)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(educationalOrganizationSchema(l)),
        }}
      />
      <NextTopLoader color="oklch(0.72 0.19 152)" showSpinner={true} />
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </>
  );
}
