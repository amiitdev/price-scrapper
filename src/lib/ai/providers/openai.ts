import OpenAI from "openai";
import { type AIMessage, type AICompletionOptions, type AIProvider } from "./base";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "PriceScraper",
      },
    });
    this.defaultModel = process.env.AI_MODEL || "openai/gpt-4o-mini";
  }

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: options?.responseFormat === "json_object"
        ? { type: "json_object" }
        : undefined,
    });

    return response.choices[0]?.message?.content || "";
  }

  async completeJSON<T>(messages: AIMessage[], options?: AICompletionOptions): Promise<T> {
    const content = await this.complete(messages, {
      ...options,
      responseFormat: "json_object",
    });

    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`);
    }
  }
}
