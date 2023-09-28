import { Either, left, right } from "../../shared/either";
import { Chat, TChatConfig } from "../../domain/entity/Chat";
import { Model } from "../../domain/entity/Model";
import { Message } from "../../domain/entity/Message";
import {
  ChatCompletionInputDTO,
  ChatCompletionOutputDTO,
} from "./ChatCompletionDTO";
import { ChatRepository } from "../repository/ChatRepository";
import { OpenAIGateway } from "../gateway/OpenAIGateway";
import { ChatCompletionMessage } from "../gateway/models/OpenAIResponses";

export class ChatCompletionUseCase {
  readonly chatRepository: ChatRepository;
  readonly openAiGateway: OpenAIGateway;

  constructor(chatRepository: ChatRepository, openAiGateway: OpenAIGateway) {
    this.chatRepository = chatRepository;
    this.openAiGateway = openAiGateway;
  }

  async execute(
    input: ChatCompletionInputDTO
  ): Promise<Either<Error, ChatCompletionOutputDTO>> {
    let chatOrError = await this.chatRepository.findChatById(input.chatId);
    let chat: Chat;
    let err: Error;
    if (chatOrError.isLeft()) {
      err = chatOrError.value;
      const newChatOrError = this.createNewChat(input);
      if (newChatOrError.isLeft()) {
        err = newChatOrError.value;
        return left(err);
      }
      chat = newChatOrError.value;
    } else {
      chat = chatOrError.value;
    }
    const userMessageOrError = Message.create(
      "user",
      input.userMessage,
      chat.config.model
    );
    if (userMessageOrError.isLeft()) {
      err = userMessageOrError.value;
      return left(new Error("error creating user message: " + err.message));
    }
    const userMessage = userMessageOrError.value;
    const messageAddedOrError = this.addMessageOnChat(chat, userMessage);
    if (messageAddedOrError.isLeft()) {
      err = messageAddedOrError.value;
      return left(new Error("error adding new message: " + err.message));
    }
    const messages: ChatCompletionMessage[] = chat.messages.map(
      (message: Message): ChatCompletionMessage => {
        return {
          content: message.content,
          role: message.role,
        } as ChatCompletionMessage;
      }
    );
    const chatCompletionOrError = await this.openAiGateway.createChatCompletion(
      {
        model: chat.config.model.name,
        messages: messages,
        max_tokens: chat.config.maxTokens,
        temperature: chat.config.temperature,
        top_p: chat.config.topP,
        presence_penalty: chat.config.presencePenalty,
        frequency_penalty: chat.config.frequencyPenalty,
        stop: chat.config.stop,
      }
    );
    if (chatCompletionOrError.isLeft()) {
      err = chatCompletionOrError.value;
      return left(new Error("error openai: " + err.message));
    }
    const chatCompletion = chatCompletionOrError.value;
    const content = chatCompletion.message.content;
    const assistanceMessageOrError = Message.create(
      "assistant",
      content,
      chat.config.model
    );
    if (assistanceMessageOrError.isLeft()) {
      err = assistanceMessageOrError.value;
      return left(new Error(err.message));
    }
    const assistanceMessage = assistanceMessageOrError.value;
    const assistanceMessageAddedOrError = this.addMessageOnChat(
      chat,
      assistanceMessage
    );
    if (assistanceMessageAddedOrError.isLeft()) {
      err = assistanceMessageAddedOrError.value;
      return left(new Error(err.message));
    }
    const savedChatOrError = await this.chatRepository.saveChat(chat);
    if (savedChatOrError.isLeft()) {
      err = savedChatOrError.value;
      return left(new Error(err.message));
    }
    const savedChat = savedChatOrError.value;
    return right({
      chatId: savedChat.id,
      content: content,
      userId: savedChat.userId,
    });
  }

  addMessageOnChat(chat: Chat, userMessage: Message): Either<Error, Message> {
    return chat.addMessage(userMessage);
  }

  createNewChat(input: ChatCompletionInputDTO): Either<Error, Chat> {
    const model = Model.create(input.config.model, input.config.modelMaxTokens);
    let err: Error;
    if (model.isLeft()) {
      err = model.value;
      return left(new Error("error creating model: " + err.message));
    }
    const initialMessageOrError = Message.create(
      "system",
      input.config.initialSystemMessage,
      model.value
    );
    if (initialMessageOrError.isLeft()) {
      err = initialMessageOrError.value;
      return left(new Error("error creating initial message: " + err.message));
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
      err = chatOrError.value;
      return left(new Error("error creating new chat: " + err.message));
    }
    const chat = chatOrError.value;
    return right(chat);
  }
}
