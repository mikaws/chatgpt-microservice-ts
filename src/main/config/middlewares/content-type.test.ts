import { Application } from "../../Application";
import type { Express } from "express";
import request from "supertest";

let app: Express;

describe("content type", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  it("should return content type as text/html if forced", async () => {
    app.get("/test-text-html", (req, res) => {
      res.type("text/html; charset=utf-8");
      res.send("");
    });
    await request(app)
      .get("/test-text-html")
      .expect("content-type", /text\/html; charset=utf-8/);
  });
  it("should return default content type as json", async () => {
    app.get("/test-json", (req, res) => {
      res.send({ data: "ok" });
    });
    await request(app).get("/test-json").expect("content-type", /json/);
  });
});
