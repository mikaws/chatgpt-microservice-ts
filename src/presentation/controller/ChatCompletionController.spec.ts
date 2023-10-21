import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { InMemoryOpenAIGateway } from "../../domain/gateway/InMemoryOpenAIGateway";
import { InMemoryChatRepository } from "../../domain/repository/InMemoryChatRepository";
import {
  ChatCompletionConfigInputDTO,
  ChatCompletionOutputDTO,
} from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { ChatCompletionBody } from "../protocols/body";
import { RequiredFieldValidator } from "../validators/RequiredFieldsValidator";
import { ChatCompletionController } from "./ChatCompletionController";

type SutTypes = {
  sut: ChatCompletionController;
  chatConfigInput: ChatCompletionConfigInputDTO;
  fakeChat: Chat;
  useCase: ChatCompletionUseCase;
};

describe("chat completion controller", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const useCase = new ChatCompletionUseCase(
        new InMemoryChatRepository(),
        new InMemoryOpenAIGateway()
      );
      const validator = new RequiredFieldValidator<ChatCompletionBody>([
        "chatId",
        "userId",
        "userMessage",
      ]);
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
      const sut = new ChatCompletionController(
        validator,
        useCase,
        chatConfigInput
      );
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
      useCase.chatRepository.createChat(fakeChat);
      return {
        sut,
        chatConfigInput,
        fakeChat,
        useCase,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be status 400", async () => {
    const { sut, chatConfigInput } = makeSut();
    const httpRequest = {
      body: {
        chatId: "uuid",
        config: chatConfigInput,
        userId: "uuid",
      } as unknown as ChatCompletionBody,
    };
    const res = await sut.handler(httpRequest);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual("Error: missing field 'userMessage' in body");
  });

  it("should be status 500", async () => {
    const { sut } = makeSut();
    const httpRequest: { body: ChatCompletionBody } = {
      body: {
        chatId: "uuid",
        userId: "",
        userMessage: "abc",
      },
    };
    const res = await sut.handler(httpRequest);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      "Error: error creating new chat: user id is empty"
    );
  });

  it("should be status 200", async () => {
    const { sut, fakeChat, useCase } = makeSut();
    useCase.chatRepository.createChat(fakeChat);
    const httpRequest: { body: ChatCompletionBody } = {
      body: {
        chatId: fakeChat.id,
        userId: "uuid",
        userMessage: "test",
      },
    };
    const res = await sut.handler(httpRequest);
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      chatId: fakeChat.id,
      content: "Hello. How can I help you?",
      userId: "uuid",
    } as ChatCompletionOutputDTO);
  });
});
