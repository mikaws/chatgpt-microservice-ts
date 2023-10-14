import { OpenAIApi } from "openai";
import { left, right } from "../../shared/either";
import openAIClient from "./open-ai-client";

describe("Open AI Client", () => {
  beforeAll(() => {
    openAIClient.setup("test");
  });
  afterAll(() => {
    openAIClient.client = null as unknown as OpenAIApi;
  });
  it("should setup the client", () => {
    openAIClient.setup("test");
    expect(openAIClient.client).toHaveProperty("createChatCompletion");
  });
});
