export type UnsanitizedEnvironment = {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  INITIAL_CHAT_MESSAGE?: string;
  OPENAI_API_KEY?: string;
  MODEL?: string;
  MODEL_MAX_TOKENS?: string;
  TEMPERATURE?: string;
  TOP_P?: string;
  N?: string;
  MAX_TOKENS?: string;
  STOP?: string;
  FREQUENCY_PENALTY?: string;
  PRESENCE_PENALTY?: string;
  SERVER_PORT?: string;
  ENVIRONMENT?: string;
};

export type Environment = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  INITIAL_CHAT_MESSAGE: string;
  OPENAI_API_KEY: string;
  MODEL: string;
  MODEL_MAX_TOKENS: number;
  TEMPERATURE: number;
  TOP_P: number;
  N: number;
  MAX_TOKENS: number;
  STOP: string[];
  FREQUENCY_PENALTY: number;
  PRESENCE_PENALTY: number;
  SERVER_PORT: number;
  ENVIRONMENT: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends UnsanitizedEnvironment {}
  }
}
