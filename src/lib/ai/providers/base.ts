export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string>;
  completeJSON<T>(messages: AIMessage[], options?: AICompletionOptions): Promise<T>;
  isAvailable(): boolean;
}
