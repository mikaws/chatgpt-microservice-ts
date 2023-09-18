import { postgreSQLDatabase } from "../infra/db/postgresql/postgresql-database";
import { createDatabaseConnection } from "../infra/db/db-connection";
import dotenv from "dotenv";
import { Application } from "./Application";

export class Server {
  private SERVER_PORT = 3000;

  constructor() {
    dotenv.config();
    this.SERVER_PORT =
      parseInt(process.env.SERVER_PORT ?? "", 10) || this.SERVER_PORT;
  }

  async initialize() {
    await createDatabaseConnection(postgreSQLDatabase)
      .then(async () => {
        const server = await Application.setup();
        server.listen(this.SERVER_PORT, () => {
          console.info("Server is running on port", this.SERVER_PORT);
        });
      })
      .catch((err) => console.error(err));
  }
}
