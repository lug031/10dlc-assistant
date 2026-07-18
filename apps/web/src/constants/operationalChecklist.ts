import type { OperationalOutcome } from "@/types/privacy";

export const HARD_TO_FIND_CHECKLIST = [
  "Confirmar leadmagnet.png y qrcode.png en Sample Multimedia.",
  "Confirmar screenshots first-step, second-step y last-step en Sample Multimedia.",
] as const;

export const ACCESSIBLE_CHECKLIST = [
  "Confirmar leadmagnet.png y qrcode.png en Sample Multimedia.",
] as const;

export function getOperationalChecklistItems(
  outcome: OperationalOutcome | null | undefined,
): readonly string[] {
  if (!outcome || outcome === "NO_POLICY") {
    return [];
  }

  if (outcome === "HARD_TO_FIND") {
    return HARD_TO_FIND_CHECKLIST;
  }

  return ACCESSIBLE_CHECKLIST;
}
