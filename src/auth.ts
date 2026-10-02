import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyAccount } from "@/lib/auth/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        try {
          return await verifyAccount({ email, password });
        } catch (error) {
          // A database outage must not lock the user out of the app.
          console.error("Failed to verify credentials", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  trustHost: true,
});
