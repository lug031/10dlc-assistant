import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { OperationalOutcome } from "@/types/privacy";
import type { LeadwireCtaTemplateKey } from "@/types/privacyOutcome";
import type { BrandSnapshot } from "@/types/campaign";
import {
  composeSubmissionCtaMessageFlow,
  type CtaEditableParts,
} from "@/utils/ctaMessageFlow";
import { buildHardToFindPrivacyAccessGuide } from "@/utils/hardToFindPrivacyGuide";

const highlightedFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff8e1",
  },
  "& .MuiInputLabel-root": {
    fontWeight: 600,
  },
};

interface CtaMessageFlowEditorProps {
  brandSnapshot: BrandSnapshot;
  templateKey: LeadwireCtaTemplateKey;
  parts: CtaEditableParts;
  operationalOutcome?: OperationalOutcome | null;
  disabled?: boolean;
  onChange: (next: { parts: CtaEditableParts; composed: string }) => void;
}

function compose(
  templateKey: LeadwireCtaTemplateKey,
  brandSnapshot: BrandSnapshot,
  parts: CtaEditableParts,
  operationalOutcome: OperationalOutcome | null | undefined,
) {
  return composeSubmissionCtaMessageFlow(templateKey, brandSnapshot, parts, {
    operationalOutcome,
  });
}

export function CtaMessageFlowEditor({
  brandSnapshot,
  templateKey,
  parts,
  operationalOutcome,
  disabled = false,
  onChange,
}: CtaMessageFlowEditorProps) {
  const emit = (nextParts: CtaEditableParts) => {
    onChange({
      parts: nextParts,
      composed: compose(
        templateKey,
        brandSnapshot,
        nextParts,
        operationalOutcome,
      ),
    });
  };

  const updatePart = (patch: Partial<CtaEditableParts>) => {
    const nextParts = { ...parts, ...patch };

    if (
      patch.optInKeyword !== undefined &&
      operationalOutcome === "HARD_TO_FIND"
    ) {
      nextParts.hardToFindPrivacyGuide = buildHardToFindPrivacyAccessGuide(
        brandSnapshot,
        patch.optInKeyword,
      );
    }

    emit(nextParts);
  };

  const isSpanishTemplate = templateKey === "LW_CTA_SAMPLE_FLOW_4";
  const isHardToFind = operationalOutcome === "HARD_TO_FIND";

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="subtitle2">Call-to-Action / Message Flow</Typography>

      <TextField
        required
        label="Lead Magnet URL"
        value={parts.leadMagnetUrl}
        onChange={(e) => updatePart({ leadMagnetUrl: e.target.value })}
        disabled={disabled}
        placeholder="https://ldwr.app/ttj/..."
        helperText="URL del formulario de suscripción (Leadwire)"
        fullWidth
        sx={highlightedFieldSx}
      />

      {isSpanishTemplate && (
        <TextField
          label="Extracto de política de privacidad"
          value={parts.privacyPolicyExcerpt}
          onChange={(e) => updatePart({ privacyPolicyExcerpt: e.target.value })}
          disabled={disabled}
          multiline
          minRows={10}
          maxRows={40}
          helperText="Texto sobre lo que declara la política de privacidad de esta marca"
          fullWidth
          sx={highlightedFieldSx}
        />
      )}

      <TextField
        label="Opt-in keyword"
        value={parts.optInKeyword}
        onChange={(e) => updatePart({ optInKeyword: e.target.value })}
        disabled={disabled}
        placeholder="ECONO"
        helperText="Palabra clave de opt-in (p. ej. ECONO, SALVADOR)"
        fullWidth
        sx={highlightedFieldSx}
      />

      {isHardToFind && (
        <TextField
          label="CASO 2 — Guía de acceso a la política"
          value={parts.hardToFindPrivacyGuide}
          onChange={(e) => updatePart({ hardToFindPrivacyGuide: e.target.value })}
          disabled={disabled}
          multiline
          minRows={10}
          helperText="Se incluye al final del Call-to-Action / Message Flow en TCR"
          fullWidth
          sx={highlightedFieldSx}
        />
      )}
    </Box>
  );
}
