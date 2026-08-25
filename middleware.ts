import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Company-only routes
    if (path.startsWith("/company")) {
      if (!token || token.role !== "COMPANY") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (token.status !== "APPROVED") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Blocked/rejected users can't reach protected pages at all
    if (token && (token.status === "BLOCKED" || token.status === "REJECTED")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/company/:path*",
    "/profile/:path*",
    "/my-applications/:path*",
  ],
};
