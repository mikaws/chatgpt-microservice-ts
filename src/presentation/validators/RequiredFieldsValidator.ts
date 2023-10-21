import { Either, left, right } from "../../shared/either";
import { Validator } from "../protocols/validation";

export class RequiredFieldValidator<T> implements Validator<T> {
  constructor(private readonly fieldNames: string[]) {}
  validate(body: T): Either<Error, T> {
    for (const field of this.fieldNames) {
      if ((body as any)[field] === undefined) {
        return left(new Error(`missing field '${field}' in body`));
      }
    }
    return right(body);
  }
}
