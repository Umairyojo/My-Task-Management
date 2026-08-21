import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error(
    "[NextAuth] Google OAuth is disabled. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in frontend/.env.local. Expected callback: http://localhost:3000/api/auth/callback/google",
  );
}

if (!authSecret) {
  console.error(
    "[NextAuth] No auth secret is configured. Set AUTH_SECRET in frontend/.env.local.",
  );
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  providers:
    googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : [],
  pages: {
    signIn: "/login",
  },
};
