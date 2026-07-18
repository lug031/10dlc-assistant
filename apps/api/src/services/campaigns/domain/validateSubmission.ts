import type { Brand, CampaignSubmission, PrivacyReview } from "../../../infrastructure/db/schema.js";

import type { Campaign } from "../../../infrastructure/db/schema.js";

import {

  canPrepareSubmission,

  evaluateCampaignGate,

} from "./campaignGate.js";

import {

  parseBrandSnapshot,

  parseContentAttributes,

  parseSampleMessages,

  type ContentAttributes,

} from "./submissionHelpers.js";

import {

  buildSampleMultimediaFilenames,

  isSampleMultimediaComplete,

  parseOptInKeywordFromCta,

  parseSampleMultimediaConfirmation,

} from "./sampleMultimedia.js";



export interface ValidationIssue {

  code: string;

  message: string;

  field: string;

}



export interface SubmissionValidationResult {

  valid: boolean;

  blocking: ValidationIssue[];

  warnings: ValidationIssue[];

}



const URL_PATTERN = /https?:\/\//i;

const PHONE_PATTERN = /\+?\d[\d\s().-]{7,}/;

const STOP_PATTERN = /\bSTOP\b/i;



function brandNameInText(text: string, brand: { legalName: string; dbaName: string | null }) {

  const lower = text.toLowerCase();

  if (lower.includes(brand.legalName.toLowerCase())) return true;

  if (brand.dbaName && lower.includes(brand.dbaName.toLowerCase())) return true;

  return false;

}



