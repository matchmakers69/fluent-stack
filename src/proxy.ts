import { clerkMiddleware } from "@clerk/nextjs/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const handleI18nRouting = createIntlMiddleware(routing)

export default clerkMiddleware(async (_auth, req) => {
  const url = req.nextUrl.pathname
  if (url.startsWith("/api")) return
  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
