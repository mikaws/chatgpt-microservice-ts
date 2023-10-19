import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { left, right } from "../../shared/either";
import { ChatCompletionConfigInputDTO } from "./ChatCompletionDTO";
import { ChatCompletionUseCase } from "./ChatCompletionUseCase";
import { InMemoryOpenAIGateway } from "../gateway/InMemoryOpenAIGateway";
import { InMemoryChatRepository } from "../repository/InMemoryChatRepository";

type SutTypes = {
  sut: ChatCompletionUseCase;
  chatConfigInput: ChatCompletionConfigInputDTO;
  fakeChat: Chat;
  fakeModel: Model;
  fakeMessage: Message;
};

describe("testing chat completion use case", () => {
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
        fakeModel,
        fakeMessage,
      };
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw error when creating model with invalid maxTokens on new chat", async () => {
    const { chatConfigInput, sut } = makeSut();
    const newChat = await sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigInput, modelMaxTokens: 0 },
    });
    expect(newChat).toEqual(
      left(
        new Error("error creating model: maxTokens needs to be greater than 0")
      )
    );
  });

  it("should throw error when creating initial message on new chat when chat not found", async () => {
    const { chatConfigInput, sut } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: "",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigInput, initialSystemMessage: "" },
    });
    expect(chatCompletion).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating initial message without content on new chat", async () => {
    const { chatConfigInput, sut } = makeSut();
    const newChat = await sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: { ...chatConfigInput, initialSystemMessage: "" },
    });
    expect(newChat).toEqual(
      left(new Error("error creating initial message: content is empty"))
    );
  });

  it("should throw error when creating a new chat when chat not found", async () => {
    const { chatConfigInput, sut } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: "",
      userId: "",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(chatCompletion).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw error when creating a new chat", async () => {
    const { chatConfigInput, sut } = makeSut();
    const newChat = await sut.createNewChat({
      chatId: "uuid",
      userId: "",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(newChat).toEqual(
      left(new Error("error creating new chat: user id is empty"))
    );
  });

  it("should throw error when saving a new chat that already exists", async () => {
    const { chatConfigInput, sut } = makeSut();
    jest
      .spyOn(sut.chatRepository, "createChat")
      .mockReturnValue(
        new Promise((resolve) =>
          resolve(left(new Error("chat already exists")))
        )
      );
    const newChat = await sut.createNewChat({
      chatId: "uuid",
      userId: "uuid",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(newChat).toEqual(left(new Error("error saving new chat: chat already exists")));
  });

  it("should throw an error when trying to append a message when the chat is ended", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    fakeChat.end();
    const err = await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(err).toEqual(
      left(
        new Error(
          "error adding new message: chat is ended, no more messages allowed"
        )
      )
    );
  });

  it("should throw an error creating user message if chat was found", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    const result = await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "",
      config: chatConfigInput,
    });
    expect(result).toEqual(
      left(new Error("error creating user message: content is empty"))
    );
  });

  it("should not create a new chat if the chat already exists", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    const createNewChat = jest.spyOn(sut, "createNewChat");
    await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(createNewChat).toHaveBeenCalledTimes(0);
  });

  it("should throw an error when openai createChatCompletion has error", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    jest
      .spyOn(sut.openAiGateway, "createChatCompletion")
      .mockReturnValue(
        new Promise((resolve) =>
          resolve(left(new Error("error processing the request")))
        )
      );
    const err = await sut.execute({
      chatId: 'uuid',
      userId: 'uuid',
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(err).toEqual(
      left(new Error("error openai: error processing the request"))
    );
  });

  it("should throw an error when creating the assistent message instance has error", async () => {
    const { chatConfigInput, sut } = makeSut();
    jest
      .spyOn(sut.chatRepository, "updateChat")
      .mockReturnValue(
        new Promise((resolve) => resolve(left(new Error("err saving chat"))))
      );
    const err = await sut.execute({
      chatId: 'uuid',
      userId: 'uuid',
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(err).toEqual(left(new Error("err saving chat")));
  });

  it("should throw an error when appending assistent message has error", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    jest.spyOn(sut.openAiGateway, "createChatCompletion").mockReturnValue(
      new Promise((resolve) =>
        resolve(
          right({
            id: fakeChat.id,
            message: {
              content: "",
              role: "assistant",
            },
            model: "gpt-3.5",
          })
        )
      )
    );
    const err = await sut.execute({
      chatId: fakeChat.id,
      userId: 'uuid',
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(err).toEqual(left(new Error("content is empty")));
  });

  it("should throw an error when trying to append a message when the chat is ended", async () => {
    const { chatConfigInput, sut, fakeChat, fakeMessage } = makeSut();
    let addMessageOnChatBehavior = 1;
    jest.spyOn(sut, "addMessageOnChat").mockImplementation(() => {
      if (addMessageOnChatBehavior === 1) {
        addMessageOnChatBehavior = 2;
        return right(fakeMessage);
      } else {
        fakeChat.end();
        return left(
          new Error(
            "error adding new message: chat is ended, no more messages allowed"
          )
        );
      }
    });
    const err = await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(err).toEqual(
      left(
        new Error(
          "error adding new message: chat is ended, no more messages allowed"
        )
      )
    );
    expect(sut.addMessageOnChat).toHaveBeenCalledTimes(2);
  });

  it("should return the chat completion ", async () => {
    const { chatConfigInput, sut, fakeChat } = makeSut();
    const chatCompletion = await sut.execute({
      chatId: fakeChat.id,
      userId: "uuid",
      userMessage: "test",
      config: chatConfigInput,
    });
    expect(chatCompletion).toEqual(
      right({
        chatId: fakeChat.id,
        content: "Hello. How can I help you?",
        userId: "uuid",
      })
    );
  });
});
