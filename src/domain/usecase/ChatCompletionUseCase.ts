import { ChatRepository } from "../repository/ChatRepository";
import { OpenAIApi } from "openai";
import { Either, left, right } from "../../shared/either";
import { Chat, TChatConfig } from "../../domain/entity/Chat";
import { Model } from "../../domain/entity/Model";
import { Message } from "../../domain/entity/Message";
import { ChatCompletionInputDTO, ChatCompletionOutputDTO } from "./ChatCompletionDTO";

export class ChatCompletionUseCase {
  readonly chatRepository: ChatRepository;
  readonly openAiClient: OpenAIApi;

  constructor(chatRepository: ChatRepository, openAiClient: OpenAIApi) {
    this.chatRepository = chatRepository;
    this.openAiClient = openAiClient;
  }

  async execute(
    input: ChatCompletionInputDTO
  ): Promise<Either<Error, ChatCompletionOutputDTO>> {
    let chatOrError = this.chatRepository.findChatById(input.chatId);
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
      const error = userMessageOrError.value;
      return left(new Error("error creating user message: " + error.message));
    }
    const userMessage = userMessageOrError.value;

    const messageAddedOrError = this.addMessageOnChat(chat, userMessage);
    if (messageAddedOrError.isLeft()) {
      const error = messageAddedOrError.value;
      return left(new Error("error adding new message: " + error.message));
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
    const model = Model.create(input.config.model, input.config.modelMaxTokens);
    if (model.isLeft()) {
      const error = model.value;
      return left(new Error("error creating model: " + error.message));
    }

    const initialMessageOrError = Message.create(
      "system",
      input.config.initialSystemMessage,
      model.value
    );
    if (initialMessageOrError.isLeft()) {
      const error = initialMessageOrError.value;
      return left(
        new Error("error creating initial message: " + error.message)
      );
    }
    const initialMessage = initialMessageOrError.value;

    const chatConfig: TChatConfig = {
      temperature: input.config.temperature,
      topP: input.config.topP,
      n: input.config.n,
      stop: input.config.stop,
      maxTokens: input.config.maxTokens,
      presencePenalty: input.config.presencePenalty,
      frequencyPenalty: input.config.frequencyPenalty,
      model: model.value,
    };

    const chatOrError = Chat.create(input.userId, initialMessage, chatConfig);
    if (chatOrError.isLeft()) {
      const error = chatOrError.value;
      return left(new Error("error creating new chat: " + error.message));
    }
    const chat = chatOrError.value;

    return right(chat);
  }
}
