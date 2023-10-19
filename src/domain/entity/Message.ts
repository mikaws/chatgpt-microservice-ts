import * as uuid from "uuid";
import { Model } from "./Model";
import { encode } from "gpt-3-encoder";
import { Either, left, right } from "../../shared/either";

export type TMessage = {
  id: string;
  role: string;
  content: string;
  model: string;
  tokens: number;
  createdAt: Date;
};

export class Message {
  readonly id: string;
  readonly role: string;
  readonly content: string;
  readonly model: string;
  readonly tokens: number;
  readonly createdAt: Date;

  private constructor({
    id,
    role,
    content,
    model,
    tokens,
    createdAt,
  }: TMessage) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.model = model;
    this.tokens = tokens;
    this.createdAt = createdAt;
    Object.freeze(this);
  }

  public static create(
    role: string,
    content: string,
    model: Model,
    id?: string,
    createdAt?: Date
  ): Either<Error, Message> {
    const totalTokens = content ? encode(content).length : 0;
    const msg = new Message({
      id: id ?? uuid.v4(),
      role,
      content,
      model: model.name,
      tokens: totalTokens,
      createdAt: createdAt ?? new Date(),
    });
    const msgOrError = msg.validate(msg);
    if (msgOrError.isLeft()) {
      return left(msgOrError.value);
    }
    return right(msg);
  }

  private validate(m: Message): Either<Error, Message> {
    if (m.id === "") {
      return left(new Error("id is empty"));
    }
    if (!uuid.validate(m.id)) {
      return left(new Error("id needs to be a valid uuid"));
    }
    if (m.content === "") {
      return left(new Error("content is empty"));
    }
    if (m.role !== "system" && m.role !== "user" && m.role !== "assistant") {
      return left(
        new Error("role needs to be 'system', 'user' or 'assistant'")
      );
    }
    return right(m);
  }
}
