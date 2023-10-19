import { Request, Response } from "express";
import { Controller } from "../../presentation/protocols/controller";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const data = await controller.handler(req);
    res.status(data.statusCode).json(data.body);
  };
};
