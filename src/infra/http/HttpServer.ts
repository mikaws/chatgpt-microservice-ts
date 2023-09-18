import dotenv from "dotenv";
import express from "express";

export class HttpServer {
  static start() {
    const server = express();
    return server;
  }
}
