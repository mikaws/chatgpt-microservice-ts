import { Either } from "../../shared/either";
import { Chat } from "../entity/Chat";

export type ChatGateway = {
  createChat(chat: Chat): Either<Error, Chat>;
  findChatById(chatId: string): Either<Error, Chat>;
  saveChat(chat: Chat): Either<Error, Chat>;
};
