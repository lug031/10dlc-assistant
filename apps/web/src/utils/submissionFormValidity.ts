import type { CampaignGateResult } from "@/types/campaignGate";
import type { OperationalOutcome } from "@/types/privacy";
import type { SampleMultimediaConfirmation } from "@/types/sampleMultimedia";
import {
  buildSampleMultimediaFilenames,
  isSampleMultimediaComplete,
} from "@/utils/sampleMultimedia";
import { SAMPLE_MESSAGE_COUNT } from "@/utils/sampleMessageDefaults";

const STOP_PATTERN = /\bSTOP\b/i;

export interface SubmissionFormValidityInput {
  campaignDescription: string;
  ctaMessageFlow: string;
  leadMagnetUrl: string;
  optInDescription: string;
  optOutDescription: string;
  helpResponse: string;
  sampleMessages: string[];
  sampleMultimediaConfirmation: SampleMultimediaConfirmation | null;
  optInKeyword: string;
  gate: CampaignGateResult | null;
  operationalOutcome: OperationalOutcome | null;
  defaultOptOutKeyword?: string;
}

export function isSubmissionFormComplete(input: SubmissionFormValidityInput): boolean {
  const {
    campaignDescription,
    ctaMessageFlow,
    leadMagnetUrl,
    optInDescription,
    optOutDescription,
    helpResponse,
    sampleMessages,
    sampleMultimediaConfirmation,
    optInKeyword,
    gate,
    operationalOutcome,
    defaultOptOutKeyword = "STOP",
  } = input;

  if (!gate?.allowed || gate.ambiguousLanguage) {
    return false;
  }

  if (campaignDescription.trim().length < 40) {
    return false;
  }

  if ((ctaMessageFlow?.trim().length ?? 0) < 20) {
    return false;
  }

  if (!leadMagnetUrl.trim()) {
    return false;
  }

  if (!optInDescription.trim() || !optOutDescription.trim() || !helpResponse.trim()) {
    return false;
  }

  const samples = sampleMessages.map((s) => s.trim()).filter(Boolean);
  if (samples.length !== SAMPLE_MESSAGE_COUNT) {
    return false;
  }

  const hasStopKeyword =
    samples.some((s) => STOP_PATTERN.test(s)) ||
    STOP_PATTERN.test(optOutDescription) ||
    optOutDescription.toUpperCase().includes(defaultOptOutKeyword.toUpperCase());

  if (!hasStopKeyword) {
    return false;
  }

  const requiredFiles = buildSampleMultimediaFilenames(
    operationalOutcome,
    optInKeyword,
  );

  return isSampleMultimediaComplete(sampleMultimediaConfirmation, requiredFiles);
}
