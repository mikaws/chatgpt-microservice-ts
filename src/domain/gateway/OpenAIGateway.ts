import { Either } from "../../shared/either";
import { CreateChatCompletionRequest } from "./models/OpenAIRequest";
import { CreateChatCompletionResponse } from "./models/OpenAIResponse";

export type OpenAIGateway = {
  createChatCompletion(
    createChatCompletionRequest: CreateChatCompletionRequest
  ): Promise<Either<Error, CreateChatCompletionResponse>>;
};
