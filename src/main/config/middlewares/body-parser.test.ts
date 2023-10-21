import { Application } from "../../Application";
import type { Express } from "express";
import request from "supertest";

let app: Express;

describe("body parser", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  it("should parse JSON", async () => {
    app.get("/test-body-parser", function (req, res) {
      res.status(200).json({ name: "john" });
    });
    await request(app)
      .get("/test-body-parser")
      .expect("Content-Type", /json/)
  });
});
