import { OpenAIProvider } from "./openai";
import type { AIProvider } from "./base";

export type { AIProvider, AIMessage, AICompletionOptions } from "./base";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    if (process.env.OPENROUTER_API_KEY) {
      _provider = new OpenAIProvider();
    } else {
      throw new Error("No AI provider configured. Set OPENROUTER_API_KEY.");
    }
  }
  return _provider;
}

export function setAIProvider(provider: AIProvider): void {
  _provider = provider;
}
