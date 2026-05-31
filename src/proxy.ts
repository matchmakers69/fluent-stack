import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (_auth, req) => {
  // API routes — skip i18n, return without redirect
  if (isApiRoute(req)) return;

  return handleI18nRouting(req);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
