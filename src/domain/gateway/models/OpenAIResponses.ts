import { ChatCompletionMessageRole } from "./OpenAIRoles";

export interface ChatCompletionMessage {
  role: ChatCompletionMessageRole;
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  message: ChatCompletionMessage;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason?: string;
}
