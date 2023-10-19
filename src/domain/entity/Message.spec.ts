import { left, right } from "../../shared/either";
import { Message } from "./Message";
import { Model } from "./Model";
import uuid from 'uuid'

const dateMock = new Date(2023, 4, 29);
const uuidV4Mock = "b918de9c-4cef-496c-9c31-f4ba8323ce7d";
const gpt3EncodecValueMock = [0, 1, 2, 3];

jest.mock("uuid", () => {
  return {
    ...jest.requireActual('uuid'),
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
  jest.resetAllMocks();
  jest.useRealTimers();
});

describe("testing Message", () => {
  it("should return left if uuid is empty", () => {
    const model = Model.create("codex", 500);
    const message = Message.create("user", "test", model.value as Model, '');
    expect(message.isLeft()).toBeTruthy();
    expect(message).toEqual(left(new Error('id is empty')))
  });

  it("should return left if uuid is invalid", () => {
    const model = Model.create("codex", 500);
    const message = Message.create("user", "test", model.value as Model, 'uuid');
    expect(message.isLeft()).toBeTruthy();
    expect(message).toEqual(left(new Error('id needs to be a valid uuid')))
  });

  it("should return left if role is invalid", () => {
    const model = Model.create("codex", 500);
    const message = Message.create("chat", "test", model.value as Model);
    expect(message.isLeft()).toBeTruthy();
    expect(message).toEqual(
      left(new Error("role needs to be 'system', 'user' or 'assistant'"))
    );
  });

  it("should return left if content is blank", () => {
    const model = Model.create("codex", 500);
    const message = Message.create("user", "", model.value as Model);
    expect(message.isLeft()).toBeTruthy();
    expect(message).toEqual(left(new Error("content is empty")));
  });

  it("should return right with message created", () => {
    const model = Model.create("gpt-3.5", 500);
    const message = Message.create(
      "user",
      "Why the sky is blue?",
      model.value as Model,
      uuidV4Mock,
      dateMock
    );
    expect(message.isRight()).toBeTruthy();
    expect(message.value as Message).toEqual({
      id: uuidV4Mock,
      content: "Why the sky is blue?",
      model: "gpt-3.5",
      role: "user",
      tokens: gpt3EncodecValueMock.length,
      createdAt: dateMock,
    });
    expect(message.value).toBeInstanceOf(Message)
  });
});
