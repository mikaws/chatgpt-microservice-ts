import { Application } from "../Application";
import type { Express } from "express";
import request from "supertest";
import {v4 as uuidv4} from "uuid";

let app: Express;
let chatId: string;
let userId: string;

describe("chat completion routes", () => {
  beforeAll(async () => {
    app = await Application.setup();
  });
  beforeEach(() => {
    chatId = uuidv4();
    userId = uuidv4();
  })
  it("should return 400", async () => {
    await request(app)
      .post("/api/chat-completion")
      .send({
        chatId,
        userId,
      })
      .expect(400)
      .expect(`"Error: missing field 'userMessage' in body"`);
  });
});
