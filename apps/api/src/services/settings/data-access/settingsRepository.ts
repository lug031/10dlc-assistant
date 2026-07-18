import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import { appSettings } from "../../../infrastructure/db/schema.js";
import {
  DEFAULT_APP_SETTINGS,
  type AppSettingsDto,
} from "../../../constants/enums.js";
import type { PatchSettingsDto } from "../http/schemas.js";

const SETTINGS_KEY = "app";

export const settingsRepository = {
  async get(): Promise<AppSettingsDto> {
    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTINGS_KEY))
      .limit(1);

    if (!row) return DEFAULT_APP_SETTINGS;
    return JSON.parse(row.valueJson) as AppSettingsDto;
  },

  async update(patch: PatchSettingsDto): Promise<AppSettingsDto> {
    const current = await settingsRepository.get();
    const next: AppSettingsDto = { ...current, ...patch };
    const now = new Date().toISOString();

    await db
      .insert(appSettings)
      .values({
        key: SETTINGS_KEY,
        valueJson: JSON.stringify(next),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          valueJson: JSON.stringify(next),
          updatedAt: now,
        },
      });

    return next;
  },
};
