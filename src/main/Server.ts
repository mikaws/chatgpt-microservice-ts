import { postgreSQLDatabase } from "../infra/db/postgresql/postgresql-database";
import { Application } from "./Application";
import env from "./config/environment";

export class Server {
  async start() {
    await postgreSQLDatabase
      .connect({
        user: env.DB_USER,
        host: env.DB_HOST,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
      })
      .then(async () => {
        const server = await Application.setup();
        server.listen(env.SERVER_PORT, () => {
          console.info("Server is running on port", env.SERVER_PORT);
        });
      })
      .catch(console.error);
  }
}
