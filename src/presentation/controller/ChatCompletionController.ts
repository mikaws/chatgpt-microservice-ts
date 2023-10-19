import { Controller } from "../protocols/controller";
import {
  ChatCompletionConfigInputDTO,
  ChatCompletionInputDTO,
} from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { HttpRequest, HttpResponse } from "../protocols/http";

export class ChatCompletionController implements Controller {
  constructor(
    private chatCompletionUseCase: ChatCompletionUseCase,
    private chatConfig: ChatCompletionConfigInputDTO
  ) {}

  public async handler(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { chatId, userId, userMessage } = req.body;
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
      return { statusCode: 200, body: resultOrError.value };
    } catch (error: unknown) {
      console.error(error);
      return { statusCode: 500, body: (error as Error).message };
    }
  }
}
