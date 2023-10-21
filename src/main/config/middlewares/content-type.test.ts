import { Application } from "../../Application";
import type { Express } from "express";
import request from "supertest";
import { contentType } from "./content-type";

let app: Express;

describe("content type", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  afterAll(() => {});
  it("should return invalid json if body is text but content type is json", async () => {
    app.post("/invalid-json", (req, res) => {});
    await request(app)
      .post("/invalid-json")
      .set("Content-Type", "application/json")
      .send("invalid json")
      .expect(400)
      .expect({ error: "Invalid JSON" });
  });
  it("should pass to the next middleware if JSON is valid", async () => {
    const validJson = { key: "value" };
    const next = jest.fn(),
      err = Error("any");
    app.post("/valid-json", (req, res) => {
      contentType(err, req, res, next);
      res.send(req.body);
    });
    await request(app)
      .post("/valid-json")
      .set("Content-Type", "application/json")
      .send(validJson)
      .expect(200)
      .expect(validJson);
    expect(next).toHaveBeenCalled();
  });
});
