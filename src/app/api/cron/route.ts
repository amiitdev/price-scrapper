import { type NextRequest } from "next/server";
import { runDailyTasks } from "@/lib/scheduler";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
  }

  try {
    const results = await runDailyTasks();
    return apiSuccess(results);
  } catch (error) {
    return apiError("Cron job failed", 500);
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
  }

  const results = await runDailyTasks();
  return apiSuccess(results);
}
