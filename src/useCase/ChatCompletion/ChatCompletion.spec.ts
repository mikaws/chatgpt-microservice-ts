import { validate } from "uuid";
import { OpenAIApi } from "openai";
import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { ChatGateway } from "../../domain/gateway/ChatGateway";
import { Either, left, right } from "../../shared/either";
import { ChatCompletionUseCase } from "./ChatCompletion";

interface IChatOptions {
  temperature: number;
  topP: number;
  n: number;
  stop: Array<string>;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

// @@@ mocks @@@

const chatConfigMock = {
  temperature: 0.75,
  topP: 0.8,
  n: 10,
  stop: [],
  maxTokens: 500,
  presencePenalty: 1.5,
  frequencyPenalty: 2.0,
};

const createNewChatMock = (userId: string, options: IChatOptions) => {
  const { chatConfig, message } = createChatConfigMock(options);
  return Chat.create(userId, message.value as Message, chatConfig);
};

const createChatConfigMock = (options: IChatOptions) => {
  const model = Model.create("codex", 500);
  const message = Message.create("user", "Why the sky is blue?", model);
  const chatConfig = {
    ...options,
    model,
  };
  return { chatConfig, message };
};

const chatGatewayMock: ChatGateway = {
  createChat(chat: Chat): Either<Error, Chat> {
    if (chat) {
      return right(chat);
    }
    return left(new Error("error creating new chat"));
  },
  findChatById(chatId: string): Either<Error, Chat> {
    if (chatId) {
      if (validate(chatId)) {
        const chat = createNewChatMock("uuid", chatConfigMock);
        return right(chat.value as Chat);
      }
      return left(new Error("error fetching existing chat"));
    }
    return left(new Error("chat not found"));
  },
  saveChat(chat: Chat): Either<Error, Chat> {
    if (chat) {
      return right(chat);
    }
    return left(new Error("error persisting new chat"));
  },
};

const chatCompletionUseCase = new ChatCompletionUseCase(
  chatGatewayMock,
  new OpenAIApi()
);
const { chatConfig } = createChatConfigMock(chatConfigMock);

const chatCompletionInputConfig = {
  ...chatConfig,
  initialSystemMessage: "",
  modelMaxTokens: chatConfig.maxTokens,
  model: "gpt",
};

// @@@ tests @@@

describe("testing chat completion use case", () => {
  it("shouldn't find the chat and throws error", () => {
    const chatCompletion = chatCompletionUseCase.execute({
      chatId: "",
      userId: "uuid",
      userMessage: "test",
      config: chatCompletionInputConfig,
    });

    expect(chatCompletion).toEqual(left(new Error("chat not found")));
  });

  it("shouldn't when something goes wrong throws error", () => {
    const chatCompletion = chatCompletionUseCase.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatCompletionInputConfig,
    });

    expect(chatCompletion).toEqual(
      left(new Error("error fetching existing chat"))
    );
  });

  it("should find the chat and throws error", () => {
    const chatId = "511022dc-6e6b-4c7a-8af9-17f600c01c2c";
    const userId = "34687268-e732-4e78-82af-c1e27da38fb3";
    const chatCompletion = chatCompletionUseCase.execute({
      chatId,
      userId,
      userMessage: "test",
      config: chatCompletionInputConfig,
    });

    expect(chatCompletion).toEqual(
      right({
        chatId,
        content: "mock",
        userId,
      })
    );
  });
});
