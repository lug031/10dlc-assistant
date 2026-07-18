export const LW_EMAIL_BRAND_REQUEST_BODY = `Saludos,

Espero que estés bien. Debido a unas nuevas regulaciones que han surgido en cuanto a la mensajería de texto, se requiere que registremos todas las marcas, en su caso {{brandName}}, que están enviando mensajes de texto a consumidores. Nuestro equipo se va a encargar de ese registro, pero vamos a necesitar la siguiente información para poder completarlo:

- Nombre legal de la entidad
- EIN / SS Patronal
- Dirección registrada de la empresa
- Documento de Registro de Comerciante

Esta información es requerida por los operadores móviles en EE. UU. y Puerto Rico para validar la identidad de la marca y asegurar el cumplimiento con las regulaciones de mensajería.

Por otro lado, otro requerimiento es que la entidad tenga una política de privacidad publicada y accesible, en cumplimiento con las regulaciones de mensajería. Hemos notado que el sitio web de {{brandName}} ha estado presentando intermitencias durante el día, por lo que, para no retrasar el proceso de registro, podemos utilizar como alternativa su página oficial de Facebook. Adjunto te comparto una política de privacidad que pueden publicar allí, y esa publicación nos serviría para completar el registro de la marca.

Quedamos pendientes a cualquier pregunta que tengas.`;

export function buildIntakeEmailSubject(brandName: string) {
  return `Registro de Marca ${brandName} LeadWire`;
}

export function buildIntakeEmailBody(input: {
  brandName: string;
  contactName: string;
}) {
  const trimmed = input.contactName.trim();
  const greeting = trimmed ? `Saludos ${trimmed},` : "Saludos,";
  const body = LW_EMAIL_BRAND_REQUEST_BODY.replaceAll(
    "{{brandName}}",
    input.brandName,
  );

  return body.replace(/^Saludos,/, greeting);
}
