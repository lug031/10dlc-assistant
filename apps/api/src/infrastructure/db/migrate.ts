import { randomUUID } from "node:crypto";
import { client } from "./client.js";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY NOT NULL,
  internal_alias TEXT,
  legal_name TEXT NOT NULL,
  dba_name TEXT,
  entity_type TEXT NOT NULL DEFAULT 'PRIVATE_PROFIT',
  ein_or_tax_id TEXT NOT NULL,
  registration_country TEXT NOT NULL,
  tax_id_issuing_country TEXT NOT NULL,
  legal_address_line1 TEXT NOT NULL,
  legal_address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  vertical_type TEXT NOT NULL DEFAULT 'Retail and Consumer Products',
  business_description TEXT NOT NULL DEFAULT '',
  support_phone_number TEXT NOT NULL DEFAULT '',
  support_email_address TEXT NOT NULL DEFAULT '',
  website_url TEXT,
  primary_language TEXT NOT NULL DEFAULT 'EN',
  intake_notes TEXT,
  intake_status TEXT DEFAULT 'PENDING',
  brand_registration_status TEXT NOT NULL DEFAULT 'DRAFT',
  workflow_stage TEXT NOT NULL DEFAULT 'LEGAL_COLLECTION',
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brands_archived_at ON brands(archived_at);
CREATE INDEX IF NOT EXISTS idx_brands_updated_at ON brands(updated_at);

CREATE TABLE IF NOT EXISTS privacy_reviews (
  id TEXT PRIMARY KEY NOT NULL,
  brand_id TEXT NOT NULL,
  review_number INTEGER NOT NULL,
  scenario_type TEXT NOT NULL,
  privacy_policy_url TEXT,
  facebook_page_url TEXT,
  external_hosting_provider TEXT,
  policy_languages_json TEXT NOT NULL,
  accessibility_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  inaccessible_reason TEXT,
  policy_last_updated_date TEXT,
  findings TEXT,
  remediation_actions TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  is_current INTEGER NOT NULL DEFAULT 0,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);

CREATE INDEX IF NOT EXISTS idx_privacy_reviews_brand_id ON privacy_reviews(brand_id);
CREATE INDEX IF NOT EXISTS idx_privacy_reviews_brand_current ON privacy_reviews(brand_id, is_current);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY NOT NULL,
  brand_id TEXT NOT NULL,
  internal_name TEXT NOT NULL,
  use_case TEXT NOT NULL,
  sub_use_cases_json TEXT,
  default_opt_out_keyword TEXT NOT NULL DEFAULT 'STOP',
  primary_language TEXT NOT NULL DEFAULT 'EN',
  current_status TEXT NOT NULL DEFAULT 'DRAFT',
  notes TEXT,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);

