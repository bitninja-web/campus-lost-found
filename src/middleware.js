export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (auth page)
     * - /api/auth (NextAuth endpoints)
     * - /api/seed (seeder)
     * - /_next (Next.js internals)
     * - /favicon.ico, /uploads (static files)
     */
    "/((?!login|api/auth|api/seed|_next|favicon\\.ico|uploads).*)",
  ],
};
