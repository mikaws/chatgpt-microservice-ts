import { Controller } from "../protocols/controller";
import { ChatCompletionInputDTO } from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";
import { HttpRequest, HttpResponse } from "../protocols/http";

export class ChatCompletionController implements Controller {
  constructor(private chatCompletionUseCase: ChatCompletionUseCase) {}

  public async handler(req: HttpRequest): Promise<HttpResponse> {
    try {
      const dto = req.body as ChatCompletionInputDTO;
      const resultOrError = await this.chatCompletionUseCase.execute(dto);
      if(resultOrError.isLeft()) {
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
