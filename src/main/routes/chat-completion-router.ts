import express from "express";
import { adaptRoute } from "../adapter/express-route-adapter";
import { checkAllowedMethod } from "../config/middlewares/check-allowed-method";
import { makeChatCompletionController } from "../factories/chat-completion-controller-factory";

const chatCompletionRouter = express.Router();

chatCompletionRouter.route("/chat")
  .post(adaptRoute(makeChatCompletionController()))
  .all(checkAllowedMethod);

export default chatCompletionRouter;
