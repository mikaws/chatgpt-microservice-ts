import { left, right } from "../../../shared/either";
import { postgreSQLDatabase } from "./postgresql-database";

describe("PostgreSQL Database", () => {
  beforeAll(async () => {
    await postgreSQLDatabase
      .connect({
        user: "test",
        host: "test",
        database: "test",
        password: "test",
        port: 1234,
      })
      .catch((err) => {
        expect(err).toEqual(
          new Error(
            "couldn't connect with database 'getaddrinfo ENOTFOUND test'"
          )
        );
      });
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
      created_at: new Date(),
      frequency_penalty: 0,
      id: "uuid",
      initial_message_id: "starting",
      max_tokens: 50 as unknown as any,
      model: "gpt-4",
      model_max_tokens: 100,
      n: 1,
      presence_penalty: 1,
      status: "ok",
      stop: "",
      temperature: 1,
      token_usage: 10,
      top_p: 1,
      updated_at: "invalid date" as unknown as any, // error here
      user_id: "uuid",
    });
    expect(error.isLeft).toBeTruthy();
    expect(String(error.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the chat when createChat is called", async () => {
    const chat = await postgreSQLDatabase.createChat({
      created_at: new Date(),
      frequency_penalty: 0,
      id: "uuid",
      initial_message_id: "starting",
      max_tokens: 50 as unknown as any,
      model: "gpt-4",
      model_max_tokens: 100,
      n: 1,
      presence_penalty: 1,
      status: "ok",
      stop: "",
      temperature: 1,
      token_usage: 10,
      top_p: 1,
      updated_at: new Date(),
      user_id: "uuid",
    });
    expect(chat.isRight).toBeTruthy();
    expect(chat).toEqual(right([]));
  });
  it("should handle error when query addMessage is invalid", async () => {
    const error = await postgreSQLDatabase.addMessage({
      chat_id: "uuid",
      content: "test",
      erased: false,
      order_msg: 0,
      role: "system",
      tokens: 50,
      created_at: "invalid date" as unknown as any, // error here
      id: "uuid",
      model: "gpt-4",
    });
    expect(error.isLeft).toBeTruthy();
    expect(String(error.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the message when createMessage is called", async () => {
    const message = await postgreSQLDatabase.addMessage({
      chat_id: "uuid",
      content: "test",
      erased: false,
      order_msg: 0,
      role: "system",
      tokens: 50,
      created_at: new Date(), // error here
      id: "uuid",
      model: "gpt-4",
    });
    expect(message.isRight).toBeTruthy();
    expect(message).toEqual(right([]));
  });
  it("should handle error when query findChatById is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findChatById("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return null when query findChatById is called and value is not found", async () => {
    const chatNotFound = await postgreSQLDatabase.findChatById("uuid");
    expect(chatNotFound.isRight).toBeTruthy();
    expect(chatNotFound).toEqual(right(undefined));
  });
  it("should find the chat when query findChatById is called", async () => {
    const date = new Date();
    await postgreSQLDatabase.createChat({
      created_at: date,
      frequency_penalty: 0,
      id: "uuid",
      initial_message_id: "starting",
      max_tokens: 50 as unknown as any,
      model: "gpt-4",
      model_max_tokens: 100,
      n: 1,
      presence_penalty: 1,
      status: "ok",
      stop: "",
      temperature: 1,
      token_usage: 10,
      top_p: 1,
      updated_at: date,
      user_id: "uuid",
    });
    const chat = await postgreSQLDatabase.findChatById("uuid");
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
  it("should handle error when query findMessagesByChatId is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findMessagesByChatId("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query findMessagesByChatId is called", async () => {
    const messages = await postgreSQLDatabase.findMessagesByChatId("uuid");
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });
  it("should handle error when query findErasedMessagesByChatId is invalid", async () => {
    jest
      .spyOn(postgreSQLDatabase.pool, "query")
      .mockRejectedValue("error" as never);
    const error = await postgreSQLDatabase.findErasedMessagesByChatId("any");
    expect(error.isLeft).toBeTruthy();
    expect(error).toEqual(left("error"));
  });
  it("should return array when query findErasedMessagesByChatId is called", async () => {
    const messages = await postgreSQLDatabase.findErasedMessagesByChatId(
      "uuid"
    );
    expect(messages.isRight).toBeTruthy();
    expect(messages).toEqual(right([]));
  });
  it("should handle error when query updateChat is invalid", async () => {
    const chat = await postgreSQLDatabase.updateChat({
      frequency_penalty: 0,
      id: "uuid",
      initial_message_id: "starting",
      max_tokens: 50 as unknown as any,
      model: "gpt-4",
      model_max_tokens: 100,
      n: 1,
      presence_penalty: 1,
      status: "ok",
      stop: "",
      temperature: 1,
      token_usage: 10,
      top_p: 1,
      updated_at: "invalid date" as unknown as any, // error here
      user_id: "uuid",
    });
    expect(chat.isLeft).toBeTruthy();
    expect(String(chat.value)).toMatch(
      /error: invalid input syntax for type timestamp: "invalid date"/g
    );
  });
  it("should save the chat when updateChat is called", async () => {
    const chat = await postgreSQLDatabase.updateChat({
      frequency_penalty: 0,
      id: "uuid",
      initial_message_id: "starting",
      max_tokens: 50 as unknown as any,
      model: "gpt-4",
      model_max_tokens: 100,
      n: 1,
      presence_penalty: 1,
      status: "ok",
      stop: "",
      temperature: 1,
      token_usage: 10,
      top_p: 1,
      updated_at: new Date(),
      user_id: "uuid",
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
