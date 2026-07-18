import type { LeadwireCampaignTemplateKey } from "@/constants/leadwireCampaignTemplates";
import type { BrandSnapshot } from "@/types/campaign";
import type { OperationalOutcome } from "@/types/privacy";
import {
  buildHardToFindPrivacyAccessGuide,
  stripHardToFindGuideFromCta,
} from "@/utils/hardToFindPrivacyGuide";

export interface CtaEditableParts {
  leadMagnetUrl: string;
  optInKeyword: string;
  privacyPolicyExcerpt: string;
  hardToFindPrivacyGuide: string;
}

export function brandDisplayName(snapshot: BrandSnapshot): string {
  return snapshot.dbaName?.trim() || snapshot.legalName;
}

export function deriveDefaultOptInKeyword(snapshot: BrandSnapshot): string {
  const name = brandDisplayName(snapshot);
  const withoutSuffix = name.replace(/,?\s*(Inc\.?|LLC|Corp\.?|Co\.?)$/i, "").trim();
  const tokens = withoutSuffix.split(/\s+/).filter(Boolean);
  const candidate = tokens[tokens.length - 1] ?? withoutSuffix;
  return candidate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function defaultPrivacyPolicyExcerpt(): string {
  return `The privacy policy contain the following statement:

"No utilizamos ni divulgamos información personal confidencial sin su consentimiento"

which translates into:

"We do not use or disclose sensitive personal information without your consent"`;
}

export function defaultCtaEditableParts(
  brandSnapshot: BrandSnapshot,
  templateKey: LeadwireCampaignTemplateKey | null,
): CtaEditableParts {
  return {
    leadMagnetUrl: "",
    optInKeyword: deriveDefaultOptInKeyword(brandSnapshot),
    privacyPolicyExcerpt:
      templateKey === "LW_CTA_SAMPLE_FLOW_4" ? defaultPrivacyPolicyExcerpt() : "",
    hardToFindPrivacyGuide: "",
  };
}

function composeFlow3(
  brandName: string,
  parts: CtaEditableParts,
): string {
  const url = parts.leadMagnetUrl.trim() || "[LEAD MAGNET URL]";
  const keyword = parts.optInKeyword.trim() || "[KEYWORD]";

  return `Customers will opt-in by filling out a subscription form by scanning a QR code at ${brandName} location that redirects visitors to ${url}

By filling out the form they accept their Privacy Policy and the following disclaimer:

"By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP."

Also members opt-in by typing an opt-in keyword "${keyword}", on both cases an automatic system confirmation will be sent with instructions to opt-out

"You've registered to ${brandName} text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month."

${brandName} will then send text notifications about their events, up to 5 times a month.`;
}

function composeFlow4(
  brandName: string,
  parts: CtaEditableParts,
): string {
  const url = parts.leadMagnetUrl.trim() || "[LEAD MAGNET URL]";
  const keyword = parts.optInKeyword.trim() || "[KEYWORD]";
  const excerpt =
    parts.privacyPolicyExcerpt.trim() || defaultPrivacyPolicyExcerpt();

  return `Customers will opt-in by filling out a subscription form by scanning a QR code at ${brandName} location that redirects visitors to ${url}

By filling out the form they accept their Privacy Policy and the following disclaimer:

"By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP."

${excerpt}

Also members opt-in by typing an opt-in keyword "${keyword}", on both cases an automatic system confirmation will be sent with instructions to opt-out

"You've registered to ${brandName} text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month."

${brandName} will then send text notifications about their events, up to 5 times a month.`;
}

export function composeCtaMessageFlow(
  templateKey: LeadwireCampaignTemplateKey,
  brandSnapshot: BrandSnapshot,
  parts: CtaEditableParts,
): string {
  const brandName = brandDisplayName(brandSnapshot);
  if (templateKey === "LW_CTA_SAMPLE_FLOW_4") {
    return composeFlow4(brandName, parts);
  }
  return composeFlow3(brandName, parts);
}

export function composeSubmissionCtaMessageFlow(
  templateKey: LeadwireCampaignTemplateKey,
  brandSnapshot: BrandSnapshot,
  parts: CtaEditableParts,
  options?: {
    operationalOutcome?: OperationalOutcome | null;
  },
): string {
  const base = composeCtaMessageFlow(templateKey, brandSnapshot, parts);

  if (options?.operationalOutcome !== "HARD_TO_FIND") {
    return base;
  }

  const guide =
    parts.hardToFindPrivacyGuide.trim() ||
    buildHardToFindPrivacyAccessGuide(
      brandSnapshot,
      parts.optInKeyword,
    );

  return guide ? `${base}\n\n${guide}` : base;
}

export function parseCtaMessageFlow(
  text: string,
  templateKey: LeadwireCampaignTemplateKey | null,
  brandSnapshot: BrandSnapshot,
): CtaEditableParts {
  const defaults = defaultCtaEditableParts(brandSnapshot, templateKey);
  const baseText = stripHardToFindGuideFromCta(text);
  const hardToFindPrivacyGuide =
    text.trim().length > baseText.trim().length
      ? text.slice(baseText.length).trim().replace(/^\n+/, "")
      : "";

  if (!baseText.trim()) {
    return { ...defaults, hardToFindPrivacyGuide };
  }

  const urlMatch = baseText.match(
    /redirects visitors to (.+?)(?:\r?\n|$)/i,
  );
  const keywordMatch = baseText.match(/opt-in keyword "([^"]+)"/i);

  const leadMagnetUrl =
    urlMatch?.[1]?.trim() && urlMatch[1] !== "[LEAD MAGNET URL]"
      ? urlMatch[1].trim()
      : defaults.leadMagnetUrl;

  const optInKeyword = keywordMatch?.[1]?.trim() || defaults.optInKeyword;

  if (templateKey === "LW_CTA_SAMPLE_FLOW_4") {
    const excerptMatch = baseText.match(
      /"By subscribing, you agree[\s\S]*?"\r?\n\r?\n([\s\S]*?)\r?\n\r?\nAlso members opt-in/i,
    );
    return {
      leadMagnetUrl,
      optInKeyword,
      privacyPolicyExcerpt: excerptMatch?.[1]?.trim() || defaults.privacyPolicyExcerpt,
      hardToFindPrivacyGuide,
    };
  }

  return {
    leadMagnetUrl,
    optInKeyword,
    privacyPolicyExcerpt: "",
    hardToFindPrivacyGuide,
  };
}
