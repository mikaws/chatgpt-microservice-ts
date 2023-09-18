import { Request, Response } from "express";

export type Controller = { handler(req: Request, res: Response): Promise<void> };
