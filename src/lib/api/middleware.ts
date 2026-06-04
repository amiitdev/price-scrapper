import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type Handler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

interface MiddlewareOptions {
  rateLimit?: boolean;
  auth?: boolean;
}

export function withMiddleware(
  handler: Handler,
  options: MiddlewareOptions = {},
) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      if (options.auth) {
        const session = await getAuthSession(req);
        if (!session) {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          );
        }
        const requestWithSession = Object.assign(req, { session });
        return handler(requestWithSession, context);
      }
      return handler(req, context);
    } catch (error) {
      console.error("API middleware error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

async function getAuthSession(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev-jwt-secret",
      ) as { userId: string; email: string; role: string };
      return decoded;
    } catch {
      return null;
    }
  }
  return null;
}
