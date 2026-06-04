import { type NextRequest } from "next/server";
import { runShoppingAgent } from "@/lib/agents/orchestrator";
import { apiSuccess, apiError } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { searchQuerySchema } from "@/lib/validation/schemas";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
    ),
  ]);
}

const SEARCH_TIMEOUT = parseInt(process.env.SEARCH_TIMEOUT ?? "25000");

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateCheck = await checkRateLimit(`search:${ip}`);
  if (!rateCheck.success) {
    return apiError("Rate limit exceeded", 429);
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const store = searchParams.get("store") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10");

  const parsed = searchQuerySchema.safeParse({ q: query, store, page, pageSize });
  if (!parsed.success) {
    return apiError("Invalid query parameters", 400, parsed.error.flatten());
  }

  try {
    const result = await withTimeout(runShoppingAgent(parsed.data.q), SEARCH_TIMEOUT);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return apiError(message, 500);
  }
}
