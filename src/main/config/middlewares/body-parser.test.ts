import { Application } from "../../Application";
import type { Express } from "express";
import request from "supertest";

let app: Express;

describe("body parser", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  it("should parse JSON", async () => {
    app.get("/", function (req, res) {
      res.status(200).json({ name: "john" });
    });
    await request(app)
      .get("/")
      .expect("Content-Type", /json/)
  });
});
