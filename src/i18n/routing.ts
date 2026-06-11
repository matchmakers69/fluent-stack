import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/o-mnie": {
      pl: "/o-mnie",
      en: "/about-me",
    },
    "/kontakt": {
      pl: "/kontakt",
      en: "/contact",
    },
    "/umow-konsultacje": {
      pl: "/umow-konsultacje",
      en: "/book-a-consultation",
    },
    "/business-english": "/business-english",
    "/dla-programistow": {
      pl: "/dla-programistow",
      en: "/for-developers",
    },
    "/egzaminy": {
      pl: "/egzaminy",
      en: "/exams",
    },
    "/dashboard": "/dashboard",
    "/dashboard/profile": "/dashboard/profile",
    "/lekcje": {
      pl: "/lekcje",
      en: "/lessons",
    },
    "/materialy": {
      pl: "/materialy",
      en: "/materials",
    },
    "/uploads": "/uploads",
    "/authentication/sign-in": "/authentication/sign-in",
    "/authentication/sign-up": "/authentication/sign-up",
    "/authentication/forgot-password": "/authentication/forgot-password",
  },
});
