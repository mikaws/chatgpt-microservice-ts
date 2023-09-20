import { Either } from "../../shared/either";
import { Chat } from "../entity/Chat";

export type ChatRepository = {
  createChat(chat: Chat): Promise<Either<Error, Chat>>;
  findChatById(chatId: string): Promise<Either<Error, Chat>>;
  saveChat(chat: Chat): Promise<Either<Error, Chat>>;
};
