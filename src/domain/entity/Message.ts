import * as uuid from "uuid";
import { Model } from "./Model";
import { encode } from "gpt-3-encoder";
import { Either, left, right } from "../../shared/either";

export type TMessage = {
  id: string;
  role: "user" | "system" | "assistant";
  content: string;
  model: Model;
  tokens: number;
  createdAt: Date;
};

export class Message {
  readonly id: string;
  readonly role: "user" | "system" | "assistant";
  readonly content: string;
  readonly model: Model;
  readonly tokens: number;
  readonly createdAt: Date;

  constructor({
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
    role: "user" | "system" | "assistant",
    content: string,
    model: Model
  ): Either<Error, Message> {
    const totalTokens = encode(content).length;
    const msg = new Message({
      id: uuid.v4(),
      role,
      content,
      model,
      tokens: totalTokens,
      createdAt: new Date(),
    });
    const msgOrError = msg.validate(msg);
    if (msgOrError.isLeft()) {
      return left(msgOrError.value);
    }
    return right(msg);
  }

  private validate(m: Message): Either<Error, Message> {
    if (m.content === "") {
      return left(new Error("content is empty"));
    }
    return right(m);
  }
}
