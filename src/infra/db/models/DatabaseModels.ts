type AddMessageParams = {
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

type CreateChatParams = {
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

type SaveChatParams = {
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

type DBConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
};

type Chat = {
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

type Message = {
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
