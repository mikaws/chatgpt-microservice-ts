import { Express, Router } from "express";
import ChatCompletionRoutes from "../routes/chat-completion-routes";

export const router = {
  setup(app: Express) {
    const router = Router();
    app.use("/api", router);
    router.use(ChatCompletionRoutes);
    return router;
  }  
}  
