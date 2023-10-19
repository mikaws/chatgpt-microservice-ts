import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

export const checkAllowedMethod = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stack = router.stack.find((stack) => stack.path === req.path);
  if (!stack) {
    res.status(404).send("Not Found");
    return;
  }
  const methods = Object.keys(stack.route.methods)
    .filter((method) => method !== "_all")
    .map((method) => method.toUpperCase());
  if (!methods.includes(req.method)) {
    res.setHeader("Allow", methods.join(", "));
    res.status(405).send("Method Not Allowed");
  } else {
    next();
  }
};
