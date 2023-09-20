import { Either, left, right } from "../../shared/either";
import { Chat } from "../entity/Chat";
import { ChatRepository } from "../repository/ChatRepository";

export class InMemoryChatRepository implements ChatRepository {
  private chats: Chat[] = [];

  async createChat(chat: Chat): Promise<Either<Error, Chat>> {
    const chatIndex = this.chats.findIndex((c) => c.id === c.id);
    if (chatIndex !== -1) return left(new Error("chat already exists"));
    this.chats.push(chat);
    return right(chat);
  }

  async findChatById(chatId: string): Promise<Either<Error, Chat>> {
    const chat = this.chats.find((chat) => chat.id === chatId);
    if (!chat) return left(new Error("chat not found"));
    return right(chat);
  }

  async saveChat(chat: Chat): Promise<Either<Error, Chat>> {
    const chatIndex = this.chats.findIndex((c) => c.id === chat.id);
    if (chatIndex === -1) return left(new Error("chat not found"));
    this.chats[chatIndex] = chat;
    return right(chat);
  }
}
