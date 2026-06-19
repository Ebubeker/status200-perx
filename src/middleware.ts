import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything behind the role views requires a session.
// Public: "/", "/sign-in", "/sign-up", and the Lemon Squeezy webhook (/api/*).
const isProtected = createRouteMatcher(["/app(.*)", "/employer(.*)", "/provider(.*)", "/billing(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
