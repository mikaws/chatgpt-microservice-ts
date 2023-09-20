import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { Either, left, right } from "../../shared/either";
import { ChatCompletionConfigInputDTO } from "./ChatCompletionDTO";
import { ChatCompletionUseCase } from "./ChatCompletionUseCase";
import { InMemoryOpenAIGateway } from "../gateway/InMemoryOpenAIGateway";
import { InMemoryChatRepository } from "../repository/InMemoryChatRepository";

type SutTypes = {
  sut: ChatCompletionUseCase;
  chaConfigInput: ChatCompletionConfigInputDTO;
  fakeChat: Chat;
};

describe("testing chat completion use case", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const sut = new ChatCompletionUseCase(
        new InMemoryChatRepository(),
        new InMemoryOpenAIGateway()
      );
      const chaConfigInput: ChatCompletionConfigInputDTO = {
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
      const model = Model.create(chaConfigInput.model, chaConfigInput.maxTokens)
        .value as Model;
      const message = Message.create(
        "system",
        chaConfigInput.initialSystemMessage,
        model
      ).value as Message;
      const fakeChat = Chat.create("uuid", message, {
        frequencyPenalty: chaConfigInput.frequencyPenalty,
        maxTokens: chaConfigInput.maxTokens,
        model,
        n: chaConfigInput.n,
        presencePenalty: chaConfigInput.presencePenalty,
        stop: chaConfigInput.stop,
        temperature: chaConfigInput.temperature,
        topP: chaConfigInput.temperature,
      }).value as Chat;
      sut.chatRepository.createChat(fakeChat);
      return {
        sut,
        chaConfigInput,
        fakeChat,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw error when creating model with invalid maxTokens on new chat", () => {
    const { chaConfigInput, sut } = makeSut();
    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chaConfigInput, modelMaxTokens: 0 },
    });
    expect(newChat).toEqual(
      left(
        new Error("error creating model: maxTokens needs to be greater than 0")
      )
    );
  });

  it("should throw error when creating initial message on new chat when chat not found", async () => {
    const { chaConfigInput, sut } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: "",
      userId: "uuid",
      userMessage: "test",
      config: { ...chaConfigInput, initialSystemMessage: "" },
    });
    expect(chatCompletion).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating initial message without content on new chat", () => {
    const { chaConfigInput, sut } = makeSut();
    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chaConfigInput, initialSystemMessage: "" },
    });
    expect(newChat).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating a new chat when chat not found", async () => {
    const { chaConfigInput, sut } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: "",
      userId: "",
      userMessage: "test",
      config: chaConfigInput,
    });
    expect(chatCompletion).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw error when creating a new chat", () => {
    const { chaConfigInput, sut } = makeSut();
    const newChat = sut.createNewChat({
      chatId: "uuid",
      userId: "",
      userMessage: "test",
      config: chaConfigInput,
    });
    expect(newChat).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw an error creating user message if chat was found", async () => {
    const { chaConfigInput, sut } = makeSut();
    const result = await sut.execute({
      chatId: "",
      userId: "uuid",
      userMessage: "",
      config: chaConfigInput,
    });
    expect(result).toEqual(
      left(new Error("error creating user message: content is empty"))
    );
  });

  it("should throw an error when adding new message in a new chat", async () => {
    const { chaConfigInput, sut } = makeSut();
    const addMessageSpy = jest
      .spyOn(sut, "addMessageOnChat")
      .mockReturnValue(
        left(new Error("chat is ended, no more messages allowed"))
      );
    const result = await sut.execute({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chaConfigInput,
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

  it("should not create a new chat if the chat already exists", async () => {
    const { chaConfigInput, sut, fakeChat } = makeSut();
    const createNewChat = jest.spyOn(sut, "createNewChat");
    await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chaConfigInput,
    });
    expect(createNewChat).toHaveBeenCalledTimes(0);
  });

  it("should throw an error when createChatCompletion has error", async () => {
    const { chaConfigInput, sut } = makeSut();
    jest
      .spyOn(sut.openAiGateway, "createChatCompletion")
      .mockReturnValue(
        new Promise((resolve) =>
          resolve(left(new Error("error processing the request")))
        )
      );
    const chatId = "uuid";
    const userId = "uuid";
    const err = await sut.execute({
      chatId,
      userId,
      userMessage: "test",
      config: chaConfigInput,
    });
    expect(err).toEqual(
      left(new Error("error openai: error processing the request"))
    );
  });

  it("should return the chat completion ", async () => {
    const { chaConfigInput, sut, fakeChat } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chaConfigInput,
    });
    expect(chatCompletion).toEqual(
      right({
        chatId: fakeChat.id,
        content: "Hello. How can I help you?",
        userId: "uuid",
      })
    );
  });

  // it("should return the expected chat when creating a new one", async () => {
  //   const { chaConfigInput, sut, fakeChat } = makeSut();
  //   jest
  //     .spyOn(sut, "createNewChat")
  //     .mockReturnValue(right(fakeChat.value as Chat));
  //   await sut.execute({
  //     chatId: "",
  //     userId: "uuid",
  //     userMessage: "test",
  //     config: chaConfigInput,
  //   });
  //   expect(sut.createNewChat).toHaveBeenCalledTimes(1);
  //   expect(sut.createNewChat).toHaveReturnedWith(right(fakeChat.value as Chat));
  // });

  // it("should return the chat completion", async () => {
  //   const { chaConfigInput, sut, fakeChat } = makeSut();
  //   const chatId = "511022dc-6e6b-4c7a-8af9-17f600c01c2c";
  //   const userId = "34687268-e732-4e78-82af-c1e27da38fb3";
  //   const chatCompletion = await sut.execute({
  //     chatId,
  //     userId,
  //     userMessage: "test",
  //     config: chaConfigInput,
  //   });
  //   expect(chatCompletion).toEqual(
  //     right({
  //       chatId,
  //       content: "mock",
  //       userId,
  //     })
  //   );
  // });
});
