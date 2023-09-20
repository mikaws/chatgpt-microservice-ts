import { Either, right } from "../../shared/either";
import { CreateChatCompletionRequest } from "./models/OpenAIRequest";
import { CreateChatCompletionResponse } from "./models/OpenAIResponse";
import { OpenAIGateway } from "./OpenAIGateway";

export class InMemoryOpenAIGateway implements OpenAIGateway {
  async createChatCompletion(
    createChatCompletionRequest: CreateChatCompletionRequest
  ): Promise<Either<Error, CreateChatCompletionResponse>> {
    const createChatCompletionResponse = await new Promise((resolve) => {
      return resolve(createChatCompletionRequest);
    }).then((res: unknown) => {
      const obj = res as CreateChatCompletionRequest;
      return {
        id: "uuid",
        object: "any",
        created: 1,
        model: obj.model,
        usage: {
          completion_tokens: 1,
          total_tokens: 5,
          prompt_tokens: 2,
        },
        choices: [
          {
            index: 1,
            finish_reason: "ended",
            message: {
              content: "Hello. How can I help you?",
              role: "assistant",
            },
          },
        ],
      } as CreateChatCompletionResponse;
    });
    return right(createChatCompletionResponse);
  }
}
