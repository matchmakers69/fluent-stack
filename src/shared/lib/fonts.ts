import { Geist_Mono, Archivo_Black, Space_Grotesk } from "next/font/google";

const archivoBlackFont = Archivo_Black({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});

const spaceGroteskFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMonoFont = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const fonts = [geistMonoFont, archivoBlackFont, spaceGroteskFont];
export const fontsClassName = fonts.map((f) => f.variable).join(" ");
