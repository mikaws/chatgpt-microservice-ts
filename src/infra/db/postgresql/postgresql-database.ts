import { Pool, QueryResult } from "pg";
import { Either, left, right } from "../../../shared/either";
import { Database } from "../models/Database";
import {
  AddMessageParams,
  Chat,
  CreateChatParams,
  DBConfig,
  Message,
  SaveChatParams,
} from "../models/DatabaseModels";

export const postgreSQLDatabase: Database<Pool> = {
  pool: null as unknown as Pool,

  async connect(dbConfig: DBConfig): Promise<void> {
    this.pool = new Pool(dbConfig);
    await this.pool.connect();
  },

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log("Disconnected from PostgreSQL");
  },

  async createChat(chat: CreateChatParams): Promise<Either<Error, any>> {
    const query = `
        INSERT INTO chats
        (id, user_id, initial_message_id, status, token_usage, model, model_max_tokens, temperature, top_p, n, stop, max_tokens, presence_penalty, frequency_penalty, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `;
    try {
      const result: any = await this.pool.query(query, [
        chat.ID,
        chat.UserID,
        chat.InitialMessageID,
        chat.Status,
        chat.TokenUsage,
        chat.Model,
        chat.ModelMaxTokens,
        chat.Temperature,
        chat.TopP,
        chat.N,
        chat.Stop,
        chat.MaxTokens,
        chat.PresencePenalty,
        chat.FrequencyPenalty,
        chat.CreatedAt,
        chat.UpdatedAt,
      ]);
      return right(result as any);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async addMessage(message: AddMessageParams): Promise<Either<Error, any>> {
    const query = `
        INSERT INTO messages (id, chat_id, role, content, tokens, model, erased, order_msg, created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;
    try {
      const result = await this.pool.query(query, [
        message.ID,
        message.ChatID,
        message.Role,
        message.Content,
        message.Tokens,
        message.Model,
        message.Erased,
        message.OrderMsg,
        message.CreatedAt,
      ]);
      return right(result as any);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findChatByID(id: string): Promise<Either<Error, Chat | null>> {
    const query = "SELECT * FROM chats WHERE id = $1;";
    try {
      const result: QueryResult<Chat> = await this.pool.query(query, [id]);
      return right(result?.rows[0] || null);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findMessagesByChatID(
    chatID: string
  ): Promise<Either<Error, Message[]>> {
    const query =
      "SELECT * FROM messages WHERE erased = false AND chat_id = $1 ORDER BY order_msg ASC;";
    try {
      const result: QueryResult<Message> = await this.pool.query(query, [
        chatID,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async findErasedMessagesByChatID(
    chatID: string
  ): Promise<Either<Error, Message[]>> {
    const query =
      "SELECT * FROM messages WHERE erased = true AND chat_id = $1 ORDER BY order_msg ASC;";
    try {
      const result: QueryResult<Message> = await this.pool.query(query, [
        chatID,
      ]);
      return right(result.rows);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async saveChat(params: SaveChatParams): Promise<Either<Error, any>> {
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
        params.UserID,
        params.InitialMessageID,
        params.Status,
        params.TokenUsage,
        params.Model,
        params.ModelMaxTokens,
        params.Temperature,
        params.TopP,
        params.N,
        params.Stop,
        params.MaxTokens,
        params.PresencePenalty,
        params.FrequencyPenalty,
        params.UpdatedAt,
        params.ID,
      ]);
      return right(result);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async deleteChatMessages(chatID: string): Promise<Either<Error, any>> {
    const query = "DELETE FROM messages WHERE chat_id = $1;";
    try {
      const result = await this.pool.query(query, [chatID]);
      return right(result);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },

  async deleteErasedChatMessages(chatID: string): Promise<Either<Error, any>> {
    const query = "DELETE FROM messages WHERE erased = true AND chat_id = $1;";
    try {
      const result = await this.pool.query(query, [chatID]);
      return right(result);
    } catch (err: unknown) {
      return left(err as Error);
    }
  },
};
