import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { generalEnvironment } from "./environments/general.js";
import { runMigrations } from "./infrastructure/db/migrate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRoutes } from "./routes/index.js";

await runMigrations();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: generalEnvironment.corsOrigins,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.route("/api", apiRoutes);

app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Ruta no encontrada",
      },
    },
    404,
  );
});

app.onError((err, c) => errorHandler(err, c));

serve(
  {
    fetch: app.fetch,
    hostname: generalEnvironment.host,
    port: generalEnvironment.port,
  },
  (info) => {
    console.log(
      `API listening on http://${info.address}:${info.port}/api/health`,
    );
  },
);
