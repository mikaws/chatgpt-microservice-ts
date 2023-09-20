import { ChatCompletionMessageRoleEnum } from "./OpenAIRoles";

export interface ChatCompletionRequestMessage {
  role: ChatCompletionMessageRoleEnum;
  content: string;
  name?: string;
}

export interface CreateChatCompletionRequest {
  model: string;
  messages: Array<ChatCompletionRequestMessage>;
  temperature?: number | null;
  top_p?: number | null;
  n?: number | null;
  stop?: Array<string> | string;
  max_tokens?: number;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
}
