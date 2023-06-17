type TModel = {
  name: string;
  maxTokens: number;
};

export class Model implements TModel {
  readonly name: string;
  readonly maxTokens: number;

  constructor(name: string, maxTokens: number) {
    this.name = name;
    this.maxTokens = maxTokens;
    Object.freeze(this);
  }

  static create(name: string, maxTokens: number): Model {
    return new Model(name, maxTokens);
  }
}
