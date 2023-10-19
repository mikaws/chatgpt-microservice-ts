import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { OpenAiAdapter } from "../../infra/openai/adapters/OpenAIAdapter";
import { PostgreSQLRepository } from "../../infra/repository/PostgreSQLRepository";
import { ChatCompletionController } from "../../presentation/controller/ChatCompletionController";
import chatConfig from "../config/chat-config";

export function makeChatCompletionController() {
  const repository = new PostgreSQLRepository();
  const gateway = new OpenAiAdapter();
  const useCase = new ChatCompletionUseCase(repository, gateway);
  const chatCompletionController = new ChatCompletionController(
    useCase,
    chatConfig
  );
  return chatCompletionController;
}
