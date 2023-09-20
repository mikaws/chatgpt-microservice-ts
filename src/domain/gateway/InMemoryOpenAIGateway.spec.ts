import { Chat } from "../entity/Chat";
import { Model } from "../entity/Model";
import { Message } from "../entity/Message";
import { Either } from "../../shared/either";
import { OpenAIGateway } from "./OpenAIGateway";
import { InMemoryOpenAIGateway } from "./InMemoryOpenAIGateway";
import { CreateChatCompletionRequest } from "./models/OpenAIRequest";
import { ChatCompletionOutputDTO } from "../usecase/ChatCompletionDTO";
import { ChatCompletionResponseMessage, CreateChatCompletionResponse } from "./models/OpenAIResponse";

type SutTypes = {
  sut: OpenAIGateway;
};

describe("InMemoryChatRepository", () => {
  let makeSut: () => SutTypes;
  beforeEach(() => {
    makeSut = () => {
      const sut = new InMemoryOpenAIGateway();
      return { sut };
    };
  });

  test("createChatCompletion should return a valid response", async () => {
    const { sut } = makeSut();
    const chatRequest: CreateChatCompletionRequest = {
      model: "gpt-4",
      messages: [
        {
          content: "test",
          role: "user",
        },
      ],
      max_tokens: 200,
      temperature: 1,
      top_p: 1,
      presence_penalty: 1,
      frequency_penalty: 1,
      stop: [],
    };
    const res = await sut.createChatCompletion(chatRequest);
    expect(res.isRight()).toBe(true);
    const chatCompletion = res.value as CreateChatCompletionResponse;
    expect(chatCompletion).toEqual({
        id: "uuid",
        object: "any",
        created: 1,
        model: chatRequest.model,
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
      });
  });
});
