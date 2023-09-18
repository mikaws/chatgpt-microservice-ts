import { Request, Response } from "express";
import { Controller } from "../protocols/Controller";
import { ChatCompletionInputDTO } from "../../domain/usecase/ChatCompletionDTO";
import { ChatCompletionUseCase } from "../../domain/usecase/ChatCompletionUseCase";

export class ChatCompletionController implements Controller {
  constructor(private chatCompletionUseCase: ChatCompletionUseCase) {}

  public async handler(req: Request, res: Response) {
    try {
      const dto = req.body as ChatCompletionInputDTO;
      const result = await this.chatCompletionUseCase.execute(dto);
      res.status(200).json(result);
    } catch (error: unknown) {
      res.status(500).send((error as Error).message);
    }
  }
}
