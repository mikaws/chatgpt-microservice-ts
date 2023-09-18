import { Request, Response } from "express";
import { Controller } from "../../presentation/protocols/Controller";

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    controller.handler(req, res);
  };
};
