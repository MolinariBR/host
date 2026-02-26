export function normalizeWhatsappPhone(phone) {
    return phone.replace(/[^\d]/g, "");
}
export function buildWhatsappUrl(phone, message) {
    const clean = normalizeWhatsappPhone(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${clean}?text=${encodedMessage}`;
}
