import { Database } from "./models/Database";

export async function createDatabaseConnection(database: Database<any>) {
  await database.connect({
    user: process.env.use || "your_username",
    host: process.env.host || "your_host",
    database: process.env.database || "your_database",
    password: process.env.password || "your_password",
    port: parseInt(process.env.port ?? "", 10) || 5432,
  });
}
