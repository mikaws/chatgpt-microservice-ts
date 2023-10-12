import { Database } from "./models/Database";

export async function createDatabaseConnection(database: Database<any>) {
  await database.connect({
    user: process.env.user || "root",
    host: process.env.host || "http://localhost",
    database: process.env.database || "adm",
    password: process.env.password || "sysdba",
    port: parseInt(process.env.port ?? "", 10) || 5432,
  });
}
