import { left } from "../../shared/either";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { Model } from "./Model";

const gpt3EncodecValueMock = [0, 1, 2, 3, 4, 5];

jest.mock("gpt-3-encoder", () => {
  return {
    encode: jest.fn().mockImplementation(() => gpt3EncodecValueMock),
  };
});

interface IChatOptions {
  temperature: number;
  topP: number;
  n: number;
  stop: Array<string>;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

const createChat = (userId: string, options: IChatOptions) => {
  const { maxTokens } = options;
  const model = Model.create("codex", maxTokens);
  const message = Message.create(
    "user",
    "Why the sky is blue?",
    model.value as Model
  );
  const chatConfig = {
    ...options,
    model: model.value as Model,
  };
  return Chat.create(userId, message.value as Message, chatConfig);
};

describe("testing Chat", () => {
  it("should to create a Chat and return values correctly", () => {
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;

    expect(chat.erasedMessages.length).toBe(0);
    expect(chat.status).toBe("active");
    expect(chat.tokenUsage).toBe(6);
  });

  it("should return the amount of messages when coutMessages method is called", () => {
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;

    expect(chat.coutMessages()).toBe(1);
  });

  it("should have status as ended when end method is called", () => {
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;
    chat.end();

    expect(chat.status).toBe("ended");
  });

  it("should remove messages from the chat when token usage was reached", () => {
    const maxTokens = 28;
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;

    for (let i = 1; i <= 4; i++) {
      const model = Model.create("codex", maxTokens);
      const message = Message.create(
        "user",
        `Mock message n°: ${i}`,
        model.value as Model
      );
      chat.addMessage(message.value as Message);
    }

    expect(chat.erasedMessages.length).toBe(1);
    expect(chat.tokenUsage).toBe(24);
  });

  it("should return error when adding message if chat is ended", () => {
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;

    const model = Model.create("codex", 500);
    const messageOrError = Message.create(
      "user",
      "How be a better person?",
      model.value as Model
    );

    expect(messageOrError.isRight()).toBeTruthy();
    const message = messageOrError.value as Message;

    chat.end();

    expect(chat.addMessage(message)).toEqual(
      left(new Error("chat is ended, no more messages allowed"))
    );
  });

  it("should return error if user id isn't valid", () => {
    const chat = createChat("", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(left(new Error("user id is empty")));
  });

  it("should return error if status is different than active or ended", () => {
    const chatOrError = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chatOrError.isRight()).toBeTruthy();
    const chat = chatOrError.value as Chat;
    jest.spyOn(chat, "status", "get").mockReturnValue("other status");

    expect(Chat.validate(chat)).toEqual(left(new Error("invalid status")));
  });

  it("should return error if temperature is great than 1", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 1.25,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("temperature should be between 0 and 1"))
    );
  });

  it("should return error if temperature is less than 0", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: -0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("temperature should be between 0 and 1"))
    );
  });

  it("should return error if top probability is less than 0", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: -1,
    });
    expect(chat).toEqual(left(new Error("topP should be between 0 and 1")));
  });

  it("should return error if top probability is great than 1", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 1.25,
    });
    expect(chat).toEqual(left(new Error("topP should be between 0 and 1")));
  });

  it("should return error if number of completions is equal than 0", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 0,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(left(new Error("n should be a positive integer")));
  });

  it("should return error if max number of tokens is equal than 0", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 0,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("maxTokens should be a positive integer"))
    );
  });

  it("should return error if presencePenalty is great than 2", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.0,
      maxTokens: 500,
      n: 10,
      presencePenalty: 2.1,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("presencePenalty should be between -2 and 2"))
    );
  });

  it("should return error if presencePenalty is less than -2", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.05,
      maxTokens: 500,
      n: 10,
      presencePenalty: -2.05,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("presencePenalty should be between -2 and 2"))
    );
  });

  it("should return error if frequencyPenalty is great than 2", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: 2.1,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("frequencyPenalty should be between -2 and 2"))
    );
  });

  it("should return error if frequencyPenalty is less than -2", () => {
    const chat = createChat("uuid", {
      frequencyPenalty: -2.05,
      maxTokens: 500,
      n: 10,
      presencePenalty: 1.5,
      stop: [],
      temperature: 0.75,
      topP: 0.8,
    });
    expect(chat).toEqual(
      left(new Error("frequencyPenalty should be between -2 and 2"))
    );
  });
});
