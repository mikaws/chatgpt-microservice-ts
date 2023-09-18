import { HttpServer } from "../infra/http/HttpServer";
import { HttpRouter } from "../infra/http/HttpRouter";
import { MiddlewareConfigurator } from "./config/MiddlewareConfigurator";
import { openAIClient } from "../infra/openai/open-ai-client";

export class Application {
  static async setup() {
    const app = HttpServer.start();
    HttpRouter.setup(app);
    MiddlewareConfigurator.setup(app);
    openAIClient.setup(process.env.OPEN_AI_API_KEY ?? "");
    return app;
  }
}
