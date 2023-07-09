import { Message } from "./Message";
import { Model } from "./Model";

const dateMock = new Date(2023, 4, 29);
const uuidV4Mock = "mocked-uuid";
const gpt3EncodecValueMock = [0, 1, 2, 3];

jest.mock("uuid", () => {
  return {
    v4: jest.fn().mockImplementation(() => uuidV4Mock),
  };
});

jest.mock("gpt-3-encoder", () => {
  return {
    encode: jest.fn().mockImplementation(() => gpt3EncodecValueMock),
  };
});

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(dateMock);
});

afterAll(() => {
  jest.useRealTimers();
});

describe("testing Message", () => {
  it("should to create a message with valid values", () => {
    const model = Model.create("codex", 500);
    const message = Message.create(
      "user",
      "Why the sky is blue?",
      model.value as Model
    );
    expect(message.isRight()).toBeTruthy();
    expect((message.value as Message).id).toBe(uuidV4Mock);
    expect((message.value as Message).model.name).toBe("codex");
    expect((message.value as Message).model.maxTokens).toBe(500);
    expect((message.value as Message).tokens).toBe(gpt3EncodecValueMock.length);
    expect((message.value as Message).createdAt).toEqual(dateMock);
  });

  it("should to create a message and return the token amount", () => {
    const model = Model.create("codex", 500);
    const instance = Message.create(
      "user",
      "Why the sky is blue?",
      model.value as Model
    );
    const message = instance.value as Message;
    expect(message.tokens).toBe(4);
  });

  it("should return error if user isn't valid", () => {
    const model = Model.create("codex", 500);
    const message = Message.create(
      "admin",
      "How be rich?",
      model.value as Model
    );
    expect(message.isLeft()).toBeTruthy();
  });

  it("should return error if content is blank", () => {
    const model = Model.create("codex", 500);
    const message = Message.create("user", "", model.value as Model);
    expect(message.isLeft()).toBeTruthy();
  });
});
