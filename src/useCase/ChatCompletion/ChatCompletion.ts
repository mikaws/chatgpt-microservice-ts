import { ChatGateway } from "../../domain/gateway/ChatGateway";
import { OpenAIApi } from "openai";
import { Either, left, right } from "../../shared/either";
import { Chat, TChatConfig } from "../../domain/entity/Chat";
import { Model } from "../../domain/entity/Model";
import { Message } from "../../domain/entity/Message";

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
    let chatOrError = this.chatGateway.findChatById(input.chatId);
    let chat: Chat;
    let err: Error;

    if (chatOrError.isLeft()) {
      err = chatOrError.value;
      if (err.message == "chat not found") {
        const newChatOrError = this.createNewChat(input);
        if (newChatOrError.isLeft()) {
          err = newChatOrError.value;
          return left(err);
        }
        chat = newChatOrError.value;
      }
      return left(new Error("error fetching existing chat"));
    } else {
      chat = chatOrError.value;
    }

    const userMessageOrError = Message.create(
      "user",
      input.userMessage,
      chat.config.model
    );
    if (userMessageOrError.isLeft()) {
      return left(new Error("error creating user message"));
    }
    const userMessage = userMessageOrError.value;

    const messageAddedOrError = this.addMessageOnChat(chat, userMessage);
    if (messageAddedOrError.isLeft()) {
      return left(new Error("error adding new message"));
    }
    return right({
      chatId: input.chatId,
      content: "mock",
      userId: input.userId,
    }); // content is mocked for now
  }

  addMessageOnChat(chat: Chat, userMessage: Message): Either<Error, Message> {
    return chat.addMessage(userMessage);
  }

  createNewChat(input: ChatCompletionInputDTO): Either<Error, Chat> {
    const model = new Model(input.config.model, input.config.modelMaxTokens);
    const chatConfig: TChatConfig = {
      temperature: input.config.temperature,
      topP: input.config.topP,
      n: input.config.n,
      stop: input.config.stop,
      maxTokens: input.config.maxTokens,
      presencePenalty: input.config.presencePenalty,
      frequencyPenalty: input.config.frequencyPenalty,
      model,
    };
    const initialMessageOrError = Message.create(
      "system",
      input.config.initialSystemMessage,
      model
    );
    if (initialMessageOrError.isLeft()) {
      return left(new Error("error creating initial message"));
    }
    const initialMessage = initialMessageOrError.value;

    const chatOrError = Chat.create(input.userId, initialMessage, chatConfig);
    if (chatOrError.isLeft()) {
      return left(new Error("error creating new chat"));
    }
    const chat = chatOrError.value;

    return right(chat);
  }
}
