import { Controller } from "../protocols/controller";
import {
  ChatCompletionConfigInputDTO,
  ChatCompletionInputDTO,
} from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { HttpResponse } from "../protocols/http";
import { Validator } from "../protocols/validation";
import { ChatCompletionBody } from "../protocols/body";
import { badRequest, ok, serverError } from "../helpers/http-helper";

export namespace ChatCompletionController {
  export type Request = {
    body: ChatCompletionBody;
  };
}

export class ChatCompletionController implements Controller {
  constructor(
    private validation: Validator<ChatCompletionBody>,
    private chatCompletionUseCase: ChatCompletionUseCase,
    private chatConfig: ChatCompletionConfigInputDTO
  ) {}

  public async handler(
    req: ChatCompletionController.Request
  ): Promise<HttpResponse> {
    try {
      const bodyOrError = this.validation.validate(req.body);
      if (bodyOrError.isLeft()) {
        const error = bodyOrError.value;
        return badRequest(error);
      }
      const body = bodyOrError;
      const { chatId, userId, userMessage } = body.value;
      const dto: ChatCompletionInputDTO = {
        chatId,
        config: this.chatConfig,
        userId,
        userMessage,
      };
      const resultOrError = await this.chatCompletionUseCase.execute(dto);
      if (resultOrError.isLeft()) {
        const error = resultOrError.value;
        throw error;
      }
      const result = resultOrError.value;
      return ok(result);
    } catch (error: unknown) {
      console.error(error);
      return serverError(error as Error);
    }
  }
}
