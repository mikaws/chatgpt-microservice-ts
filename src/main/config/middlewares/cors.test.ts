import { Application } from "../../Application";
import type { Express } from "express";
import request from "supertest";

let app: Express;

describe("cors", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  it("should enable cors", async () => {
    app.get("/test-cors", (req, res) => {});
    await request(app)
      .get('/test_cors')
      .expect('access-control-allow-origin', '*')
      .expect('access-control-allow-methods', '*')
      .expect('access-control-allow-headers', '*')
  });
});
