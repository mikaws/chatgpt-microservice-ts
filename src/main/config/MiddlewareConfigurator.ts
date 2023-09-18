import { Express, NextFunction, Request, Response, json } from "express";
import { bodyParser } from "./middlewares/body-parser";
import { contentType } from "./middlewares/content-type";
import { cors } from "./middlewares/cors";

export class MiddlewareConfigurator {
  static setup(app: Express) {
    app.use(bodyParser);
    app.use(cors);
    app.use(contentType);
  }
}
