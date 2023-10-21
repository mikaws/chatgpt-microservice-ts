import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { OpenAiAdapter } from "../../infra/openai/adapters/OpenAIAdapter";
import { PostgreSQLRepository } from "../../infra/repository/PostgreSQLRepository";
import {
  ChatCompletionController,
} from "../../presentation/controller/ChatCompletionController";
import { ChatCompletionBody } from "../../presentation/protocols/body";
import { RequiredFieldValidator } from "../../presentation/validators/RequiredFieldsValidator";
import chatConfig from "../config/chat-config";

export function makeChatCompletionController() {
  const repository = new PostgreSQLRepository();
  const gateway = new OpenAiAdapter();
  const useCase = new ChatCompletionUseCase(repository, gateway);
  const validator = new RequiredFieldValidator<ChatCompletionBody>([
    "chatId",
    "userId",
    "userMessage",
  ]);
  const chatCompletionController = new ChatCompletionController(
    validator,
    useCase,
    chatConfig
  );
  return chatCompletionController;
}
