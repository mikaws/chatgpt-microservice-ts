import { UnsanitizedEnvironment } from "../../shared/environment";
import { sanitizeEnv } from "./environment";

describe("environment", () => {
  beforeAll(() => {
    jest.resetModules();
    process.env = {
      NODE_ENV: "test",
    };
  });
  it("should throw error if .env is missing a key/value sanitized", () => {
    try {
      const env = { IMPORTANT_KEY: '' } as UnsanitizedEnvironment;
      sanitizeEnv(env);
    } catch (err) {
        expect(err).toEqual(new Error(`key IMPORTANT_KEY not found or undefined in .env file`))
    }
  });
});
