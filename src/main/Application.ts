import express, { Router } from "express";
import { router } from "./routes/router";
import { middlewareConfig } from "./config/middleware-config";
import openAIClient from "../infra/openai/open-ai-client";

export class Application {
  static async setup() {
    const app = express();
    router.setup(app);
    middlewareConfig.setup(app);
    openAIClient.setup(process.env.OPEN_AI_API_KEY ?? "");
    return app;
  }
}
