import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { databaseEnvironment } from "../../environments/general.js";
import * as schema from "./schema.js";

const { databaseUrl, databaseAuthToken } = databaseEnvironment;

// Para bases locales basadas en archivo (file:), asegurar el directorio.
if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.slice("file:".length);
  const dir = path.dirname(filePath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const client: Client = createClient({
  url: databaseUrl,
  ...(databaseAuthToken ? { authToken: databaseAuthToken } : {}),
});

export const db = drizzle(client, { schema });
