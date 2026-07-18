import { marked } from "marked";

export const INTAKE_EMAIL_ATTACHMENT_FILENAME = "template_privacy_policy.docx";

const EMAIL_INLINE_STYLE =
  "font-family: Helvetica, Arial, sans-serif; font-size:16px; font-weight:400; line-height:1.3; color:#000;";

export function buildIntakeEmailSubject(brandName: string): string {
  return `Registro de Marca ${brandName} LeadWire`;
}

export function buildWebsiteIssueNote(brandName: string): string {
  return `Hemos notado que el sitio web de **${brandName}** ha estado presentando intermitencias durante el día, por lo que, para no retrasar el proceso de registro, podemos utilizar como alternativa su página oficial de Facebook. `;
}

function buildGreeting(contactName?: string): string {
  const trimmed = contactName?.trim();
  return trimmed ? `Saludos ${trimmed},` : "Saludos,";
}

function buildIntakeEmailWithPrivacyOnWebsite(input: {
  brandName: string;
  contactName?: string;
}): string {
  const greeting = buildGreeting(input.contactName);

  return `${greeting}

Espero que estés bien. Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso **${input.brandName}**, que están enviando mensajes de texto a consumidores. Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

- Nombre legal de la entidad
- EIN / SS Patronal
- Dirección registrada de la empresa
- Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

Quedamos pendientes a cualquier pregunta que tengas.`;
}

function buildIntakeEmailNeedsPrivacyPolicy(input: {
  brandName: string;
  contactName?: string;
  includeWebsiteIssue: boolean;
  websiteIssueNote?: string;
}): string {
  const greeting = buildGreeting(input.contactName);

  const issueNote = input.includeWebsiteIssue
    ? (input.websiteIssueNote?.trim() || buildWebsiteIssueNote(input.brandName))
    : "";

  const privacyParagraph = issueNote
    ? `Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible, en cumplimiento con las regulaciones de mensajería. ${issueNote}Adjunto te comparto una política de privacidad que pueden publicar allí, y esa publicación nos serviría para completar el registro de la marca.`
    : `Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible, en cumplimiento con las regulaciones de mensajería. Adjunto te comparto una política de privacidad que pueden publicar en su sitio web, y esa publicación nos serviría para completar el registro de la marca.`;

  return `${greeting}

Espero que estés bien. Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso **${input.brandName}**, que están enviando mensajes de texto a consumidores. Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

- Nombre legal de la entidad
- EIN / SS Patronal
- Dirección registrada de la empresa
- Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

${privacyParagraph}

Quedamos pendientes a cualquier pregunta que tengas.`;
}

export function buildIntakeEmailMarkdown(input: {
  brandName: string;
  contactName?: string;
  hasAccessiblePrivacyPolicy: boolean;
  includeWebsiteIssue: boolean;
  websiteIssueNote?: string;
}): string {
  if (input.hasAccessiblePrivacyPolicy) {
    return buildIntakeEmailWithPrivacyOnWebsite(input);
  }

  return buildIntakeEmailNeedsPrivacyPolicy(input);
}

function applyEmailInlineStyles(html: string): string {
  return html
    .replace(/<p>/g, `<p style="${EMAIL_INLINE_STYLE} margin:0 0 1em 0;">`)
    .replace(/<ul>/g, `<ul style="${EMAIL_INLINE_STYLE} margin:0 0 1em 0; padding-left:1.5em;">`)
    .replace(/<li>/g, `<li style="${EMAIL_INLINE_STYLE} margin:0 0 0.35em 0;">`)
    .replace(/<strong>/g, `<strong style="font-weight:700;">`)
    .replace(/<br>/g, `<br style="${EMAIL_INLINE_STYLE}">`);
}

export function markdownToEmailHtml(markdown: string): string {
  const raw = marked.parse(markdown, { async: false }) as string;
  return applyEmailInlineStyles(raw.trim());
}

export function markdownToPlainEmailText(markdown: string): string {
  const html = markdownToEmailHtml(markdown);
  if (typeof document === "undefined") {
    return markdown.replace(/\*\*(.*?)\*\*/g, "$1");
  }

  const container = document.createElement("div");
  container.innerHTML = html;
  return container.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

export async function copyEmailBodyToClipboard(markdown: string): Promise<void> {
  const html = markdownToEmailHtml(markdown);
  const plain = markdownToPlainEmailText(markdown);

  if (
    typeof ClipboardItem !== "undefined" &&
    typeof navigator.clipboard.write === "function"
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      }),
    ]);
    return;
  }

  await navigator.clipboard.writeText(plain);
}
