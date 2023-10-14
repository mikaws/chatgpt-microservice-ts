import { Either, left, right } from "../../shared/either";

export class Model {
  readonly name: string;
  readonly maxTokens: number;

  constructor(name: string, maxTokens: number) {
    this.name = name;
    this.maxTokens = maxTokens;
    Object.freeze(this);
  }

  static create(name: string, maxTokens: number): Either<Error, Model> {
    const model = new Model(name, maxTokens);
    const modelOrError = model.validate();
    if (modelOrError.isLeft()) {
      return left(modelOrError.value);
    }
    return right(modelOrError.value);
  }

  private validate(): Either<Error, Model> {
    if (this.name === "") {
      return left(new Error("name is empty"));
    }
    if (this.maxTokens <= 0) {
      return left(new Error("maxTokens needs to be greater than 0"));
    }
    return right(this);
  }
}
