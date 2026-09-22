import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Edge-safe subset of the NextAuth config: no Prisma/bcrypt here so this can
 * be imported by middleware (Edge runtime). The full config in `auth.ts`
 * (Node runtime) spreads this and adds the adapter + Credentials provider.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
