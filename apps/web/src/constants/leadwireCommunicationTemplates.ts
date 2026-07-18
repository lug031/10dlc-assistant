/** Textos operativos Leadwire — correos. Literales del proceso documentado. */

export type LeadwireCommunicationTemplateKey =
  | "LW_EMAIL_BRAND_REQUEST"
  | "LW_EMAIL_PRIVACY_SITE_IDENTIFIED"
  | "LW_EMAIL_PRIVACY_NOT_FOUND"
  | "LW_EMAIL_PRIVACY_FOLLOWUP";

export interface LeadwireEmailTemplate {
  subject: string | null;
  body: string | null;
}

export const LEADWIRE_COMMUNICATION_TEMPLATES: Record<
  LeadwireCommunicationTemplateKey,
  LeadwireEmailTemplate
> = {
  LW_EMAIL_BRAND_REQUEST: {
    subject: "Registro de Marca <Brand Name> LeadWire",
    body: `Saludos,

Espero que estés bien. Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso <Brand Name>, que están enviando mensajes de texto a consumidores. Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

- Nombre legal de la entidad
- EIN / SS Patronal
- Dirección registrada de la empresa
- Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible, en cumplimiento con las regulaciones de mensajería. Hemos notado que el sitio web de <Brand Name> ha estado presentando intermitencias durante el día, por lo que, para no retrasar el proceso de registro, podemos utilizar como alternativa su página oficial de Facebook. Adjunto te comparto una política de privacidad que pueden publicar allí, y esa publicación nos serviría para completar el registro de la marca.

Quedamos pendientes a cualquier pregunta que tengas.`,
  },

  LW_EMAIL_PRIVACY_SITE_IDENTIFIED: {
    subject: null,
    body: `Saludos,

Hemos identificado el siguiente sitio web:

<Website URL>

Entendemos que corresponde al sitio oficial de <Brand Name>.

De ser así, únicamente sería necesario incorporar la política de privacidad en dicho sitio web.

Quedamos atentos a su confirmación.`,
  },

  LW_EMAIL_PRIVACY_NOT_FOUND: {
    subject: null,
    body: `Saludos,

Para continuar con el proceso, es necesario contar con una Política de Privacidad publicada y accesible.

Hemos revisado su sitio web, <Website URL>, pero no hemos encontrado una Política de Privacidad publicada.

Si les resulta más sencillo, como alternativa pueden publicar la Política de Privacidad directamente en su página de Facebook y compartirnos el enlace correspondiente.

Asimismo, si lo prefieren, pueden enviarnos el contenido de la Política de Privacidad y nosotros podemos publicarla en una página administrada por Leadwire, proporcionándoles el enlace para su uso.

Quedamos atentos a sus comentarios para poder continuar con el proceso.`,
  },

  LW_EMAIL_PRIVACY_FOLLOWUP: {
    subject: null,
    body: `Saludos,

Espero que se encuentren bien.

Les escribo para dar seguimiento a mi correo anterior respecto a la Política de Privacidad necesaria para continuar con el proceso.

Como comenté previamente, no encontramos una Política de Privacidad publicada en su sitio web.

Si les resulta más conveniente, pueden publicarla directamente en su página de Facebook y compartirnos el enlace correspondiente.

Alternativamente, también pueden enviarnos el contenido de la política para evaluar otras opciones de publicación.

Quedamos atentos a sus comentarios para poder avanzar con el proceso.`,
  },
};

export const LEADWIRE_COMMUNICATION_LABELS: Record<
  LeadwireCommunicationTemplateKey,
  string
> = {
  LW_EMAIL_BRAND_REQUEST: "Solicitud de registro de marca (PASO 1)",
  LW_EMAIL_PRIVACY_SITE_IDENTIFIED: "Privacidad — sitio identificado",
  LW_EMAIL_PRIVACY_NOT_FOUND: "Privacidad — política no encontrada",
  LW_EMAIL_PRIVACY_FOLLOWUP: "Privacidad — follow-up",
};

/** PASO 1 — solo en Intake, antes de convertir a marca. */
export const INTAKE_COMMUNICATION_KEYS: LeadwireCommunicationTemplateKey[] = [
  "LW_EMAIL_BRAND_REQUEST",
];

/** Correos operativos una vez la marca existe (privacidad / campaña). */
export const BRAND_COMMUNICATION_KEYS: LeadwireCommunicationTemplateKey[] = [
  "LW_EMAIL_PRIVACY_SITE_IDENTIFIED",
  "LW_EMAIL_PRIVACY_NOT_FOUND",
  "LW_EMAIL_PRIVACY_FOLLOWUP",
];
