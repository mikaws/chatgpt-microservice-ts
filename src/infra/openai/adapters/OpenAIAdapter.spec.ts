import { OpenAiAdapter } from "./OpenAIAdapter";
import { left, right } from "../../../shared/either";
import openAIClient from "../open-ai-client";
import { OpenAIApi } from "openai";

describe("Open AI Adapter", () => {
  beforeAll(() => {
    openAIClient.setup("test");
  });
  afterAll(() => {
    openAIClient.client = null as unknown as OpenAIApi;
  });
  it("should throw error when choice not found", async () => {
    const openAiAdapter = new OpenAiAdapter();
    jest.spyOn(openAIClient.client, "createChatCompletion").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          data: {
            choices: [],
            created: 1,
            id: "uuid",
            model: "gpt-3.5",
            object: "test",
          },
          config: {},
          headers: {},
          status: 200,
          statusText: "ok",
        })
      )
    );
    const data = await openAiAdapter.createChatCompletion({
      messages: [{ content: "test", role: "user" }],
      model: "gpt-3.5",
    });
    expect(data.isLeft()).toBeTruthy();
    expect(data).toEqual(
      left(new Error("choice was not found in the chat completion response"))
    );
  });
  it("should throw error when messages not found", async () => {
    const openAiAdapter = new OpenAiAdapter();
    jest.spyOn(openAIClient.client, "createChatCompletion").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          data: {
            choices: [{}],
            created: 1,
            id: "uuid",
            model: "gpt-3.5",
            object: "test",
          },
          config: {},
          headers: {},
          status: 200,
          statusText: "ok",
        })
      )
    );
    const data = await openAiAdapter.createChatCompletion({
      messages: [{ content: "test", role: "user" }],
      model: "gpt-3.5",
    });
    expect(data.isLeft()).toBeTruthy();
    expect(data).toEqual(
      left(new Error("message was not found in the chat completion response"))
    );
  });
  it("should throw error in openAI and catch", async () => {
    jest
      .spyOn(openAIClient.client, "createChatCompletion")
      .mockRejectedValue(new Error("any"));
    const openAiAdapter = new OpenAiAdapter();
    const data = await openAiAdapter.createChatCompletion({
      messages: [{ content: "test", role: "user" }],
      model: "gpt-3.5",
    });
    expect(data.isLeft()).toBeTruthy();
    expect(data).toEqual(left(new Error("any")));
  });
  it("should create the chat completion", async () => {
    jest.spyOn(openAIClient.client, "createChatCompletion").mockReturnValue(
      new Promise((resolve) =>
        resolve({
          data: {
            choices: [{ message: { content: "hello!", role: "assistant" } }],
            created: 1,
            id: "uuid",
            model: "gpt-3.5",
            object: "test",
          },
          config: {},
          headers: {},
          status: 200,
          statusText: "ok",
        })
      )
    );
    const openAiAdapter = new OpenAiAdapter();
    const data = await openAiAdapter.createChatCompletion({
      messages: [{ content: "test", role: "user" }],
      model: "gpt-3.5",
    });
    expect(data.isRight()).toBeTruthy();
    expect(data).toEqual(
      right({
        id: "uuid",
        model: "gpt-3.5",
        usage: undefined,
        message: {
          content: "hello!",
          role: "assistant",
        },
        finish_reason: undefined,
      })
    );
  });
});
