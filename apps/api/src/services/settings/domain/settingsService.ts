import { settingsRepository } from "../data-access/settingsRepository.js";
import type { PatchSettingsDto } from "../http/schemas.js";

export async function getSettings() {
  return settingsRepository.get();
}

export async function updateSettings(patch: PatchSettingsDto) {
  return settingsRepository.update(patch);
}
