export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPhoneNumber(phone: string): string {
  // Formatea un número de teléfono para display
  return phone.replace(/(\d{4})(\d{7})/, '$1-$2');
}

export function getWhatsAppLink(message?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492996726610';
  const defaultMessage = 'Hola, estoy interesado en sus productos. Me gustaría recibir más información.';
  const text = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${phone}?text=${text}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
