import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole;
  }
}

// Admin email - set this to your email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

// Development mode: log magic links to console instead of sending emails
const isDev = process.env.NODE_ENV === "development";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  // Use JWT sessions so middleware can work in Edge runtime
  session: { strategy: "jwt" },
  providers: [
    // Magic link for clients (low friction)
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "Samantha Merlin <noreply@samanthamerlin.com>",
      // In development, log the magic link to console
      ...(isDev && !process.env.AUTH_RESEND_KEY && !process.env.RESEND_API_KEY && {
        sendVerificationRequest: async ({ identifier, url }) => {
          console.log("\n" + "=".repeat(60));
          console.log("MAGIC LINK LOGIN (Development Mode)");
          console.log("=".repeat(60));
          console.log(`Email: ${identifier}`);
          console.log(`Login URL: ${url}`);
          console.log("=".repeat(60) + "\n");
        },
      }),
    }),
    // Google OAuth for admin and clients who prefer it
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      // Auto-assign ADMIN role for the admin email
      if (user.email === ADMIN_EMAIL && ADMIN_EMAIL) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" },
        }).catch(() => {
          // User might not exist yet, that's fine
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // On sign in, add user role to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-assign ADMIN role for the admin email on first sign up
      if (user.email === ADMIN_EMAIL && ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
});
