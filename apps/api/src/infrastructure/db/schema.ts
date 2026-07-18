import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";



export const brands = sqliteTable("brands", {

  id: text("id").primaryKey(),

  internalAlias: text("internal_alias"),

  legalName: text("legal_name").notNull(),

  dbaName: text("dba_name"),

  entityType: text("entity_type").notNull().default("PRIVATE_PROFIT"),

  einOrTaxId: text("ein_or_tax_id").notNull(),

  registrationCountry: text("registration_country").notNull(),

  taxIdIssuingCountry: text("tax_id_issuing_country").notNull(),

  legalAddressLine1: text("legal_address_line1").notNull(),

  legalAddressLine2: text("legal_address_line2"),

  city: text("city").notNull(),

  state: text("state").notNull(),

  postalCode: text("postal_code").notNull(),

  country: text("country").notNull(),

  verticalType: text("vertical_type").notNull().default("Retail and Consumer Products"),

  businessDescription: text("business_description").notNull().default(""),

  supportPhoneNumber: text("support_phone_number").notNull().default(""),

  supportEmailAddress: text("support_email_address").notNull().default(""),

  websiteUrl: text("website_url"),

  primaryLanguage: text("primary_language").notNull().default("EN"),

  intakeNotes: text("intake_notes"),

  intakeStatus: text("intake_status").default("PENDING"),

  brandRegistrationStatus: text("brand_registration_status")

    .notNull()

    .default("DRAFT"),

  workflowStage: text("workflow_stage").notNull().default("LEGAL_COLLECTION"),

  archivedAt: text("archived_at"),

  createdAt: text("created_at").notNull(),

  updatedAt: text("updated_at").notNull(),

});



export const appSettings = sqliteTable("app_settings", {

  key: text("key").primaryKey(),

  valueJson: text("value_json").notNull(),

  updatedAt: text("updated_at").notNull(),

});



export const privacyReviews = sqliteTable("privacy_reviews", {

  id: text("id").primaryKey(),

  brandId: text("brand_id").notNull(),

  reviewNumber: integer("review_number").notNull(),

  scenarioType: text("scenario_type").notNull(),

  privacyPolicyUrl: text("privacy_policy_url"),

  facebookPageUrl: text("facebook_page_url"),

  externalHostingProvider: text("external_hosting_provider"),

  policyLanguagesJson: text("policy_languages_json").notNull(),

  accessibilityStatus: text("accessibility_status")

    .notNull()

    .default("UNKNOWN"),

  inaccessibleReason: text("inaccessible_reason"),

  policyLastUpdatedDate: text("policy_last_updated_date"),

  findings: text("findings"),

  remediationActions: text("remediation_actions"),

  operationalOutcome: text("operational_outcome"),

  privacyEmailFlowStatus: text("privacy_email_flow_status")

    .notNull()

    .default("NOT_STARTED"),

  privacyInitialEmailSentAt: text("privacy_initial_email_sent_at"),

  privacyFollowupSentAt: text("privacy_followup_sent_at"),

  privacyClientRespondedAt: text("privacy_client_responded_at"),

  status: text("status").notNull().default("DRAFT"),

  isCurrent: integer("is_current", { mode: "boolean" })

    .notNull()

    .default(false),

  reviewedAt: text("reviewed_at"),

  createdAt: text("created_at").notNull(),

  updatedAt: text("updated_at").notNull(),

});

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull(),
  internalName: text("internal_name").notNull(),
  useCase: text("use_case").notNull(),
  subUseCasesJson: text("sub_use_cases_json"),
  defaultOptOutKeyword: text("default_opt_out_keyword").notNull().default("STOP"),
  primaryLanguage: text("primary_language").notNull().default("EN"),
  currentStatus: text("current_status").notNull().default("DRAFT"),
  notes: text("notes"),
  archivedAt: text("archived_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const campaignSubmissions = sqliteTable("campaign_submissions", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  submissionNumber: integer("submission_number").notNull(),
  privacyReviewId: text("privacy_review_id"),
  brandSnapshotJson: text("brand_snapshot_json").notNull(),
  campaignDescription: text("campaign_description"),
  ctaMessageFlow: text("cta_message_flow"),
  optInDescription: text("opt_in_description"),
  optOutDescription: text("opt_out_description"),
  helpResponse: text("help_response"),
  sampleMessagesJson: text("sample_messages_json").notNull().default("[]"),
  contentAttributesJson: text("content_attributes_json").notNull().default("{}"),
  estimatedSubscriberVolume: text("estimated_subscriber_volume"),
  validationResultJson: text("validation_result_json"),
  status: text("status").notNull().default("DRAFT"),
  submittedAt: text("submitted_at"),
  approvedAt: text("approved_at"),
  externalPortalReference: text("external_portal_reference"),
  resubmissionOfSubmissionId: text("resubmission_of_submission_id"),
  changeSummary: text("change_summary"),
  tcrEvidenceConfirmationJson: text("tcr_evidence_confirmation_json"),
  sampleMultimediaJson: text("sample_multimedia_json"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const textTemplates = sqliteTable("text_templates", {
  id: text("id").primaryKey(),
  templateKey: text("template_key").notNull().unique(),
  templateType: text("template_type").notNull(),
  appealSubtype: text("appeal_subtype"),
  locale: text("locale").notNull().default("EN"),
  name: text("name").notNull(),
  body: text("body").notNull(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDeprecated: integer("is_deprecated", { mode: "boolean" })
    .notNull()
    .default(false),
  version: integer("version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const generatedTextSnapshots = sqliteTable("generated_text_snapshots", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  templateId: text("template_id"),
  textType: text("text_type").notNull(),
  locale: text("locale").notNull(),
  renderedBody: text("rendered_body").notNull(),
  inputContextJson: text("input_context_json"),
  generatedAt: text("generated_at").notNull(),
});

export const intakeRequests = sqliteTable("intake_requests", {
  id: text("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  status: text("status").notNull().default("DRAFT"),
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  requestedAt: text("requested_at"),
  notes: text("notes"),
  convertedBrandId: text("converted_brand_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type PrivacyReview = typeof privacyReviews.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignSubmission = typeof campaignSubmissions.$inferSelect;
export type TextTemplate = typeof textTemplates.$inferSelect;
export type GeneratedTextSnapshot = typeof generatedTextSnapshots.$inferSelect;
export type IntakeRequest = typeof intakeRequests.$inferSelect;
