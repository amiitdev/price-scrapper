import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const publicPaths = ["/", "/search", "/api/search", "/api/compare", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/") && !publicPaths.some((p) => pathname.startsWith(p))) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-jwt-secret") as {
        userId: string;
        email: string;
      };
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.userId);
      requestHeaders.set("x-user-email", decoded.email);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
