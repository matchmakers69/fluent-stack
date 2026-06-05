import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

// Route protection is handled in (dashboard)/layout.tsx, not here.
// Middleware-level auth.protect() is unreliable with localePrefix: "as-needed"
// because Polish routes have no locale prefix, so path matchers never match them.
export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) return;
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
