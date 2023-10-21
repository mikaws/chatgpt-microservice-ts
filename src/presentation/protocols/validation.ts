import { Either } from "../../shared/either";

export interface Validator<T> {
  validate(
    body: T
  ): Either<Error, T>;
}
