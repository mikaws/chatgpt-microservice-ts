import { Express, Router } from "express";
import ChatCompletionRouter from "../../main/routes/ChatCompletionRoutes";

export class HttpRouter {
  static setup(app: Express) {
    const router = Router();
    app.use("/api", router);
    router.use("/chat", ChatCompletionRouter);
    return router;
  }
}
