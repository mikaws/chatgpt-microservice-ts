import { ChatCompletionConfigInputDTO } from "../../domain/usecase/ChatCompletionDTO";
import env from "./environment";

function getConfig(): ChatCompletionConfigInputDTO {
  return {
    initialSystemMessage: env.INITIAL_CHAT_MESSAGE,
    model: env.MODEL,
    maxTokens: env.MAX_TOKENS,
    modelMaxTokens: env.MODEL_MAX_TOKENS,
    n: env.N,
    stop: env.STOP,
    temperature: env.TEMPERATURE,
    topP: env.TOP_P,
    frequencyPenalty: env.FREQUENCY_PENALTY,
    presencePenalty: env.PRESENCE_PENALTY,
  };
}
const chatConfig = getConfig();

export default chatConfig;
