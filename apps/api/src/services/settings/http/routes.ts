import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { getSettings, updateSettings } from "../domain/settingsService.js";
import { patchSettingsSchema } from "./schemas.js";

export const settingsRoutes = new Hono();

settingsRoutes.get("/", async (c) => {
  const settings = await getSettings();
  return c.json(settings);
});

settingsRoutes.patch("/", jsonValidator(patchSettingsSchema), async (c) => {
  const body = c.req.valid("json");
  const settings = await updateSettings(body);
  return c.json(settings);
});
