import express from "express";
import { router } from "./config/route-config";
import { middlewareConfig } from "./config/middleware-config";
import openAIClient from "../infra/openai/open-ai-client";
import env from "./config/environment";

export class Application {
  static async setup() {
    const app = express();
    middlewareConfig.setup(app);
    router.setup(app);
    openAIClient.setup(env.OPENAI_API_KEY);
    return app;
  }
}
