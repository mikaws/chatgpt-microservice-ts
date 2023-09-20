import { Either, right } from "../../shared/either";
import { ChatCompletionRequest } from "./models/OpenAIRequests";
import { ChatCompletionResponse } from "./models/OpenAIResponses";
import { OpenAIGateway } from "./OpenAIGateway";

export class InMemoryOpenAIGateway implements OpenAIGateway {
  async createChatCompletion(
    createChatCompletionRequest: ChatCompletionRequest
  ): Promise<Either<Error, ChatCompletionResponse>> {
    const createChatCompletionResponse = await new Promise((resolve) => {
      return resolve(createChatCompletionRequest);
    }).then((res: unknown) => {
      const obj = res as ChatCompletionRequest;
      return {
        id: "uuid",
        model: obj.model,
        finish_reason: "ended",
        usage: {
          prompt_tokens: 2,
          total_tokens: 5,
          completion_tokens: 1,
        },
        message: {
          content: "Hello. How can I help you?",
          role: "assistant",
        },
      } as ChatCompletionResponse;
    });
    return right(createChatCompletionResponse);
  }
}
