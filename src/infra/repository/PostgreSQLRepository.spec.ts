import { Chat } from "../../domain/entity/Chat";
import { Message } from "../../domain/entity/Message";
import { Model } from "../../domain/entity/Model";
import { ChatCompletionConfigInputDTO } from "../../domain/usecase/ChatCompletionDTO";
import { left, right } from "../../shared/either";
import { postgreSQLDatabase } from "../db/postgresql/postgresql-database";
import { PostgreSQLRepository } from "./PostgreSQLRepository";

describe("PostgreSQLRepository", () => {
  let makeSut: () => {
    sut: PostgreSQLRepository;
    fakeChat: Chat;
    fakeModel: Model;
    chatConfigInput: ChatCompletionConfigInputDTO;
  };
  beforeEach(async () => {
    makeSut = () => {
      const sut = new PostgreSQLRepository();
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
        chatConfigInput.modelMaxTokens
      ).value as Model;
      const fakeInitialMessage = Message.create(
        "system",
        chatConfigInput.initialSystemMessage,
        fakeModel
      ).value as Message;
      const fakeChat = Chat.create("uuid", fakeInitialMessage, {
        frequencyPenalty: chatConfigInput.frequencyPenalty,
        maxTokens: chatConfigInput.maxTokens,
        model: fakeModel,
        n: chatConfigInput.n,
        presencePenalty: chatConfigInput.presencePenalty,
        stop: chatConfigInput.stop,
        temperature: chatConfigInput.temperature,
        topP: chatConfigInput.temperature,
      }).value as Chat;
      return { sut, fakeChat, chatConfigInput, fakeModel };
    };
    await postgreSQLDatabase.pool.query(`
      CREATE TEMPORARY TABLE IF NOT EXISTS chats (LIKE chats INCLUDING ALL);
      CREATE TEMPORARY TABLE IF NOT EXISTS messages (LIKE messages INCLUDING ALL);
    `);
  });
  beforeAll(async () => {
    await postgreSQLDatabase.connect({
      user: "postgres",
      host: "localhost",
      database: "adm",
      password: "sysdba",
      port: 5432,
    });
  });
  afterEach(async () => {
    jest.resetAllMocks();
    await postgreSQLDatabase.pool.query(`
      DROP TABLE IF EXISTS pg_temp.chats;
      DROP TABLE IF EXISTS pg_temp.messages;
    `);
  });
  afterAll(async () => {
    jest.useFakeTimers();
    await postgreSQLDatabase.disconnect();
  });
  it("should return left when error occurs creating a chat in createChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "createChat")
      .mockResolvedValue(left(new Error("message: fatal err in 'createChat'; stack: line 1")));
    const error = await sut.createChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error("error creating chat: message: fatal err in 'createChat'; stack: line 1")
      )
    );
  });
  it("should return left when error occurs add message in createChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "addMessage")
      .mockResolvedValue(left(new Error("message: fatal err in 'addMessage'; stack: line 2")));
    const error = await sut.createChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error saving message when creating chat: message: fatal err in 'addMessage'; stack: line 2"
        )
      )
    );
  });
  it("should return right with chat when creating a chat in createChat method", async () => {
    const { sut, fakeChat } = makeSut();
    const chatOrError = await sut.createChat(fakeChat);
    expect(chatOrError.isRight()).toBeTruthy();
    expect(chatOrError).toEqual(right(fakeChat));
  });
  it("should return left when error occurs saving a chat in updateChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "updateChat")
      .mockResolvedValue(left(new Error("message: fatal err in 'updateChat'; stack: line 1")));
    const error = await sut.updateChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error("error saving chat: message: fatal err in 'updateChat'; stack: line 1")
      )
    );
  });
  it("should return left when error occurs deleting messages in updateChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "deleteChatMessages")
      .mockResolvedValue(left(new Error("message: fatal err in 'deleteChatMessages'; stack: line 1")));
    const error = await sut.updateChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error deleting chat messages: message: fatal err in 'deleteChatMessages'; stack: line 1"
        )
      )
    );
  });
  it("should return left when error occurs deleting erased messages in updateChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "deleteErasedChatMessages")
      .mockResolvedValue(left(new Error("message: fatal err in 'deleteErasedChatMessages'; stack: line 1")));
    const error = await sut.updateChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error deleting erased chat messages: message: fatal err in 'deleteErasedChatMessages'; stack: line 1"
        )
      )
    );
  });
  it("should return left when error occurs saving messages in updateChat method", async () => {
    const { sut, fakeChat, fakeModel } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "addMessage")
      .mockResolvedValue(left(new Error("message: fatal err in 'addMessage'; stack: line 1")));
    const userMessage = Message.create("user", "The sky is blue?", fakeModel)
      .value as Message;
    fakeChat.addMessage(userMessage);
    const error = await sut.updateChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error adding messages to saved chat: message: fatal err in 'addMessage'; stack: line 1"
        )
      )
    );
  });
  it("should return left when error occurs saving erased messages in updateChat method", async () => {
    const { sut, fakeChat, fakeModel } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "addMessage")
      .mockResolvedValue(
        left(new Error("message: fatal err in 'addMessage'; stack: line 1"))
      );
    const erasedMessage = Message.create("user", "Message deleted", fakeModel)
      .value as Message;
    fakeChat.addErasedMessage(erasedMessage);
    const error = await sut.updateChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error adding erased messages to saved chat: message: fatal err in 'addMessage'; stack: line 1"
        )
      )
    );
  });
  it("should return left when error occurs findind a chat in findChatById method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "findChatById")
      .mockResolvedValue(left(new Error("message: fatal err in 'findChatById'; stack: line 1")));
    const error = await sut.findChatById(fakeChat.id);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error("error finding chat: message: fatal err in 'findChatById'; stack: line 1")
      )
    );
  });
  it("should return left when error occurs chat not found in findChatById method", async () => {
    const { sut, fakeChat } = makeSut();
    const error = await sut.findChatById(fakeChat.id);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(left(new Error("chat not found")));
  });
  it("should return left when error occurs findind messages in findMessagesByChatID method", async () => {
    const { sut, fakeChat } = makeSut();
    await sut.createChat(fakeChat);
    jest
      .spyOn(postgreSQLDatabase, "findMessagesByChatId")
      .mockResolvedValue(left(new Error("message: fatal err in 'findMessagesByChatId'; stack: line 1")));
    const error = await sut.findChatById(fakeChat.id);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error finding messages: message: fatal err in 'findMessagesByChatId'; stack: line 1"
        )
      )
    );
  });
  it("should return left when error occurs findind erased messages in findErasedMessagesByChatID method", async () => {
    const { sut, fakeChat } = makeSut();
    await sut.createChat(fakeChat);
    jest
      .spyOn(postgreSQLDatabase, "findErasedMessagesByChatId")
      .mockResolvedValue(left(new Error("message: fatal err in 'findErasedMessagesByChatId'; stack: line 1")));
    const error = await sut.findChatById(fakeChat.id);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error finding erased messages: message: fatal err in 'findErasedMessagesByChatId'; stack: line 1"
        )
      )
    );
  });
  it("should return right with chat when creating a chat in findChatById method", async () => {
    const { sut, fakeChat, fakeModel } = makeSut();
    await sut.createChat(fakeChat);
    const userMessage = Message.create("user", "The sky is blue?", fakeModel)
      .value as Message;
    const message = Message.create(
      "assistant",
      "Yes, the sky is blue.",
      fakeModel
    ).value as Message;
    const erasedMessage = Message.create("user", "Message deleted", fakeModel)
      .value as Message;
    fakeChat.addMessage(userMessage);
    fakeChat.addMessage(message);
    fakeChat.addErasedMessage(erasedMessage);
    await sut.updateChat(fakeChat);
    const chat = await sut.findChatById(fakeChat.id);
    expect(chat.isRight()).toBeTruthy();
    expect(chat).toEqual(right(fakeChat));
  });
});
