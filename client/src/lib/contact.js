export const CONTACT_PHONE_DISPLAY = '+91 98101 48889';
export const CONTACT_PHONE_TEL = '+919810148889';
export const CONTACT_WHATSAPP_NUMBER = '919810148889';

export const CONTACT_PHONE_DISPLAY_2 = '+91 97118 76582';
export const CONTACT_PHONE_TEL_2 = '+919711876582';

export const CONTACT_EMAIL = 'nestoraak@gmail.com';

export function whatsappLink(message) {
  return `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
