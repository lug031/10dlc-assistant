/** Validación visual alineada a LW_SAMPLE_MESSAGE_FORMAT — solo warnings, no bloquea READY. */

const SAMPLE_FORMAT_PATTERN = /Reply STOP to opt-out/i;

export function getSampleMessageFormatWarning(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) {
    return null;
  }

  if (!SAMPLE_FORMAT_PATTERN.test(trimmed)) {
    return "El formato esperado incluye «Reply STOP to opt-out» al final del mensaje.";
  }

  if (!trimmed.includes(":")) {
    return "El formato esperado incluye el nombre de marca seguido de dos puntos antes del mensaje.";
  }

  return null;
}

export function collectSampleMessageFormatWarnings(
  messages: string[],
): string[] {
  const warnings: string[] = [];

  messages.forEach((message, index) => {
    const warning = getSampleMessageFormatWarning(message);
    if (warning) {
      warnings.push(`Muestra ${index + 1}: ${warning}`);
    }
  });

  return warnings;
}
