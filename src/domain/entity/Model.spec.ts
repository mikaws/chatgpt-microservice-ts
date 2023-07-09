import { Model } from "./Model";

describe("testing Model", () => {
  it("should return error when name is empty", () => {
    const model = Model.create("", 500);
    expect(model.value).toEqual(new Error("name is empty"));
  });
  it("should return error when maxTokens isn't type of number", () => {
    const model = Model.create("gpt", 0);
    expect(model.value).toEqual(new Error("maxTokens needs to be greater than 0"));
  });
  it("should to create a model instance", () => {
    const model = Model.create("gpt", 500);
    expect(model.value).toEqual({ name: "gpt", maxTokens: 500 });
  });
});