CREATE TABLE IF NOT EXISTS campaign_submissions (
  id TEXT PRIMARY KEY NOT NULL,
  campaign_id TEXT NOT NULL,
  submission_number INTEGER NOT NULL,
  privacy_review_id TEXT,
  brand_snapshot_json TEXT NOT NULL,
  campaign_description TEXT,
  cta_message_flow TEXT,
  opt_in_description TEXT,
  opt_out_description TEXT,
  help_response TEXT,
  sample_messages_json TEXT NOT NULL DEFAULT '[]',
  content_attributes_json TEXT NOT NULL DEFAULT '{}',
  estimated_subscriber_volume TEXT,
  validation_result_json TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  submitted_at TEXT,
  approved_at TEXT,
  external_portal_reference TEXT,
  resubmission_of_submission_id TEXT,
  change_summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (privacy_review_id) REFERENCES privacy_reviews(id)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign_id ON campaign_submissions(campaign_id);

CREATE TABLE IF NOT EXISTS text_templates (
  id TEXT PRIMARY KEY NOT NULL,
  template_key TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL,
  appeal_subtype TEXT,
  locale TEXT NOT NULL DEFAULT 'EN',
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS generated_text_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  template_id TEXT,
  text_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  rendered_body TEXT NOT NULL,
  input_context_json TEXT,
  generated_at TEXT NOT NULL,
  FOREIGN KEY (template_id) REFERENCES text_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_generated_snapshots_source ON generated_text_snapshots(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_text_templates_type ON text_templates(template_type, locale, is_active);

CREATE TABLE IF NOT EXISTS intake_requests (
  id TEXT PRIMARY KEY NOT NULL,
  brand_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  email_subject TEXT,
  email_body TEXT,
  requested_at TEXT,
  notes TEXT,
  converted_brand_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (converted_brand_id) REFERENCES brands(id)
);

CREATE INDEX IF NOT EXISTS idx_intake_requests_status ON intake_requests(status);
CREATE INDEX IF NOT EXISTS idx_intake_requests_updated_at ON intake_requests(updated_at);
`;

const DEFAULT_SETTINGS = {
  uiLocale: "es",
  defaultOptOutKeyword: "STOP",
  defaultPrimaryLanguage: "EN",
  showValidationWarnings: true,
};

async function seedDefaultSettings() {
  const existing = await client.execute({
    sql: "SELECT key FROM app_settings WHERE key = ?",
    args: ["app"],
  });

  if (existing.rows.length > 0) return;

  const now = new Date().toISOString();
  await client.execute({
    sql: "INSERT INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)",
    args: ["app", JSON.stringify(DEFAULT_SETTINGS), now],
  });
}

interface SeedTemplate {
  templateKey: string;
  templateType: string;
  locale: string;
  name: string;
  body: string;
  appealSubtype?: string;
}

const SYSTEM_TEMPLATES: SeedTemplate[] = [
  {
    templateKey: "brand_legal_block_en",
    templateType: "BRAND_LEGAL_BLOCK",
    locale: "EN",
    name: "Brand legal block",
    body: `Legal entity name: {{brand.legalName}}
DBA / trade name: {{brand.dbaName}}
Entity type: {{brand.entityType}}
Tax ID: {{brand.einOrTaxId}}
Registered address: {{brand.city}}, {{brand.state}}, {{brand.country}}
Industry: {{brand.verticalType}}`,
  },
  {
    templateKey: "brand_description_en",
    templateType: "BRAND_DESCRIPTION",
    locale: "EN",
    name: "Brand business description",
    body: `{{brand.businessDescription}}`,
  },
  {
    templateKey: "brand_website_statement_en",
    templateType: "BRAND_WEBSITE_STATEMENT",
    locale: "EN",
    name: "Brand website statement",
    body: `Official website: {{brand.websiteUrl}}
{{brand.legalName}} provides services as described on our website.`,
  },
  {
    templateKey: "campaign_description_default_en",
    templateType: "CAMPAIGN_DESCRIPTION",
    locale: "EN",
    name: "Campaign description",
    body: `{{brand.legalName}} sends {{campaign.useCase}} messages to customers who have opted in to receive SMS updates. Messages may include account notifications, service updates, and promotional offers related to our products and services.`,
  },
  {
    templateKey: "cta_message_flow_default_en",
    templateType: "CTA_MESSAGE_FLOW",
    locale: "EN",
    name: "CTA / message flow",
    body: `Call to action: Customers opt in by submitting their mobile number on {{brand.websiteUrl}} or through an in-store signup form.
Message flow:
1. Customer provides phone number and consent
2. Confirmation message is sent
3. Ongoing {{campaign.useCase}} messages are delivered as described`,
  },
  {
    templateKey: "opt_in_default_en",
    templateType: "OPT_IN",
    locale: "EN",
    name: "Opt-in description",
    body: `By providing their mobile number and checking the consent box, users agree to receive recurring SMS messages from {{brand.legalName}}. Message frequency varies. Message and data rates may apply.`,
  },
  {
    templateKey: "opt_out_default_en",
    templateType: "OPT_OUT",
    locale: "EN",
    name: "Opt-out description",
    body: `Recipients can opt out at any time by replying {{settings.defaultOptOutKeyword}} to any message. After opting out, no further messages will be sent unless the user opts in again.`,
  },
  {
    templateKey: "help_default_en",
    templateType: "HELP",
    locale: "EN",
    name: "HELP response",
    body: `Reply HELP for assistance or contact {{brand.legalName}} at {{brand.websiteUrl}}.`,
  },
  {
    templateKey: "sample_messages_block_en",
    templateType: "SAMPLE_MESSAGES",
    locale: "EN",
    name: "Sample messages",
    body: `Sample messages:
{{submission.sampleMessagesText}}`,
  },
  {
    templateKey: "privacy_stub_en",
    templateType: "PRIVACY_STUB_EN",
    locale: "EN",
    name: "Privacy policy stub (EN)",
    body: `{{brand.legalName}} Privacy Policy

We respect your privacy. This policy explains how we collect, use, and protect personal information when you interact with {{brand.legalName}}, including SMS programs.

Privacy policy URL: {{privacyReview.privacyPolicyUrl}}

Contact: {{brand.websiteUrl}}`,
  },
  {
    templateKey: "privacy_stub_es",
    templateType: "PRIVACY_STUB_ES",
    locale: "ES",
    name: "Privacy policy stub (ES)",
    body: `Politica de Privacidad de {{brand.legalName}}

Respetamos su privacidad. Esta politica explica como recopilamos, usamos y protegemos la informacion personal cuando interactua con {{brand.legalName}}, incluidos los programas SMS.

URL de politica de privacidad: {{privacyReview.privacyPolicyUrl}}

Contacto: {{brand.websiteUrl}}`,
  },
  {
    templateKey: "privacy_facebook_guide_en",
    templateType: "PRIVACY_FACEBOOK_GUIDE",
    locale: "EN",
    name: "Facebook privacy guide",
    body: `Facebook page privacy reference for {{brand.legalName}}:
Facebook page: {{privacyReview.facebookPageUrl}}
Primary privacy policy: {{privacyReview.privacyPolicyUrl}}

Ensure the Facebook page links to the official privacy policy and discloses SMS data practices.`,
  },
  {
    templateKey: "privacy_website_snippet_en",
    templateType: "PRIVACY_WEBSITE_SNIPPET",
    locale: "EN",
    name: "Website privacy snippet",
    body: `SMS Privacy Notice

{{brand.legalName}} may send SMS messages related to {{campaign.useCase}}. By opting in, you agree to receive messages. Reply {{settings.defaultOptOutKeyword}} to cancel. Reply HELP for help.

Full privacy policy: {{privacyReview.privacyPolicyUrl}}`,
  },
  {
    templateKey: "client_info_request_standard_es",
    templateType: "CLIENT_INFO_REQUEST",
    locale: "ES",
    name: "Solicitud de informacion al cliente",
    body: `Saludos {{brand.contactName}},

Espero que estés bien.

Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso {{brand.displayName}}, que están enviando mensajes de texto a consumidores.

Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

• Nombre legal de la entidad
• EIN / SS Patronal
• Dirección registrada de la empresa
• Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible, en cumplimiento con las regulaciones de mensajería.

Adjunto te compartimos una política de privacidad que pueden utilizar para completar este requisito.

Quedamos pendientes a cualquier pregunta que tengas.`,
  },
  {
    templateKey: "client_info_request_facebook_es",
    templateType: "CLIENT_INFO_REQUEST_FACEBOOK",
    locale: "ES",
    name: "Solicitud de informacion (Facebook)",
    body: `Saludos {{brand.contactName}},

Espero que estés bien.

Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso {{brand.displayName}}, que están enviando mensajes de texto a consumidores.

Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

• Nombre legal de la entidad
• EIN / SS Patronal
• Dirección registrada de la empresa
• Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible.

Hemos notado que el sitio web de {{brand.displayName}} ha estado presentando intermitencias o no se encuentra accesible actualmente.

Para no retrasar el proceso de registro, podemos utilizar como alternativa su página oficial de Facebook.

Adjunto te compartimos una política de privacidad que pueden publicar allí, y esa publicación nos serviría para completar el registro de la marca.

Quedamos pendientes a cualquier pregunta que tengas.`,
  },
  {
    templateKey: "client_info_followup_es",
    templateType: "CLIENT_INFO_FOLLOWUP",
    locale: "ES",
    name: "Follow-up al cliente",
    body: `Saludos,

Espero que estés bien.

Quería dar seguimiento a nuestra solicitud de información para completar el registro 10DLC de {{brand.displayName}}.

Agradeceríamos nos puedan compartir la documentación pendiente para poder continuar con el proceso.

Quedamos atentos a cualquier pregunta.

Muchas gracias.`,
  },
  {
    templateKey: "privacy_policy_request_es",
    templateType: "PRIVACY_POLICY_REQUEST",
    locale: "ES",
    name: "Solicitud de politica de privacidad",
    body: `Saludos {{brand.contactName}},

Espero que estés bien.

Para completar el registro 10DLC de {{brand.displayName}}, necesitamos que la entidad tenga una política de privacidad publicada y accesible en su sitio web, en cumplimiento con las regulaciones de mensajería de los operadores móviles.

Adjunto te compartimos un borrador de política de privacidad que pueden utilizar para completar este requisito.

Quedamos pendientes a cualquier pregunta que tengas.`,
  },
  {
    templateKey: "privacy_policy_facebook_es",
    templateType: "PRIVACY_POLICY_FACEBOOK",
    locale: "ES",
    name: "Solicitud de politica (Facebook)",
    body: `Saludos {{brand.contactName}},

Espero que estés bien.

Para completar el registro 10DLC de {{brand.displayName}}, necesitamos una política de privacidad publicada y accesible.

Si el sitio web no está disponible en este momento, pueden publicar la política de privacidad en su página oficial de Facebook como alternativa temporal.

Adjunto te compartimos un borrador que pueden publicar allí para avanzar con el registro.

Quedamos pendientes a cualquier pregunta que tengas.`,
  },
];

async function seedSystemTemplates() {
  const insertSql = `
    INSERT OR IGNORE INTO text_templates (
      id, template_key, template_type, appeal_subtype, locale, name, body,
      is_system, is_active, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?)
  `;

  const now = new Date().toISOString();

  for (const tpl of SYSTEM_TEMPLATES) {
    await client.execute({
      sql: insertSql,
      args: [
        randomUUID(),
        tpl.templateKey,
        tpl.templateType,
        tpl.appealSubtype ?? null,
        tpl.locale,
        tpl.name,
        tpl.body,
        now,
        now,
      ],
    });
  }
}

const BRAND_ENTITY_TYPE = "PRIVATE_PROFIT";
const BRAND_VERTICAL_TYPE = "Retail and Consumer Products";

async function tableHasColumn(table: string, column: string) {
  const result = await client.execute(`PRAGMA table_info(${table})`);
  const rows = result.rows as unknown as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function toReadableCountry(
  value: string | null | undefined,
  fallback = "United States",
) {
  if (!value?.trim()) return fallback;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();

  if (
    upper === "US" ||
    upper === "UNITED STATES" ||
    trimmed === "United States"
  ) {
    return "United States";
  }

  if (upper === "PR" || upper === "PUERTO RICO" || trimmed === "Puerto Rico") {
    return "Puerto Rico";
  }

  return fallback;
}

const DEPRECATED_TEMPLATE_KEYS = [
  "campaign_description_default_en",
  "cta_message_flow_default_en",
  "opt_in_default_en",
  "opt_out_default_en",
  "help_default_en",
  "client_info_request_standard_es",
  "client_info_request_facebook_es",
  "client_info_followup_es",
  "privacy_policy_request_es",
  "privacy_policy_facebook_es",
  "appeal_generic_en",
];

async function markDeprecatedTemplates() {
  const sql = `UPDATE text_templates SET is_deprecated = 1, is_active = 0 WHERE template_key = ?`;
  for (const key of DEPRECATED_TEMPLATE_KEYS) {
    await client.execute({ sql, args: [key] });
  }
}

async function runBrandModelUpgrade() {
  const newBrandColumns = [
    "registration_country",
    "tax_id_issuing_country",
    "vertical_type",
  ];

  for (const column of newBrandColumns) {
    if (!(await tableHasColumn("brands", column))) {
      await client.execute(`ALTER TABLE brands ADD COLUMN ${column} TEXT`);
    }
  }

  if (!(await tableHasColumn("brands", "support_phone_number"))) {
    await client.execute(
      `ALTER TABLE brands ADD COLUMN support_phone_number TEXT NOT NULL DEFAULT ''`,
    );
  }

  if (!(await tableHasColumn("brands", "support_email_address"))) {
    await client.execute(
      `ALTER TABLE brands ADD COLUMN support_email_address TEXT NOT NULL DEFAULT ''`,
    );
  }

  if (await tableHasColumn("brands", "primary_language")) {
    await client.execute(
      `UPDATE brands SET primary_language = 'EN' WHERE primary_language = 'BILINGUAL'`,
    );
  }

  if (!(await tableHasColumn("campaigns", "primary_language"))) {
    await client.execute(
      `ALTER TABLE campaigns ADD COLUMN primary_language TEXT NOT NULL DEFAULT 'EN'`,
    );
  }

  if (await tableHasColumn("brands", "id")) {
    const result = await client.execute("SELECT * FROM brands");
    const rows = result.rows as unknown as Array<Record<string, unknown>>;
    const updateSql = `
      UPDATE brands SET
        registration_country = ?,
        tax_id_issuing_country = ?,
        vertical_type = ?,
        entity_type = ?
      WHERE id = ?
    `;

    for (const row of rows) {
      const registrationCountry = toReadableCountry(
        (row.registration_country as string | undefined) ??
          (row.country as string | undefined) ??
          (row.tax_id_country as string | undefined),
      );
      const taxIdIssuingCountry = toReadableCountry(
        (row.tax_id_issuing_country as string | undefined) ??
          (row.tax_id_country as string | undefined) ??
          (row.country as string | undefined),
      );

      await client.execute({
        sql: updateSql,
        args: [
          registrationCountry,
          taxIdIssuingCountry,
          BRAND_VERTICAL_TYPE,
          BRAND_ENTITY_TYPE,
          row.id as string,
        ],
      });
    }
  }

  for (const column of [
    "is_charity_or_nonprofit",
    "charity_legal_name",
    "stock_symbol",
    "vertical_industry",
    "tax_id_country",
  ]) {
    if (await tableHasColumn("brands", column)) {
      await client.execute(`ALTER TABLE brands DROP COLUMN ${column}`);
    }
  }

  if (await tableHasColumn("privacy_reviews", "charity_disclosure_required")) {
    await client.execute(
      `ALTER TABLE privacy_reviews DROP COLUMN charity_disclosure_required`,
    );
  }

  if (!(await tableHasColumn("privacy_reviews", "operational_outcome"))) {
    await client.execute(
      `ALTER TABLE privacy_reviews ADD COLUMN operational_outcome TEXT`,
    );
  }

  if (!(await tableHasColumn("privacy_reviews", "privacy_email_flow_status"))) {
    await client.execute(
      `ALTER TABLE privacy_reviews ADD COLUMN privacy_email_flow_status TEXT NOT NULL DEFAULT 'NOT_STARTED'`,
    );
  }

  if (
    !(await tableHasColumn("privacy_reviews", "privacy_initial_email_sent_at"))
  ) {
    await client.execute(
      `ALTER TABLE privacy_reviews ADD COLUMN privacy_initial_email_sent_at TEXT`,
    );
  }

  if (!(await tableHasColumn("privacy_reviews", "privacy_followup_sent_at"))) {
    await client.execute(
      `ALTER TABLE privacy_reviews ADD COLUMN privacy_followup_sent_at TEXT`,
    );
  }

  if (
    !(await tableHasColumn("privacy_reviews", "privacy_client_responded_at"))
  ) {
    await client.execute(
      `ALTER TABLE privacy_reviews ADD COLUMN privacy_client_responded_at TEXT`,
    );
  }

  if (
    !(await tableHasColumn(
      "campaign_submissions",
      "tcr_evidence_confirmation_json",
    ))
  ) {
    await client.execute(
      `ALTER TABLE campaign_submissions ADD COLUMN tcr_evidence_confirmation_json TEXT`,
    );
  }

  if (
    !(await tableHasColumn("campaign_submissions", "sample_multimedia_json"))
  ) {
    await client.execute(
      `ALTER TABLE campaign_submissions ADD COLUMN sample_multimedia_json TEXT`,
    );
  }

  if (!(await tableHasColumn("text_templates", "is_deprecated"))) {
    await client.execute(
      `ALTER TABLE text_templates ADD COLUMN is_deprecated INTEGER NOT NULL DEFAULT 0`,
    );
  }

  await markDeprecatedTemplates();
}

export async function runMigrations() {
  await client.executeMultiple(MIGRATION_SQL);
  await runBrandModelUpgrade();
  await seedDefaultSettings();
  await seedSystemTemplates();

  // Hardening: when databases are wiped and reseeded, the deprecated flags
  // must be applied AFTER system templates are inserted.
  await markDeprecatedTemplates();

  console.log("Migrations completed.");
}

const invokedPath = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (invokedPath.endsWith("migrate.ts") || invokedPath.endsWith("migrate.js")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
