import { postgreSQLDatabase } from "../infra/db/postgresql/postgresql-database";
import dotenv from "dotenv";
import { Application } from "./Application";

export class Server {
  private SERVER_PORT = 3000;

  constructor() {
    dotenv.config();
    this.SERVER_PORT = process.env.SERVER_PORT || this.SERVER_PORT;
  }

  async initialize() {
    await postgreSQLDatabase
      .connect({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      })
      .then(async () => {
        const server = await Application.setup();
        server.listen(this.SERVER_PORT, () => {
          console.info("Server is running on port", this.SERVER_PORT);
        });
      })
      .catch((err) => console.error(err));
  }
}
