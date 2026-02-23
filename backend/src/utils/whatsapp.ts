export function normalizeWhatsappPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function buildWhatsappUrl(phone: string, message: string): string {
  const clean = normalizeWhatsappPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encodedMessage}`;
}
