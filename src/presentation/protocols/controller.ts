import { HttpRequest, HttpResponse } from "./http";

export type Controller = {
  handler(httpRequest: HttpRequest): Promise<HttpResponse>;
};