export function validateSubmissionLogic(params: {

  submission: CampaignSubmission;

  campaign: Campaign;

  brand: Brand;

  privacyReview: PrivacyReview | null;

  linkedPrivacyReviewId?: string | null;

  optOutKeyword?: string;

}): SubmissionValidationResult {

  const { submission, campaign, brand, privacyReview } = params;

  const blocking: ValidationIssue[] = [];

  const warnings: ValidationIssue[] = [];



  const gate = evaluateCampaignGate(privacyReview);



  if (!canPrepareSubmission(gate)) {

    if (gate.reasonCode === "PRIVACY_REVIEW_NOT_CURRENT") {

      blocking.push({

        code: "PRIVACY_REVIEW_REQUIRED",

        message: "Se requiere una privacy review vigente de la marca",

        field: "privacyReviewId",

      });

    } else if (gate.reasonCode === "OPERATIONAL_OUTCOME_UNDEFINED") {

      blocking.push({

        code: "OPERATIONAL_OUTCOME_UNDEFINED",

        message:

          "El outcome operativo no esta definido en la privacy review vigente",

        field: "privacyReviewId",

      });

    } else if (gate.reasonCode === "OPERATIONAL_OUTCOME_NO_POLICY") {

      blocking.push({

        code: "OPERATIONAL_OUTCOME_NO_POLICY",

        message:

          "El outcome operativo NO_POLICY bloquea la preparacion del envio",

        field: "privacyReviewId",

      });

    }

  } else if (privacyReview && privacyReview.brandId !== brand.id) {

    blocking.push({

      code: "PRIVACY_REVIEW_MISMATCH",

      message: "La privacy review no pertenece a esta marca",

      field: "privacyReviewId",

    });

  }



  if (

    gate.ambiguousLanguage &&

    gate.operationalOutcome === "HARD_TO_FIND"

  ) {

    blocking.push({

      code: "CTA_POLICY_LANGUAGE_AMBIGUOUS",

      message:

        "HARD_TO_FIND con multiples idiomas de politica: defina un unico idioma en Privacy Assessment",

      field: "privacyReviewId",

    });

  }



  if (canPrepareSubmission(gate)) {
    const optInKeyword = parseOptInKeywordFromCta(submission.ctaMessageFlow);
    const requiredFiles = buildSampleMultimediaFilenames(
      gate.operationalOutcome,
      optInKeyword,
    );
    const multimedia = parseSampleMultimediaConfirmation(
      submission.sampleMultimediaJson,
    );

    if (!isSampleMultimediaComplete(multimedia, requiredFiles)) {
      blocking.push({
        code: "SAMPLE_MULTIMEDIA_INCOMPLETE",
        message:
          "Confirme todos los archivos de Sample Multimedia cargados en Campaign Registry",
        field: "sampleMultimediaConfirmation",
      });
    }
  }



  if (

    params.linkedPrivacyReviewId &&

    privacyReview &&

    params.linkedPrivacyReviewId !== privacyReview.id

  ) {

    warnings.push({

      code: "PRIVACY_REVIEW_STALE",

      message:

        "La privacy review vinculada al envio no coincide con la review vigente",

      field: "privacyReviewId",

    });

  }



  const snapshot = parseBrandSnapshot(submission.brandSnapshotJson);

  const samples = parseSampleMessages(submission.sampleMessagesJson);

  const attrs = parseContentAttributes(submission.contentAttributesJson);

  const optOutKeyword = params.optOutKeyword ?? campaign.defaultOptOutKeyword ?? "STOP";



  if (!submission.campaignDescription?.trim() || submission.campaignDescription.trim().length < 40) {

    blocking.push({

      code: "DESCRIPTION_TOO_SHORT",

      message: "campaignDescription debe tener al menos 40 caracteres",

      field: "campaignDescription",

    });

  }



  if (!submission.optInDescription?.trim()) {

    blocking.push({

      code: "OPT_IN_REQUIRED",

      message: "optInDescription es obligatorio",

      field: "optInDescription",

    });

  }



  if (!submission.optOutDescription?.trim()) {

    blocking.push({

      code: "OPT_OUT_REQUIRED",

      message: "optOutDescription es obligatorio",

      field: "optOutDescription",

    });

  }



  if (!submission.helpResponse?.trim()) {

    blocking.push({

      code: "HELP_REQUIRED",

      message: "helpResponse es obligatorio",

      field: "helpResponse",

    });

  }



  if (samples.length !== 2) {

    blocking.push({

      code: "SAMPLE_COUNT",

      message: "sampleMessages debe tener exactamente 2 mensajes",

      field: "sampleMessages",

    });

  }



  const hasBrandInSamples = samples.some((s) =>

    brandNameInText(s, snapshot),

  );

  if (samples.length >= 2 && !hasBrandInSamples) {

    warnings.push({

      code: "BRAND_NAME_NOT_IN_SAMPLES",

      message: "Ninguna muestra incluye el nombre legal o DBA de la marca",

      field: "sampleMessages",

    });

  }



  const hasStopInSamples = samples.some((s) => STOP_PATTERN.test(s));

  const hasStopInOptOut =

    STOP_PATTERN.test(submission.optOutDescription ?? "") ||

    submission.optOutDescription?.toUpperCase().includes(optOutKeyword.toUpperCase());



  if (!hasStopInSamples && !hasStopInOptOut) {

    blocking.push({

      code: "OPT_OUT_KEYWORD_MISSING",

      message: `Incluye ${optOutKeyword} o STOP en muestras u optOutDescription`,

      field: "sampleMessages",

    });

  }



  if (attrs.embeddedLinks && !samples.some((s) => URL_PATTERN.test(s))) {

    warnings.push({

      code: "EMBEDDED_LINKS_MISMATCH",

      message: "embeddedLinks esta activo pero ninguna muestra contiene URL",

      field: "sampleMessages",

    });

  }



  if (attrs.phoneNumbers && !samples.some((s) => PHONE_PATTERN.test(s))) {

    warnings.push({

      code: "PHONE_NUMBERS_MISMATCH",

      message: "phoneNumbers esta activo pero ninguna muestra contiene telefono",

      field: "sampleMessages",

    });

  }



  if (

    campaign.useCase === "MARKETING" &&

    (submission.optInDescription?.trim().length ?? 0) < 30

  ) {

    warnings.push({

      code: "OPT_IN_VAGUE",

      message: "Caso MARKETING con descripcion de opt-in muy breve",

      field: "optInDescription",

    });

  }



  for (const sample of samples) {

    if (sample.length > 320) {

      warnings.push({

        code: "SAMPLE_TOO_LONG",

        message: "Una muestra supera 320 caracteres",

        field: "sampleMessages",

      });

      break;

    }

  }



  checkContentCoherence(attrs, samples, warnings);



  return {

    valid: blocking.length === 0,

    blocking,

    warnings,

  };

}



function checkContentCoherence(

  attrs: ContentAttributes,

  samples: string[],

  warnings: ValidationIssue[],

) {

  const hasUrl = samples.some((s) => URL_PATTERN.test(s));

  const hasPhone = samples.some((s) => PHONE_PATTERN.test(s));



  if (hasUrl && !attrs.embeddedLinks) {

    warnings.push({

      code: "EMBEDDED_LINKS_FALSE",

      message: "Hay URLs en muestras pero embeddedLinks esta en false",

      field: "contentAttributes",

    });

  }



  if (hasPhone && !attrs.phoneNumbers) {

    warnings.push({

      code: "PHONE_NUMBERS_FALSE",

      message: "Hay telefonos en muestras pero phoneNumbers esta en false",

      field: "contentAttributes",

    });

  }

}

