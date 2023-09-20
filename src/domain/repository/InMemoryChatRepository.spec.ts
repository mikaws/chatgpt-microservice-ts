import { InMemoryChatRepository } from "./InMemoryChatRepository";
import { Chat } from "../entity/Chat";
import { Model } from "../entity/Model";
import { Message } from "../entity/Message";
import { Either } from "../../shared/either";
import { ChatRepository } from "./ChatRepository";

interface IChatOptions {
  temperature: number;
  topP: number;
  n: number;
  stop: Array<string>;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

type SutTypes = {
  sut: ChatRepository;
  fakeChat: Chat;
  fakeChatOptions: IChatOptions;
  createChatStub: (
    userId: string,
    options: IChatOptions
  ) => Either<Error, Chat>;
};

describe("InMemoryChatRepository", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const sut = new InMemoryChatRepository();
      const createChatStub = (userId: string, options: IChatOptions) => {
        const { maxTokens } = options;
        const model = Model.create("codex", maxTokens);
        const message = Message.create(
          "user",
          "Why the sky is blue?",
          model.value as Model
        );
        const chatConfig = {
          ...options,
          model: model.value as Model,
        };
        return Chat.create(userId, message.value as Message, chatConfig);
      };
      const fakeChatOptions = {
        temperature: 0.75,
        topP: 0.8,
        n: 10,
        stop: [],
        maxTokens: 500,
        presencePenalty: 1.5,
        frequencyPenalty: 2.0,
      };
      const fakeChat = createChatStub("uuid", fakeChatOptions).value as Chat;
      return { sut, fakeChat, fakeChatOptions, createChatStub };
    };
  });

  test("createChat should return an error if chat already exist", async () => {
    const { sut, fakeChat } = makeSut();
    await sut.createChat(fakeChat);
    const newChatAlredyCreated = await sut.createChat(fakeChat);
    expect(newChatAlredyCreated.isLeft()).toBe(true);
    const error = newChatAlredyCreated.value as Error;
    expect(error.message).toBe("chat already exists");
  });

  test("createChat should add a chat to the repository", async () => {
    const { sut, fakeChat } = makeSut();
    const result = await sut.createChat(fakeChat);
    expect(result.isRight()).toBe(true);
    const createdChat = result.value as Chat;
    expect(createdChat).toEqual(fakeChat);
  });

  test("findChatById should return an error if chat does not exist", async () => {
    const { sut } = makeSut();
    const result = await sut.findChatById("");
    expect(result.isLeft()).toBe(true);
    const error = result.value as Error;
    expect(error.message).toBe("chat not found");
  });

  test("findChatById should return a chat if it exists", async () => {
    const { sut, fakeChat } = makeSut();
    const createdChat = (await sut.createChat(fakeChat)).value as Chat;
    const result = await sut.findChatById(createdChat.id);
    expect(result.isRight()).toBe(true);
    const foundChat = result.value as Chat;
    expect(foundChat).toEqual(fakeChat);
  });

  test("saveChat should return an error if chat does not exist", async () => {
    const { sut, createChatStub, fakeChatOptions } = makeSut();
    const chatToUpdate = createChatStub("user-uuid", fakeChatOptions)
      .value as Chat;
    const result = await sut.saveChat(chatToUpdate);
    expect(result.isLeft()).toBe(true);
    const error = result.value as Error;
    expect(error.message).toBe("chat not found");
  });

  test("saveChat should update an existing chat", async () => {
    const { sut, fakeChat } = makeSut();
    const chatToUpdate = (await sut.createChat(fakeChat)).value as Chat;
    const result = await sut.saveChat(chatToUpdate);
    expect(result.isRight()).toBe(true);
    const updatedChat = result.value as Chat;
    expect(updatedChat).toEqual(chatToUpdate);
  });
});
