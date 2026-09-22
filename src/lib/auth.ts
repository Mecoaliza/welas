import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { RATE_LIMITS, getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/modules/auth/validators";

export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

// Compared against when the e-mail doesn't exist, so response time doesn't reveal it.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 15 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // Rate limiting lives here (not only in the login form action) because
      // POST /api/auth/callback/credentials reaches authorize() directly.
      async authorize(rawCredentials, request) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const byEmail = rateLimit(`login:${parsed.data.email}`, RATE_LIMITS.login);
        const byIp = rateLimit(`login-ip:${getClientIp(request.headers)}`, RATE_LIMITS.loginIp);
        if (!byEmail.success || !byIp.success) throw new RateLimitedSignin();

        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        const isValid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user?.passwordHash || !isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
    // Social login is architecturally ready: these providers only activate
    // once AUTH_GOOGLE_ID/SECRET or AUTH_GITHUB_ID/SECRET are set in .env.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub] : []),
  ],
});
