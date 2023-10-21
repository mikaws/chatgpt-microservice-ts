import { Environment, UnsanitizedEnvironment } from "../../shared/environment";
import dotenv from "dotenv";

dotenv.config();
const rawEnv: UnsanitizedEnvironment = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  INITIAL_CHAT_MESSAGE: process.env.INITIAL_CHAT_MESSAGE,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MODEL: process.env.MODEL,
  MODEL_MAX_TOKENS: process.env.MODEL_MAX_TOKENS,
  TEMPERATURE: process.env.TEMPERATURE,
  TOP_P: process.env.TOP_P,
  N: process.env.N,
  MAX_TOKENS: process.env.MAX_TOKENS,
  STOP: process.env.STOP,
  FREQUENCY_PENALTY: process.env.FREQUENCY_PENALTY,
  PRESENCE_PENALTY: process.env.PRESENCE_PENALTY,
  SERVER_PORT: process.env.SERVER_PORT,
};
function sanitizeEnv() {
  for (const key in rawEnv) {
    if (process.env[key] === undefined) {
      throw new Error(`key ${key} not found or undefined in .env file`);
    }
  }
}
sanitizeEnv();
const env: Environment = {
  DB_HOST: String(process.env.DB_HOST),
  DB_PORT: Number(process.env.DB_PORT),
  DB_USER: String(process.env.DB_USER),
  DB_PASSWORD: String(process.env.DB_PASSWORD),
  DB_NAME: String(process.env.DB_NAME),
  INITIAL_CHAT_MESSAGE: String(process.env.INITIAL_CHAT_MESSAGE),
  OPENAI_API_KEY: String(process.env.OPENAI_API_KEY),
  MODEL: String(process.env.MODEL),
  MODEL_MAX_TOKENS: Number(process.env.MODEL_MAX_TOKENS),
  TEMPERATURE: Number(process.env.TEMPERATURE),
  TOP_P: Number(process.env.TOP_P),
  N: Number(process.env.N),
  MAX_TOKENS: Number(process.env.MAX_TOKENS),
  STOP: JSON.parse(String(process.env.STOP)),
  FREQUENCY_PENALTY: Number(process.env.FREQUENCY_PENALTY),
  PRESENCE_PENALTY: Number(process.env.PRESENCE_PENALTY),
  SERVER_PORT: Number(process.env.SERVER_PORT),
};
export default env;
