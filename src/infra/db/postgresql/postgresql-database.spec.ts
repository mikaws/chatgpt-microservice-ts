import { left, right } from "../../../shared/either";
import { postgreSQLDatabase } from "./postgresql-database";

describe("PostgreSQL Database", () => {
  beforeAll(async () => {
    await postgreSQLDatabase.connect({
      user: "postgres",
      host: "localhost",
      database: "adm",
      password: "sysdba",
      port: 5432,
    });
  });
  beforeEach(async () => {
    await postgreSQLDatabase.pool.query(`
      CREATE TEMPORARY TABLE IF NOT EXISTS chats (LIKE chats INCLUDING ALL);
      CREATE TEMPORARY TABLE IF NOT EXISTS messages (LIKE messages INCLUDING ALL);
    `);
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
  it("should handle error when query createChat is invalid", async () => {
    const error = await postgreSQLDatabase.createChat({
      CreatedAt: new Date(),
      FrequencyPenalty: 0,
      ID: "uuid",
      InitialMessageID: "starting",
      MaxTokens: 50 as unknown as any,
      Model: "gpt-4",
      ModelMaxTokens: 100,
      N: 1,
      PresencePenalty: 1,
      Status: "ok",
      Stop: "",
      Temperature: 1,
      TokenUsage: 10,
      TopP: 1,
      UpdatedAt: "invalid date" as unknown as any, // error here
      UserID: "uuid",
    });
    expect(error.isLeft).toBeTruthy();
    expect(String(error.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the chat when createChat is called", async () => {
    const chat = await postgreSQLDatabase.createChat({
      CreatedAt: new Date(),
      FrequencyPenalty: 0,
      ID: "uuid",
      InitialMessageID: "starting",
      MaxTokens: 50,
      Model: "gpt-4",
      ModelMaxTokens: 100,
      N: 1,
      PresencePenalty: 1,
      Status: "ok",
      Stop: "",
      Temperature: 1,
      TokenUsage: 10,
      TopP: 1,
      UpdatedAt: new Date(),
      UserID: "uuid",
    });
    expect(chat.isRight).toBeTruthy();
    expect(chat).toEqual(right([]));
  });
  it("should handle error when query addMessage is invalid", async () => {
    const error = await postgreSQLDatabase.addMessage({
      ChatID: "uuid",
      Content: "test",
      Erased: false,
      OrderMsg: 0,
      Role: "system",
      Tokens: 50,
      CreatedAt: "invalid date" as unknown as any, // error here
      ID: "uuid",
      Model: "gpt-4",
    });
    expect(error.isLeft).toBeTruthy();
    expect(String(error.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the message when createMessage is called", async () => {
    const message = await postgreSQLDatabase.addMessage({
      ChatID: "uuid",
      Content: "test",
      Erased: false,
      OrderMsg: 0,
      Role: "system",
      Tokens: 50,
      CreatedAt: new Date(),
      ID: "uuid",
      Model: "gpt-4",
    });
    expect(message.isRight).toBeTruthy();
    expect(message).toEqual(right([]));
  });
  it("should handle error when query findChatById is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findChatByID("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return null when query findChatById is called and value is not found", async () => {
    const chatNotFound = await postgreSQLDatabase.findChatByID("uuid");
    expect(chatNotFound.isRight).toBeTruthy();
    expect(chatNotFound).toEqual(right(undefined));
  });
  it("should find the chat when query findChatById is called", async () => {
    const date = new Date();
    await postgreSQLDatabase.createChat({
      CreatedAt: date,
      FrequencyPenalty: 0,
      ID: "uuid",
      InitialMessageID: "starting",
      MaxTokens: 50 as unknown as any,
      Model: "gpt-4",
      ModelMaxTokens: 100,
      N: 1,
      PresencePenalty: 1,
      Status: "ok",
      Stop: "",
      Temperature: 1,
      TokenUsage: 10,
      TopP: 1,
      UpdatedAt: date,
      UserID: "uuid",
    });
    const chat = await postgreSQLDatabase.findChatByID("uuid");
    expect(chat.isRight).toBeTruthy();
    expect(chat).toEqual(
      right({
        created_at: date,
        frequency_penalty: "0.00",
        id: "uuid",
        initial_message_id: "starting",
        max_tokens: 50,
        model: "gpt-4",
        model_max_tokens: 100,
        n: 1,
        presence_penalty: "1.00",
        status: "ok",
        stop: "",
        temperature: "1.00",
        token_usage: 10,
        top_p: "1.00",
        updated_at: date,
        user_id: "uuid",
      })
    );
  });
  it("should handle error when query findMessagesByChatID is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findMessagesByChatID("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query findMessagesByChatID is called", async () => {
    const messages = await postgreSQLDatabase.findMessagesByChatID("uuid");
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });
  it("should handle error when query findErasedMessagesByChatID is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findErasedMessagesByChatID("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query findErasedMessagesByChatID is called", async () => {
    const messages = await postgreSQLDatabase.findErasedMessagesByChatID("uuid");
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });
  it("should handle error when query saveChat is invalid", async () => {
    const chat = await postgreSQLDatabase.saveChat({
      FrequencyPenalty: 0,
      ID: "uuid",
      InitialMessageID: "starting",
      MaxTokens: 50 as unknown as any,
      Model: "gpt-4",
      ModelMaxTokens: 100,
      N: 1,
      PresencePenalty: 1,
      Status: "ok",
      Stop: "",
      Temperature: 1,
      TokenUsage: 10,
      TopP: 1,
      UpdatedAt: "invalid date" as unknown as any, // error here
      UserID: "uuid",
    });
    expect(chat.isLeft).toBeTruthy();
    expect(String(chat.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the chat when saveChat is called", async () => {
    const chat = await postgreSQLDatabase.saveChat({
      FrequencyPenalty: 0,
      ID: "uuid",
      InitialMessageID: "starting",
      MaxTokens: 50,
      Model: "gpt-4",
      ModelMaxTokens: 100,
      N: 1,
      PresencePenalty: 1,
      Status: "ok",
      Stop: "",
      Temperature: 1,
      TokenUsage: 10,
      TopP: 1,
      UpdatedAt: new Date(),
      UserID: "uuid",
    });
    expect(chat.isRight).toBeTruthy();
    expect(chat).toEqual(right([]));
  });
  it("should handle error when query deleteChatMessages is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.deleteChatMessages("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query deleteChatMessages is called", async () => {
    const messages = await postgreSQLDatabase.deleteChatMessages("uuid");
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });
  it("should handle error when query deleteErasedChatMessages is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.deleteErasedChatMessages("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query deleteErasedChatMessages is called", async () => {
    const messages = await postgreSQLDatabase.deleteErasedChatMessages("uuid");
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });

});
