import type { BrandSnapshot } from "@/types/campaign";

export interface TemplateSubstitutionContext {
  brandSnapshot: BrandSnapshot;
}

function brandDisplayName(snapshot: BrandSnapshot): string {
  return snapshot.dbaName?.trim() || snapshot.legalName;
}

export function substituteLeadwireTemplate(
  template: string,
  context: TemplateSubstitutionContext,
): string {
  const { brandSnapshot } = context;
  const customerName = brandDisplayName(brandSnapshot);
  const brandName = brandDisplayName(brandSnapshot);

  return template
    .replaceAll("<Brand Name>", brandName)
    .replaceAll("<Legal Entity Name>", brandSnapshot.legalName)
    .replaceAll("<Customer Name>", customerName)
    .replaceAll("<Customer Support Phone>", brandSnapshot.supportPhoneNumber)
    .replaceAll("[BRAND NAME]", brandName);
}
