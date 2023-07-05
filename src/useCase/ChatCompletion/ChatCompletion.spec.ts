import { OpenAIApi } from "openai";
import { validate } from "uuid";
import { Chat, TChatConfig } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { ChatGateway } from "../../domain/gateway/ChatGateway";
import { Either, left, right } from "../../shared/either";
import {
  ChatCompletionConfigInputDTO,
  ChatCompletionUseCase,
} from "./ChatCompletion";

type SutTypes = {
  sut: ChatCompletionUseCase;
  chatConfigMock: ChatCompletionConfigInputDTO;
  chatGateway: {
    findChatById: jest.Mock<any, any, any>;
  };
  chatMock: Either<Error, Chat>;
};

describe("testing chat completion use case", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const chatGateway = { findChatById: jest.fn() };
      const openAiClientMock = {} as OpenAIApi;
      const sut = new ChatCompletionUseCase(chatGateway, openAiClientMock);
      const chatConfigMock: ChatCompletionConfigInputDTO = {
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
      const chatMock = Chat.create(
        "uuid",
        Message.create(
          "system",
          chatConfigMock.initialSystemMessage,
          Model.create(chatConfigMock.model, chatConfigMock.maxTokens)
        ).value as Message,
        {
          frequencyPenalty: chatConfigMock.frequencyPenalty,
          maxTokens: chatConfigMock.maxTokens,
          model: Model.create(chatConfigMock.model, chatConfigMock.maxTokens),
          n: chatConfigMock.n,
          presencePenalty: chatConfigMock.presencePenalty,
          stop: chatConfigMock.stop,
          temperature: chatConfigMock.temperature,
          topP: chatConfigMock.temperature,
        }
      );

      return {
        sut,
        chatConfigMock,
        chatGateway,
        chatMock,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("needs to throw error when something goes wrong ", () => {
    const { chatConfigMock, sut, chatGateway } = makeSut();

    chatGateway.findChatById.mockReturnValue(
      left(new Error("error fetching existing chat"))
    );
    const chatCompletion = sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chatCompletion).toEqual(
      left(new Error("error fetching existing chat"))
    );
  });

  it("should throw error when creating initial message on new chat when chat not found", () => {
    const { chatConfigMock, sut, chatGateway } = makeSut();

    chatGateway.findChatById.mockReturnValue(left(new Error("chat not found")));

    jest
      .spyOn(sut, "createNewChat")
      .mockReturnValue(left(new Error("error creating initial message")));

    const chatCompletion = sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chatCompletion).toEqual(
      left(new Error("error creating initial message"))
    );
  });

  it("should throw error when creating initial message on new chat", () => {
    const { chatConfigMock, sut } = makeSut();

    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigMock, initialSystemMessage: "" },
    });
    expect(newChat).toEqual(left(new Error("error creating initial message")));
  });

  it("should throw error when creating a new chat when chat not found", () => {
    const { chatConfigMock, sut, chatGateway } = makeSut();

    chatGateway.findChatById.mockReturnValue(left(new Error("chat not found")));

    jest
      .spyOn(sut, "createNewChat")
      .mockReturnValue(left(new Error("error creating new chat")));

    const chatCompletion = sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chatCompletion).toEqual(left(new Error("error creating new chat")));
  });

  it("should throw error when creating a new chat", () => {
    const { chatConfigMock, sut } = makeSut();

    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "",
      userMessage: "test",
      config: chatConfigMock,
    });
    expect(newChat).toEqual(left(new Error("error creating new chat")));
  });

  it("should throw an error creating user message if chat was found", () => {
    const { chatConfigMock, sut, chatGateway, chatMock } = makeSut();

    chatGateway.findChatById.mockReturnValue(chatMock);

    const messageCreateSpy = jest
      .spyOn(Message, "create")
      .mockReturnValue(left(new Error("error creating user message")));

    const result = sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "",
      config: chatConfigMock,
    });

    expect(result).toEqual(left(new Error("error creating user message")));
    expect(messageCreateSpy).toHaveBeenCalledWith("user", "", {
      name: chatConfigMock.model,
      maxTokens: chatConfigMock.maxTokens,
    });
  });

  it("should throw an error when adding new message in a new chat", () => {
    const { chatConfigMock, sut, chatGateway, chatMock } = makeSut();

    chatGateway.findChatById.mockReturnValue(chatMock);

    const addMessageSpy = jest
      .spyOn(sut, "addMessageOnChat")
      .mockReturnValue(left(new Error("error adding new message")));

    const result = sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(result).toEqual(left(new Error("error adding new message")));
    expect(addMessageSpy).toHaveBeenCalledTimes(1);
  });

  it("should return the chat completion", () => {
    const { chatConfigMock, sut } = makeSut();
    const chatId = "511022dc-6e6b-4c7a-8af9-17f600c01c2c";
    const userId = "34687268-e732-4e78-82af-c1e27da38fb3";
    const chat = sut.createNewChat({
      chatId,
      userId,
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chat.isRight).toBeTruthy();
  });

  it("should return the expected chat when creating a new one", () => {
    const { chatConfigMock, sut, chatGateway, chatMock } = makeSut();

    chatGateway.findChatById.mockReturnValue(left(new Error("chat not found")));

    jest
      .spyOn(sut, "createNewChat")
      .mockReturnValue(right(chatMock.value as Chat));

    sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(sut.createNewChat).toHaveBeenCalledTimes(1);
    expect(sut.createNewChat).toHaveReturnedWith(right(chatMock.value as Chat));
  });

  it("should return the chat completion", () => {
    const { chatConfigMock, sut, chatGateway, chatMock } = makeSut();

    chatGateway.findChatById.mockReturnValue(chatMock);

    const chatId = "511022dc-6e6b-4c7a-8af9-17f600c01c2c";
    const userId = "34687268-e732-4e78-82af-c1e27da38fb3";
    const chatCompletion = sut.execute({
      chatId,
      userId,
      userMessage: "test",
      config: chatConfigMock,
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
