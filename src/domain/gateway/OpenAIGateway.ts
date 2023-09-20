import { Either } from "../../shared/either";
import { ChatCompletionRequest } from "./models/OpenAIRequests";
import { ChatCompletionResponse } from "./models/OpenAIResponses";

export type OpenAIGateway = {
  createChatCompletion(
    createChatCompletionRequest: ChatCompletionRequest
  ): Promise<Either<Error, ChatCompletionResponse>>;
};
