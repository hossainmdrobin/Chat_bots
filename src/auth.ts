import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/auth/upsert-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        await upsertUser({ email: user.email, profilePicture: user.image });
      } catch (error) {
        // A database outage must not lock the user out of the app.
        console.error("Failed to persist user", error);
      }

      return true;
    },
  },
});