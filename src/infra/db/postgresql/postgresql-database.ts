import { Pool, QueryResult } from "pg";
import { Either, left, right } from "../../../shared/either";
import { Database } from "../models/Database";
import {
  AddMessageParams,
  ChatDB,
  CreateChatParams,
  DBConfig,
  MessageDB,
  UpdateChatParams,
} from "../models/DatabaseModels";

export const postgreSQLDatabase: Database<Pool> = {
  pool: null as unknown as Pool,

  async connect(dbConfig: DBConfig): Promise<void> {
    this.pool = new Pool(dbConfig);
  },

  async disconnect(): Promise<void> {
    await this.pool
      .end()
      .then(() => console.info("Disconnected from PostgreSQL"));
  },

  async createChat(chat: CreateChatParams): Promise<Either<Error, any[]>> {
    const query = `
      INSERT INTO chats
      (id, user_id, initial_message_id, status, token_usage, model, model_max_tokens, temperature, top_p, n, stop, max_tokens, presence_penalty, frequency_penalty, created_at, updated_at)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
    `;
    try {
      const result = await this.pool.query(query, [
        chat.id,
        chat.user_id,
        chat.initial_message_id,
        chat.status,
        chat.token_usage,
        chat.model,
        chat.model_max_tokens,
        chat.temperature,
        chat.top_p,
        chat.n,
        chat.stop,
        chat.max_tokens,
        chat.presence_penalty,
        chat.frequency_penalty,
        chat.created_at,
        chat.updated_at,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async addMessage(message: AddMessageParams): Promise<Either<Error, any[]>> {
    const query = `
        INSERT INTO messages (id, chat_id, role, content, tokens, model, erased, order_msg, created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;
    try {
      const result = await this.pool.query(query, [
        message.id,
        message.chat_id,
        message.role,
        message.content,
        message.tokens,
        message.model,
        message.erased,
        message.order_msg,
        message.created_at,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findChatById(
    chatId: string
  ): Promise<Either<Error, ChatDB | undefined>> {
    const query = "SELECT * FROM chats WHERE id = $1;";
    try {
      const result: QueryResult<ChatDB> = await this.pool.query(query, [
        chatId,
      ]);
      return right(result.rows[0]);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findMessagesByChatId(
    chatId: string
  ): Promise<Either<Error, MessageDB[]>> {
    const query =
      "SELECT * FROM messages WHERE erased = false AND chat_id = $1 ORDER BY order_msg ASC;";
    try {
      const result: QueryResult<MessageDB> = await this.pool.query(query, [
        chatId,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findErasedMessagesByChatId(
    chatId: string
  ): Promise<Either<Error, MessageDB[]>> {
    const query =
      "SELECT * FROM messages WHERE erased = true AND chat_id = $1 ORDER BY order_msg ASC;";
    try {
      const result: QueryResult<MessageDB> = await this.pool.query(query, [
        chatId,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async updateChat(chat: UpdateChatParams): Promise<Either<Error, any[]>> {
    const query = `
      UPDATE chats
      SET user_id = $1,
        initial_message_id = $2,
        status = $3,
        token_usage = $4,
        model = $5,
        model_max_tokens = $6,
        temperature = $7,
        top_p = $8,
        n = $9,
        stop = $10,
        max_tokens = $11,
        presence_penalty = $12,
        frequency_penalty = $13,
        updated_at = $14
      WHERE id = $15;
    `;
    try {
      const result: any = await this.pool.query(query, [
        chat.user_id,
        chat.initial_message_id,
        chat.status,
        chat.token_usage,
        chat.model,
        chat.model_max_tokens,
        chat.temperature,
        chat.top_p,
        chat.n,
        chat.stop,
        chat.max_tokens,
        chat.presence_penalty,
        chat.frequency_penalty,
        chat.updated_at,
        chat.id,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async deleteChatMessages(chatId: string): Promise<Either<Error, any[]>> {
    const query = "DELETE FROM messages WHERE erased = false AND order_msg != 0 AND chat_id = $1 ;";
    try {
      const result = await this.pool.query(query, [chatId]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async deleteErasedChatMessages(
    chatId: string
  ): Promise<Either<Error, any[]>> {
    const query = "DELETE FROM messages WHERE erased = true AND chat_id = $1;";
    try {
      const result = await this.pool.query(query, [chatId]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },
};
