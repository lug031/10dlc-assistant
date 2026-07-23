export const PENDING_LEADWIRE_TEXT = "PENDIENTE DE TEXTO OPERATIVO LEADWIRE";

export type LeadwireCampaignTemplateKey =
  | "LW_CAMPAIGN_DESCRIPTION_SAMPLE_1"
  | "LW_CTA_SAMPLE_FLOW_3"
  | "LW_CTA_SAMPLE_FLOW_4"
  | "LW_OPT_IN"
  | "LW_OPT_OUT_STOP"
  | "LW_HELP"
  | "LW_CTA_HARD_TO_FIND_INSTRUCTIONS";

/** Textos operativos Leadwire — literales, sin modificar redacción. */
export const LEADWIRE_CAMPAIGN_TEMPLATES: Record<
  LeadwireCampaignTemplateKey,
  string | null
> = {
  LW_CAMPAIGN_DESCRIPTION_SAMPLE_1: `<Brand Name>, a brand managed by <Legal Entity Name> will use this campaign to retarget their previous in-store customers who've signed up to receive their promotions and accepted their privacy policy (established in CTA). Their goal is to send marketing promotions (up to 5 messages monthly to target increased sales and customer communications).`,

  LW_CTA_SAMPLE_FLOW_3: `Customers will opt-in by filling out a subscription form by scanning a QR code at [BRAND NAME] location that redirects visitors to [LEAD MAGNET URL] By filling out the form they accept their Privacy Policy and the following disclaimer: "By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP." The privacy policy contains the following statement: "[Brand Name] does not share, sell, or rent your mobile number or SMS consent information with third parties for marketing purposes." Also members opt-in by typing an opt-in keyword "[KEYWORD]", on both cases an automatic system confirmation will be sent with instructions to opt-out "You've registered to [BRAND NAME] text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month." [BRAND NAME] will then send text notifications about their events, up to 5 times a month.`,

  LW_CTA_SAMPLE_FLOW_4: `Customers will opt-in by filling out a subscription form by scanning a QR code at [BRAND NAME] location that redirects visitors to [LEAD MAGNET URL]

By filling out the form they accept their Privacy Policy and the following disclaimer:

"By subscribing, you agree to receive promotional text messages from us at the phone number provided. Consent is not a condition of purchase. Message frequency is up to 5 messages per month. Message and data rates may apply. You can opt out at any time by replying STOP. For help, reply HELP."

The privacy policy contain the following statement:

"[PRIVACY STATEMENT ES]"

which translates into:

"[PRIVACY STATEMENT EN]"

Also members opt-in by typing an opt-in keyword "[KEYWORD]", on both cases an automatic system confirmation will be sent with instructions to opt-out

"You've registered to [BRAND NAME] text notifications. Messages & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands. You will receive up to 5 messages per month."

[BRAND NAME] will then send text notifications about their events, up to 5 times a month.`,

  LW_OPT_IN: `You've registered to <Customer Name> text notifications. You will receive up to 5 messages per month, Msg & data rates may apply, Reply STOP to opt-out at any time. Reply HELP to view available commands.`,

  LW_OPT_OUT_STOP: `You have replied with the word STOP which blocks all texts from <Customer Name>. Text back START to opt-in again.`,

  LW_HELP: `This is a campaign text from <Customer Name>. You have replied with HELP and will be shown the available commands: HELP, STOP and START. For assistance call <Customer Support Phone>.`,

  LW_CTA_HARD_TO_FIND_INSTRUCTIONS: `[BRAND NAME]'s privacy policy is not directly linked from the homepage. To access the policy, follow the step-by-step path shown in the attached Sample Multimedia screenshots:

1. first-step-[KEYWORD].png — First step navigating the website toward the privacy policy section.
2. second-step-[KEYWORD].png — Second step continuing toward the privacy policy.
3. last-step-[KEYWORD].png — Final step showing the privacy policy page.`,
};

export function getLeadwireTemplateBody(
  key: LeadwireCampaignTemplateKey,
): string | null {
  return LEADWIRE_CAMPAIGN_TEMPLATES[key];
}
