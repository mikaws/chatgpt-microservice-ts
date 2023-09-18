import { Pool, QueryResult } from "pg";
import { Database } from "../models/Database";

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

  async createChat(chat: CreateChatParams): Promise<void> {
    const query = `
        INSERT INTO chats
        (id, user_id, initial_message_id, status, token_usage, model, model_max_tokens, temperature, top_p, n, stop, max_tokens, presence_penalty, frequency_penalty, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `;
    await this.pool.query(query, [
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
  },

  async addMessage(message: AddMessageParams): Promise<void> {
    const query = `
        INSERT INTO messages (id, chat_id, role, content, tokens, model, erased, order_msg, created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `;
    await this.pool.query(query, [
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
  },

  async findChatByID(id: string): Promise<Chat | null> {
    const query = "SELECT * FROM chats WHERE id = $1;";
    const result: QueryResult<Chat> = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async findMessagesByChatID(chatID: string): Promise<Message[]> {
    const query =
      "SELECT * FROM messages WHERE erased = false AND chat_id = $1 ORDER BY order_msg ASC;";
    const result: QueryResult<Message> = await this.pool.query(query, [chatID]);
    return result.rows;
  },

  async findErasedMessagesByChatID(chatID: string): Promise<Message[]> {
    const query =
      "SELECT * FROM messages WHERE erased = true AND chat_id = $1 ORDER BY order_msg ASC;";
    const result: QueryResult<Message> = await this.pool.query(query, [chatID]);
    return result.rows;
  },

  async saveChat(params: SaveChatParams): Promise<void> {
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
    await this.pool.query(query, [
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
  },

  async deleteChatMessages(chatID: string): Promise<void> {
    const query = "DELETE FROM messages WHERE chat_id = $1;";
    await this.pool.query(query, [chatID]);
  },

  async deleteErasedChatMessages(chatID: string): Promise<void> {
    const query = "DELETE FROM messages WHERE erased = true AND chat_id = $1;";
    await this.pool.query(query, [chatID]);
  },
};
