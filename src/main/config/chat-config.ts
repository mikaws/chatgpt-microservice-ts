import { ChatCompletionConfigInputDTO } from "../../domain/usecase/ChatCompletionDTO";

function getConfig(): ChatCompletionConfigInputDTO {
  return {
    initialSystemMessage: process.env.INITIAL_CHAT_MESSAGE,
    model: process.env.MODEL,
    maxTokens: process.env.MAX_TOKENS,
    modelMaxTokens: process.env.MODEL_MAX_TOKENS,
    n: process.env.N,
    stop: process.env.STOP,
    temperature: process.env.TEMPERATURE,
    topP: process.env.TOP_P,
    frequencyPenalty: process.env.FREQUENCY_PENALTY,
    presencePenalty: process.env.PRESENCE_PENALTY,
  };
}
const chatConfig = getConfig();

export default chatConfig;
