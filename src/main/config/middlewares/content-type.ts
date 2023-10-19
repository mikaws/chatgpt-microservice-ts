import { NextFunction, Request, Response } from "express";

export const contentType = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    res.status(400).json({ error: "Invalid JSON" });
  } else {
    next();
  }
};
