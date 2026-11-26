// Types for the fields lib/auth.ts puts on the NextAuth user, token and session (id, role, status), so
// code can read session.user.role etc. without `as any`. Types only: nothing here changes behaviour.
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role: string; // Role enum: STUDENT | COMPANY | ADMIN
      status: string; // AccountStatus enum: APPROVED | PENDING | BLOCKED | REJECTED
    };
  }
  interface User {
    role?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
  }
}
