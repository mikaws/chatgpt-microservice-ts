export type AddMessageParams = {
  ID: string;
  ChatID: string;
  Role: string;
  Content: string;
  Tokens: number;
  Model: string;
  Erased: boolean;
  OrderMsg: number;
  CreatedAt: Date;
};

export type CreateChatParams = {
  ID: string;
  UserID: string;
  InitialMessageID: string;
  Status: string;
  TokenUsage: number;
  Model: string;
  ModelMaxTokens: number;
  Temperature: number;
  TopP: number;
  N: number;
  Stop: string;
  MaxTokens: number;
  PresencePenalty: number;
  FrequencyPenalty: number;
  CreatedAt: Date;
  UpdatedAt: Date;
};

export type SaveChatParams = {
  UserID: string;
  InitialMessageID: string;
  Status: string;
  TokenUsage: number;
  Model: string;
  ModelMaxTokens: number;
  Temperature: number;
  TopP: number;
  N: number;
  Stop: string;
  MaxTokens: number;
  PresencePenalty: number;
  FrequencyPenalty: number;
  UpdatedAt: Date;
  ID: string;
};

export type DBConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
};

export type Chat = {
  ID: string;
  UserID: string;
  InitialMessageID: string;
  Status: string;
  TokenUsage: number;
  Model: string;
  ModelMaxTokens: number;
  Temperature: number;
  TopP: number;
  N: number;
  Stop: string;
  MaxTokens: number;
  PresencePenalty: number;
  FrequencyPenalty: number;
  CreatedAt: Date;
  UpdatedAt: Date;
};

export type Message = {
  ID: string;
  ChatID: string;
  Role: string;
  Content: string;
  Tokens: number;
  Model: string;
  Erased: boolean;
  OrderMsg: number;
  CreatedAt: Date;
};
