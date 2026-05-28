import { Plus_Jakarta_Sans, Outfit, Geist_Mono, Archivo_Black, Anton } from "next/font/google"

const jakartaFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
})

const outfitFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
})

const geistMonoFont = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

const archivoBlackFont = Archivo_Black({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
})

const antonFont = Anton({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-accent",
  weight: "400",
})

const fonts = [jakartaFont, outfitFont, geistMonoFont, archivoBlackFont, antonFont]
export const fontsClassName = fonts.map((f) => f.variable).join(" ")
