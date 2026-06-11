import { ClerkProvider } from "@clerk/nextjs";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { fontsClassName } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Angielski Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Indywidualne lekcje angielskiego online. Angielski dla programistów, Business English, przygotowanie do matury i egzaminów Cambridge.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale().catch(() => "pl");

  return (
    <html lang={locale} suppressHydrationWarning className={`${fontsClassName} h-full`}>
      <body className={`${fontsClassName} scroll-touch antialiased`}>
        <ClerkProvider>{children}</ClerkProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
