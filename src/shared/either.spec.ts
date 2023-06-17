import { Left, Right } from "./either";

describe("testing either", () => {
  it("should validate if Left class is returning values correctly", () => {
    const value = null;
    const left = new Left(value);
    expect(left.isLeft()).toBeTruthy();
    expect(left.isRight()).toBeFalsy();
    expect(left.value).toBe(null);
  });

  it("should validate if Right class is returning values correctly", () => {
    const value = "have value";
    const right = new Right(value);
    expect(right.isLeft()).toBeFalsy();
    expect(right.isRight()).toBeTruthy();
    expect(right.value).toBe("have value");
  });
});
