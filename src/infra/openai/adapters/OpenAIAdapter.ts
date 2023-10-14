import { ChatCompletionRequest } from "../../../domain/gateway/models/OpenAIRequests";
import { ChatCompletionResponse } from "../../../domain/gateway/models/OpenAIResponses";
import { OpenAIGateway } from "../../../domain/gateway/OpenAIGateway";
import { Either, left, right } from "../../../shared/either";
import openAIClient from "../open-ai-client";

export class OpenAiAdapter implements OpenAIGateway {
  async createChatCompletion(
    createChatCompletionRequest: ChatCompletionRequest
  ): Promise<Either<Error, ChatCompletionResponse>> {
    try {
      const { data } = await openAIClient.client.createChatCompletion(
        createChatCompletionRequest
      );
      const choice = data.choices[0];
      if (!choice)
        throw Error("choice was not found in the chat completion response");
      const message = choice.message;
      if (!message)
        throw Error("message was not found in the chat completion response");
      const chatCompletion: ChatCompletionResponse = {
        id: data.id,
        model: data.model,
        usage: data.usage,
        message: {
          content: message.content,
          role: message.role,
        },
        finish_reason: choice.finish_reason,
      };
      return right(chatCompletion);
    } catch (error) {
      return left(error as Error);
    }
  }
}
