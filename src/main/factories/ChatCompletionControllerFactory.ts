import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { openAIClient } from "../../infra/openai/open-ai-client";
import { PostgreSQLRepository } from "../../infra/repository/PostgreSQLRepository";
import { ChatCompletionController } from "../../presentation/controller/ChatCompletionController";

export function makeChatCompletionController() {
    const repository = new PostgreSQLRepository();
    const useCase = new ChatCompletionUseCase(repository, openAIClient);
    const chatCompletionController = new ChatCompletionController(useCase);
    return chatCompletionController;
}
