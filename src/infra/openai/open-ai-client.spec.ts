import { OpenAI} from "openai";
import openAIClient from "./open-ai-client";

describe("Open AI Client", () => {
  beforeAll(() => {
    openAIClient.setup("test");
  });
  afterAll(() => {
    openAIClient.client = null as unknown as OpenAI;
  });
  it("should setup the client", () => {
    openAIClient.setup("test");
    expect(openAIClient.client.chat).toHaveProperty("completions");
  });
});
