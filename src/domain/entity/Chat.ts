import { Message } from "./Message";
import { Model } from "./Model";
import * as uuid from "uuid";
import { Either, left, right } from "../../shared/either";

export type TChatConfig = {
  model: Model;
  temperature: number; // 0.0 to 1.0 randomness degree
  topP: number; // 0.0 to 1.0 conservative degree
  n: number; // number of messages to generate
  stop: Array<string>; // list of tokens to stop on
  maxTokens: number; // number of tokens to generate
  presencePenalty: number; // -2.0 to 2.0
  frequencyPenalty: number; // -2.0 to 2.0
};

export type TChat = {
  id: string;
  userId: string;
  initialSystemMessage: Message;
  messages: Array<Message>;
  erasedMessages: Array<Message>;
  status: string;
  tokenUsage: number;
  config: TChatConfig;
};

export class Chat {
  readonly id: string;
  readonly userId: string;
  readonly initialSystemMessage: Message;
  readonly config: TChatConfig;
  readonly messages: Array<Message>;
  private _erasedMessages: Array<Message>;
  private _tokenUsage: number;
  private _status: string;

  get erasedMessages(): Array<Message> {
    return this._erasedMessages;
  }
  get status(): string {
    return this._status;
  }
  get tokenUsage(): number {
    return this._tokenUsage;
  }

  private constructor({
    id,
    userId,
    initialSystemMessage,
    messages,
    erasedMessages,
    status,
    tokenUsage,
    config,
  }: TChat) {
    this.id = id;
    this.userId = userId;
    this.initialSystemMessage = initialSystemMessage;
    this.config = config;
    this.messages = messages;
    this._status = status;
    this._erasedMessages = erasedMessages;
    this._tokenUsage = tokenUsage;
  }

  public static create(
    userId: string,
    initialSystemMessage: Message,
    chatConfig: TChatConfig,
    id?: string
  ): Either<Error, Chat> {
    const chat = new Chat({
      id: id ?? uuid.v4(),
      userId,
      initialSystemMessage,
      messages: [],
      erasedMessages: [],
      config: chatConfig,
      status: "active",
      tokenUsage: 0,
    });
    const chatOrError = this.validate(chat);
    if (chatOrError.isLeft()) {
      return left(chatOrError.value);
    }
    return right(chat);
  }

  static validate(chat: Chat): Either<Error, Chat> {
    const { config, userId, status } = chat;
    if (chat.id === "") {
      return left(new Error("id is empty"));
    }
    if (!uuid.validate(chat.id)) {
      return left(new Error("id needs to be a valid uuid"));
    }
    if (userId === "") {
      return left(new Error("user id is empty"));
    }
    if (status != "active" && status != "ended") {
      return left(new Error("invalid status"));
    }
    if (config.temperature < 0 || config.temperature > 1) {
      return left(new Error("temperature should be between 0 and 1"));
    }
    if (config.topP < 0 || config.topP > 1) {
      return left(new Error("topP should be between 0 and 1"));
    }
    if (config.n <= 0) {
      return left(new Error("n should be a positive integer"));
    }
    if (config.maxTokens <= 0) {
      return left(new Error("maxTokens should be a positive integer"));
    }
    if (config.presencePenalty < -2 || config.presencePenalty > 2) {
      return left(new Error("presencePenalty should be between -2 and 2"));
    }
    if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
      return left(new Error("frequencyPenalty should be between -2 and 2"));
    }
    if (chat.initialSystemMessage.role !== "system") {
      return left(
        new Error("initial system message needs to have the role 'system'")
      );
    }
    return right(chat);
  }

  public addMessage(m: Message): Either<Error, Message> {
    if (this._status === "ended") {
      return left(new Error("chat is ended, no more messages allowed"));
    }
    this.messages.push(m);
    this._tokenUsage += m.tokens;
    while (this._tokenUsage > this.config.model.maxTokens) {
      const oldestMessage = this.messages.shift();
      if (oldestMessage) {
        this.erasedMessages.push(oldestMessage);
        this._tokenUsage -= oldestMessage.tokens;
      }
    }
    return right(m);
  }

  public addErasedMessage(m: Message): Either<Error, Message> {
    this.erasedMessages.push(m);
    return right(m);
  }

  public end(): void {
    this._status = "ended";
  }

  public countMessages(): number {
    return this.messages.length;
  }
}
