/**
 * Áquila contact channels. Fill WHATSAPP_NUMBER (international format, digits
 * only, e.g. '351912345678') and every "Pedir diagnóstico" opens WhatsApp.
 */
export const WHATSAPP_NUMBER = '';
export const CONTACT_EMAIL = 'studio@aquila.design';

export const DIAGNOSIS_MESSAGE = 'Olá! Gostaria de pedir um diagnóstico para o meu negócio.';

export const whatsappHref = (text = DIAGNOSIS_MESSAGE) =>
  WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : null;

export const emailHref = (subject = 'Diagnóstico Áquila') =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
