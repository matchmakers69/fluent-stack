import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google"

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

const fonts = [jakartaFont, outfitFont, geistMonoFont]
export const fontsClassName = fonts.map((f) => f.variable).join(" ")
