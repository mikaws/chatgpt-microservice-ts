export type DBConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
};

export type ChatDB = {
  id: string;
  user_id: string;
  initial_message_id: string;
  status: string;
  token_usage: number;
  model: string;
  model_max_tokens: number;
  temperature: number;
  top_p: number;
  n: number;
  stop: string;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  created_at: Date;
  updated_at: Date;
};

export type MessageDB = {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  tokens: number;
  model: string;
  erased: boolean;
  order_msg: number;
  created_at: Date;
};

export type CreateChatParams = ChatDB;
export type AddMessageParams = MessageDB;
export type UpdateChatParams = Omit<ChatDB, "created_at">;
