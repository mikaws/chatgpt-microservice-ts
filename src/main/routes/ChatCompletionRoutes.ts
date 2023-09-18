import express from "express";
import { adaptRoute } from "../adapter/express-route-adapter";
import { checkAllowedMethod } from "../config/middlewares/check-allowed-method";
import { makeChatCompletionController } from "../factories/ChatCompletionControllerFactory";

const ChatCompletionRouter = express.Router();

ChatCompletionRouter.route("/chat")
  .post(adaptRoute(makeChatCompletionController()))
  .all(checkAllowedMethod);

export default ChatCompletionRouter;
