import { OpenAIApi } from "openai";
import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { Either, left, right } from "../../shared/either";
import { ChatCompletionConfigInputDTO } from "./ChatCompletionDTO";
import {
  ChatCompletionUseCase,
} from "./ChatCompletionUseCase";

type SutTypes = {
  sut: ChatCompletionUseCase;
  chatConfigMock: ChatCompletionConfigInputDTO;
  chatRepository: {
    findChatById: jest.Mock<any, any, any>;
  };
  chatMock: Either<Error, Chat>;
};

describe("testing chat completion use case", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const chatRepository = {
        findChatById: jest.fn(),
        createChat: jest.fn(),
        saveChat: jest.fn(),
      };
      const openAiClientMock = {} as OpenAIApi;
      const sut = new ChatCompletionUseCase(chatRepository, openAiClientMock);
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
            .value as Model
        ).value as Message,
        {
          frequencyPenalty: chatConfigMock.frequencyPenalty,
          maxTokens: chatConfigMock.maxTokens,
          model: Model.create(chatConfigMock.model, chatConfigMock.maxTokens)
            .value as Model,
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
        chatRepository,
        chatMock,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("needs to throw error when something goes wrong", async () => {
    const { chatConfigMock, sut, chatRepository } = makeSut();

    chatRepository.findChatById.mockReturnValue(
      left(new Error("error fetching existing chat"))
    );
    const chatCompletion = await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chatCompletion).toEqual(
      left(new Error("error fetching existing chat"))
    );
  });

  it("should throw error when creating initial message on new chat when chat not found", async () => {
    const { chatConfigMock, sut, chatRepository } = makeSut();

    chatRepository.findChatById.mockReturnValue(left(new Error("chat not found")));

    const chatCompletion = await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigMock, initialSystemMessage: "" },
    });

    expect(chatCompletion).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating model with invalid maxTokens on new chat", () => {
    const { chatConfigMock, sut } = makeSut();

    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigMock, modelMaxTokens: 0 },
    });
    expect(newChat).toEqual(
      left(
        new Error("error creating model: maxTokens needs to be greater than 0")
      )
    );
  });

  it("should throw error when creating initial message without content on new chat", () => {
    const { chatConfigMock, sut } = makeSut();

    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigMock, initialSystemMessage: "" },
    });
    expect(newChat).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating a new chat when chat not found", async () => {
    const { chatConfigMock, sut, chatRepository } = makeSut();

    chatRepository.findChatById.mockReturnValue(left(new Error("chat not found")));

    const chatCompletion = await sut.execute({
      chatId: "uuid",
      userId: "",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(chatCompletion).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw error when creating a new chat", () => {
    const { chatConfigMock, sut } = makeSut();

    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "",
      userMessage: "test",
      config: chatConfigMock,
    });
    expect(newChat).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw an error creating user message if chat was found", async () => {
    const { chatConfigMock, sut, chatRepository, chatMock } = makeSut();

    chatRepository.findChatById.mockReturnValue(chatMock);

    const messageCreateSpy = jest
      .spyOn(Message, "create")
      .mockReturnValue(left(new Error("content is empty")));

    const result = await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "",
      config: chatConfigMock,
    });

    expect(result).toEqual(
      left(new Error("error creating user message: content is empty"))
    );
    expect(messageCreateSpy).toHaveBeenCalledWith("user", "", {
      name: chatConfigMock.model,
      maxTokens: chatConfigMock.maxTokens,
    });
  });

  it("should throw an error when adding new message in a new chat", async () => {
    const { chatConfigMock, sut, chatRepository, chatMock } = makeSut();

    chatRepository.findChatById.mockReturnValue(chatMock);

    const addMessageSpy = jest
      .spyOn(sut, "addMessageOnChat")
      .mockReturnValue(
        left(new Error("chat is ended, no more messages allowed"))
      );

    const result = await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(result).toEqual(
      left(
        new Error(
          "error adding new message: chat is ended, no more messages allowed"
        )
      )
    );
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

  it("should return the expected chat when creating a new one", async () => {
    const { chatConfigMock, sut, chatRepository, chatMock } = makeSut();

    chatRepository.findChatById.mockReturnValue(left(new Error("chat not found")));

    jest
      .spyOn(sut, "createNewChat")
      .mockReturnValue(right(chatMock.value as Chat));

    await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigMock,
    });

    expect(sut.createNewChat).toHaveBeenCalledTimes(1);
    expect(sut.createNewChat).toHaveReturnedWith(right(chatMock.value as Chat));
  });

  it("should return the chat completion", async () => {
    const { chatConfigMock, sut, chatRepository, chatMock } = makeSut();

    chatRepository.findChatById.mockReturnValue(chatMock);

    const chatId = "511022dc-6e6b-4c7a-8af9-17f600c01c2c";
    const userId = "34687268-e732-4e78-82af-c1e27da38fb3";
    const chatCompletion = await sut.execute({
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
