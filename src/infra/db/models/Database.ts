import { Either } from "../../../shared/either";
import {
  AddMessageParams,
  Chat,
  CreateChatParams,
  DBConfig,
  Message,
  SaveChatParams,
} from "./DatabaseModels";

export interface Database<T> {
  pool: T;
  connect(dbConfig: DBConfig): Promise<void>;
  disconnect(): Promise<void>;
  createChat(chat: CreateChatParams): Promise<Either<Error, any>>;
  addMessage(message: AddMessageParams): Promise<Either<Error, any>>;
  findChatByID(id: string): Promise<Either<Error, Chat | null>>;
  findMessagesByChatID(chatID: string): Promise<Either<Error, Message[]>>;
  findErasedMessagesByChatID(chatID: string): Promise<Either<Error, Message[]>>;
  saveChat(params: SaveChatParams): Promise<Either<Error, any>>;
  deleteChatMessages(chatID: string): Promise<Either<Error, any>>;
  deleteErasedChatMessages(chatID: string): Promise<Either<Error, any>>;
}
