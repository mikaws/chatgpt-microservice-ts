import { Express, Router } from "express";
import ChatCompletionRouter from "./chat-completion-router";

export const router = {
  setup(app: Express) {
    const router = Router();
    app.use("/api", router);
    router.use(ChatCompletionRouter);
    return router;
  }  
}  
