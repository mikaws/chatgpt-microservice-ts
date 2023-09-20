import { OpenAIGateway } from "./OpenAIGateway";
import { InMemoryOpenAIGateway } from "./InMemoryOpenAIGateway";
import { ChatCompletionRequest } from "./models/OpenAIRequests";
import { ChatCompletionResponse } from "./models/OpenAIResponses";

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
    const chatRequest: ChatCompletionRequest = {
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
    const chatCompletion = res.value as ChatCompletionResponse;
    expect(chatCompletion).toEqual({
      id: "uuid",
      model: chatRequest.model,
      usage: {
        completion_tokens: 1,
        total_tokens: 5,
        prompt_tokens: 2,
      },
      finish_reason: "ended",
      message: {
        content: "Hello. How can I help you?",
        role: "assistant",
      },
    } as ChatCompletionResponse);
  });
});
