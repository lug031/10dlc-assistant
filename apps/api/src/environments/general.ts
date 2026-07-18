import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, "../..");
const monorepoRoot = path.resolve(apiRoot, "../..");

dotenv.config({ path: path.join(monorepoRoot, ".env") });

const nodeEnv = process.env.NODE_ENV ?? "development";

const defaultCorsOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
];

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : defaultCorsOrigins;

export const generalEnvironment = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? (nodeEnv === "production" ? "0.0.0.0" : "127.0.0.1"),
  nodeEnv,
  version: "0.1.0",
  corsOrigins,
};

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const filePath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(apiRoot, "data/10dlc.db");

  return `file:${filePath}`;
}

export const databaseEnvironment = {
  // Local: file:/ruta/10dlc.db · Producción (Turso): libsql://<db>.turso.io
  databaseUrl: resolveDatabaseUrl(),
  // Solo requerido para Turso (libsql://). En local con file: no aplica.
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,
};
