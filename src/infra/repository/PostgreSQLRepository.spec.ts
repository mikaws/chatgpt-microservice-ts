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
    fakeMessage: Message;
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
      return { sut, fakeChat, fakeModel, fakeMessage, chatConfigInput };
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
      .mockResolvedValue(left(new Error("message: fatal err; stack: line 1")));
    const error = await sut.createChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error creating chat: " +
            new Error("message: fatal err; stack: line 1")
        )
      )
    );
  });
  it("should return left when error occurs add message in createChat method", async () => {
    const { sut, fakeChat } = makeSut();
    jest
      .spyOn(postgreSQLDatabase, "addMessage")
      .mockResolvedValue(left(new Error("message: fatal err; stack: line 2")));
    const error = await sut.createChat(fakeChat);
    expect(error.isLeft()).toBeTruthy();
    expect(error).toEqual(
      left(
        new Error(
          "error saving message when creating chat: " +
            new Error("message: fatal err; stack: line 2")
        )
      )
    );
  });
  it("should return chat when creating a chat in createChat method", async () => {
    const { sut, fakeChat } = makeSut();
    const chatOrError = await sut.createChat(fakeChat);
    expect(chatOrError.isRight()).toBeTruthy();
    expect(chatOrError).toEqual(right(fakeChat));
  });
});
