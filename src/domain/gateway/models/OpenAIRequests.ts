import { ChatCompletionMessageRole } from "./OpenAIRoles";

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: ChatCompletionMessageRole;
    content: string;
    name?: string;
  }>;
  temperature?: number | null;
  top_p?: number | null;
  n?: number | null;
  stop?: Array<string> | string;
  max_tokens?: number;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
}
