export type ChatCompletionConfigInputDTO = {
  model: string;
  modelMaxTokens: number;
  temperature: number;
  topP: number;
  n: number;
  stop: Array<string>;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  initialSystemMessage: string;
};

export type ChatCompletionInputDTO = {
  chatId: string;
  userId: string;
  userMessage: string;
  config: ChatCompletionConfigInputDTO;
};

export type ChatCompletionOutputDTO = {
  chatId: string;
  userId: string;
  content: string;
};
