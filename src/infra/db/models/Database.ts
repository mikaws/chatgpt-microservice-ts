import { Either } from "../../../shared/either";
import {
  AddMessageParams,
  ChatDB,
  CreateChatParams,
  DBConfig,
  MessageDB,
  UpdateChatParams,
} from "./DatabaseModels";

export interface Database<T> {
  pool: T;
  connect(dbConfig: DBConfig): Promise<void>;
  disconnect(): Promise<void>;
  createChat(chat: CreateChatParams): Promise<Either<Error, any>>;
  addMessage(message: AddMessageParams): Promise<Either<Error, any>>;
  findChatById(chatId: string): Promise<Either<Error, ChatDB | undefined>>;
  findMessagesByChatId(chatId: string): Promise<Either<Error, MessageDB[]>>;
  findErasedMessagesByChatId(chatId: string): Promise<Either<Error, MessageDB[]>>;
  updateChat(chat: UpdateChatParams): Promise<Either<Error, any>>;
  deleteChatMessages(chatId: string): Promise<Either<Error, any>>;
  deleteErasedChatMessages(chatId: string): Promise<Either<Error, any>>;
}
