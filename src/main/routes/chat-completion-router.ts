import express from "express";
import { adaptRoute } from "../adapter/express-route-adapter";
import { makeChatCompletionController } from "../factories/chat-completion-controller-factory";

const chatCompletionRouter = express.Router();

chatCompletionRouter.route("/chat-completion")
  .post(adaptRoute(makeChatCompletionController()))

export default chatCompletionRouter;
