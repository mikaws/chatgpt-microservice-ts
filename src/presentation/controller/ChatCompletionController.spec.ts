import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { InMemoryOpenAIGateway } from "../../domain/gateway/InMemoryOpenAIGateway";
import { InMemoryChatRepository } from "../../domain/repository/InMemoryChatRepository";
import {
  ChatCompletionConfigInputDTO,
  ChatCompletionInputDTO,
  ChatCompletionOutputDTO,
} from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { ChatCompletionController } from "./ChatCompletionController";

type SutTypes = {
  sut: ChatCompletionUseCase;
  chatConfigInput: ChatCompletionConfigInputDTO;
  fakeChat: Chat;
};

describe("chat completion controller", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const sut = new ChatCompletionUseCase(
        new InMemoryChatRepository(),
        new InMemoryOpenAIGateway()
      );
      const chatConfigInput: ChatCompletionConfigInputDTO = {
        temperature: 0.75,
        topP: 0.8,
        n: 10,
        stop: [],
        maxTokens: 500,
        presencePenalty: 1.5,
        frequencyPenalty: 2.0,
        model: "gpt",
        initialSystemMessage: "hello",
        modelMaxTokens: 500,
      };
      const fakeModel = Model.create(
        chatConfigInput.model,
        chatConfigInput.maxTokens
      ).value as Model;
      const fakeMessage = Message.create(
        "system",
        chatConfigInput.initialSystemMessage,
        fakeModel
      ).value as Message;
      const fakeChat = Chat.create("uuid", fakeMessage, {
        frequencyPenalty: chatConfigInput.frequencyPenalty,
        maxTokens: chatConfigInput.maxTokens,
        model: fakeModel,
        n: chatConfigInput.n,
        presencePenalty: chatConfigInput.presencePenalty,
        stop: chatConfigInput.stop,
        temperature: chatConfigInput.temperature,
        topP: chatConfigInput.temperature,
      }).value as Chat;
      sut.chatRepository.createChat(fakeChat);
      return {
        sut,
        chatConfigInput,
        fakeChat,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be status 500", async () => {
    const { sut, chatConfigInput } = makeSut();
    const httpRequest: { body: ChatCompletionInputDTO } = {
      body: {
        chatId: "uuid",
        config: chatConfigInput,
        userId: "",
        userMessage: "test",
      },
    };
    const controller = new ChatCompletionController(sut, chatConfigInput);
    const res = await controller.handler(httpRequest);
    expect(res.statusCode).toBe(500);
    expect(res.body).toBe("error creating new chat: user id is empty");
  });

  it("should be status 500", async () => {
    const { sut, fakeChat, chatConfigInput } = makeSut();
    sut.chatRepository.createChat(fakeChat);
    const httpRequest: { body: ChatCompletionInputDTO } = {
      body: {
        chatId: fakeChat.id,
        config: chatConfigInput,
        userId: "uuid",
        userMessage: "test",
      },
    };
    const controller = new ChatCompletionController(sut, chatConfigInput);
    const res = await controller.handler(httpRequest);
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      chatId: fakeChat.id,
      content: "Hello. How can I help you?",
      userId: "uuid",
    } as ChatCompletionOutputDTO);
  });
});
