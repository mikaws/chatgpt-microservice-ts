import { ChatGateway } from "../../domain/gateway/ChatGateway";
import { OpenAIApi } from "openai";
import { Either, left, right } from "../../shared/either";

type ChatCompletionConfigInputDTO = {
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

type ChatCompletionInputDTO = {
  chatId: string;
  userId: string;
  userMessage: string;
  config: ChatCompletionConfigInputDTO;
};

type ChatCompletionOutputDTO = {
  chatId: string;
  userId: string;
  content: string;
};

export class ChatCompletionUseCase {
  readonly chatGateway: ChatGateway;
  readonly openAiClient: OpenAIApi;

  constructor(chatGateway: ChatGateway, openAiClient: OpenAIApi) {
    this.chatGateway = chatGateway;
    this.openAiClient = openAiClient;
  }

  execute(
    input: ChatCompletionInputDTO
  ): Either<Error, ChatCompletionOutputDTO> {
    const chatOrError = this.chatGateway.findChatById(input.chatId);
    if (chatOrError.isLeft()) {
      const error = chatOrError.value;
      if (error.message == "chat not found") return left(chatOrError.value);
      return left(new Error("error fetching existing chat"));
    }
    return right({
      chatId: input.chatId,
      content: "mock",
      userId: input.userId,
    }); // content is mocked for now
  }
}
