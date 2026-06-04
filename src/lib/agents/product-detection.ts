import { getAIProvider } from "../ai/providers";
import { PRODUCT_DETECTION_SYSTEM_PROMPT } from "../ai/prompts";

export interface ParsedProduct {
  brand: string | null;
  product: string;
  category: string | null;
  storage: string | null;
  color: string | null;
  variant: string | null;
  minBudget: number | null;
  maxBudget: number | null;
}

export async function detectProduct(query: string): Promise<ParsedProduct> {
  const provider = getAIProvider();
  const result = await provider.completeJSON<ParsedProduct>(
    [
      { role: "system", content: PRODUCT_DETECTION_SYSTEM_PROMPT },
      { role: "user", content: `Parse this shopping query: "${query}"` },
    ],
    { temperature: 0.1 },
  );
  return result;
}
