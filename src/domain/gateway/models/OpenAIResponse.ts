import { ChatCompletionMessageRoleEnum } from "./OpenAIRoles";

export interface CreateChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<CreateChatCompletionResponseChoicesInner>;
  usage?: CreateCompletionResponseUsage;
}

export interface CreateChatCompletionResponseChoicesInner {
  index?: number;
  message?: ChatCompletionResponseMessage;
  finish_reason?: string;
}

export interface ChatCompletionResponseMessage {
  role: ChatCompletionMessageRoleEnum;
  content: string;
}

export interface CreateCompletionResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
