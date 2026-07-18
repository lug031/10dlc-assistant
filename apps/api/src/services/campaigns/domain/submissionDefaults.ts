import type { Brand, PrivacyReview } from "../../../infrastructure/db/schema.js";
import type { BrandSnapshot } from "./submissionHelpers.js";
import { evaluateCampaignGate } from "./campaignGate.js";

function brandDisplayName(snapshot: BrandSnapshot): string {
  return snapshot.dbaName?.trim() || snapshot.legalName;
}

function deriveDefaultOptInKeyword(snapshot: BrandSnapshot): string {
  const name = brandDisplayName(snapshot);
  const withoutSuffix = name.replace(/,?\s*(Inc\.?|LLC|Corp\.?|Co\.?)$/i, "").trim();
  const tokens = withoutSuffix.split(/\s+/).filter(Boolean);
  const candidate = tokens[tokens.length - 1] ?? withoutSuffix;
  return candidate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function defaultPrivacyPolicyExcerpt(): string {
  return `The privacy policy contain the following statement:

"No utilizamos ni divulgamos información personal confidencial sin su consentimiento"

which translates into:

"We do not use or disclose sensitive personal information without your consent"`;
}

function composeFlow3(brandName: string, leadMagnetUrl: string, optInKeyword: string): string {
  const url = leadMagnetUrl || "[LEAD MAGNET URL]";
  const keyword = optInKeyword || "[KEYWORD]";

  return `Customers will opt-in by filling out a subscription form by scanning a QR code at ${brandName} location that redirects visitors to ${url}

By filling out the form they accept their Privacy Policy and the following disclaimer:

"By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP."

Also members opt-in by typing an opt-in keyword "${keyword}", on both cases an automatic system confirmation will be sent with instructions to opt-out

"You've registered to ${brandName} text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month."

${brandName} will then send text notifications about their events, up to 5 times a month.`;
}

function composeFlow4(
  brandName: string,
  leadMagnetUrl: string,
  optInKeyword: string,
  privacyPolicyExcerpt: string,
): string {
  const url = leadMagnetUrl || "[LEAD MAGNET URL]";
  const keyword = optInKeyword || "[KEYWORD]";
  const excerpt = privacyPolicyExcerpt || defaultPrivacyPolicyExcerpt();

  return `Customers will opt-in by filling out a subscription form by scanning a QR code at ${brandName} location that redirects visitors to ${url}

By filling out the form they accept their Privacy Policy and the following disclaimer:

"By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP."

${excerpt}

Also members opt-in by typing an opt-in keyword "${keyword}", on both cases an automatic system confirmation will be sent with instructions to opt-out

"You've registered to ${brandName} text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month."

${brandName} will then send text notifications about their events, up to 5 times a month.`;
}

function buildCampaignDescription(snapshot: BrandSnapshot): string {
  const brandName = brandDisplayName(snapshot);
  return `${brandName}, a brand managed by ${snapshot.legalName} will use this campaigns to retarget their previous in-store customers who've signed up to receive their promotions and accepted their terms and privacy policy (established in CTA).

Their goal is to send marketing promotions (up to 5 messages monthly to target increased sales and customer communications).`;
}

function buildOptIn(snapshot: BrandSnapshot): string {
  const customerName = brandDisplayName(snapshot);
  return `You've registered to ${customerName} text notifications.

You will receive up to 5 messages per month, Msg & data rates may apply, Reply STOP to opt-out at any time.

Reply HELP to view available commands.`;
}

function buildOptOut(snapshot: BrandSnapshot): string {
  const customerName = brandDisplayName(snapshot);
  return `You have replied with the word STOP which blocks all texts from ${customerName}.

Text back START to opt-in again`;
}

function buildHelp(snapshot: BrandSnapshot): string {
  const customerName = brandDisplayName(snapshot);
  return `This is a campaign text from ${customerName}.

You have replied with HELP and will be shown the available commands:

HELP, STOP and START.

For assistance call ${snapshot.supportPhoneNumber}.`;
}

function buildDefaultSampleMessages(snapshot: BrandSnapshot): [string, string] {
  const name = brandDisplayName(snapshot);
  return [
    `${name}: ¡Gracias por asistir a nuestro evento! Reply STOP to opt-out`,
    `${name}: ¡No te pierdas nuestras promociones especiales! Reply STOP to opt-out`,
  ];
}

export function buildDefaultSubmissionContent(
  brand: Brand,
  privacyReview: PrivacyReview | null,
) {
  const snapshot: BrandSnapshot = {
    legalName: brand.legalName,
    dbaName: brand.dbaName,
    einOrTaxId: brand.einOrTaxId,
    entityType: brand.entityType,
    registrationCountry: brand.registrationCountry,
    taxIdIssuingCountry: brand.taxIdIssuingCountry,
    verticalType: brand.verticalType,
    websiteUrl: brand.websiteUrl,
    supportPhoneNumber: brand.supportPhoneNumber,
    businessDescription: brand.businessDescription,
  };

  const gate = evaluateCampaignGate(privacyReview);
  const brandName = brandDisplayName(snapshot);
  const optInKeyword = deriveDefaultOptInKeyword(snapshot);
  const ctaTemplate = gate.ctaTemplate;

  const ctaMessageFlow =
    ctaTemplate === "LW_CTA_SAMPLE_FLOW_4"
      ? composeFlow4(brandName, "", optInKeyword, defaultPrivacyPolicyExcerpt())
      : composeFlow3(brandName, "", optInKeyword);

  return {
    campaignDescription: buildCampaignDescription(snapshot),
    ctaMessageFlow,
    optInDescription: buildOptIn(snapshot),
    optOutDescription: buildOptOut(snapshot),
    helpResponse: buildHelp(snapshot),
    sampleMessages: buildDefaultSampleMessages(snapshot),
  };
}
