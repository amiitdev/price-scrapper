import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/price-scraper"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  AI_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENAI_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  PLAYWRIGHT_WS_ENDPOINT: z.string().optional(),
  BROWSER_TIMEOUT: z.coerce.number().default(30000),
  NEXT_TELEMETRY_DISABLED: z.coerce.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
    return envSchema.parse({
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret",
    });
  }
  return parsed.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
