/**
 * Helper to validate and format phone numbers for the WhatsApp Click-to-Chat API.
 * Format: https://wa.me/<number>?text=<encoded_text>
 * Where <number> is a full phone number in international format without plus signs, dashes, or brackets.
 */

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Edenexa, I'm interested in getting a website for my business. Please share your services and pricing.";

/**
 * Sanitizes an input phone number into pure digits for wa.me.
 * Example: "+91 98765 43210" -> "919876543210"
 */
export function sanitizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // If the number is exactly 10 digits, prepend "91"
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  // International numbers are typically 10 to 15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }
  return cleaned;
}

/**
 * Validates whether a phone number meets international WhatsApp standards (10 to 15 digits).
 */
export function isValidWhatsAppNumber(phone: string | null | undefined): boolean {
  return sanitizePhoneNumber(phone) !== null;
}

/**
 * Builds a validated WhatsApp click-to-chat URL.
 * Returns null if the phone number is missing or invalid.
 */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string | null {
  const sanitized = sanitizePhoneNumber(phone);
  if (!sanitized) {
    return null;
  }
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${sanitized}?text=${encodedText}`;
}

/**
 * Generates an inquiry message tailored to a specific package and optional business type.
 */
export function buildPackageInquiryMessage(packageName: string, businessType?: string): string {
  if (businessType) {
    return `Hi Edenexa, I'm interested in the ${packageName} package for my ${businessType}. Could you please share project details and delivery timeline?`;
  }
  return `Hi Edenexa, I'm interested in the ${packageName} package. Could you please share project details and delivery timeline?`;
}

/**
 * Generates an inquiry follow-up message for admin contacting a lead.
 * Note: Never includes private admin notes or sensitive internal remarks.
 */
export function buildLeadFollowUpMessage(customerName: string, businessName?: string | null): string {
  const greeting = customerName ? `Hi ${customerName.trim()},` : 'Hello,';
  const biz = businessName ? ` regarding ${businessName.trim()}` : '';
  return `${greeting} thank you for reaching out to Edenexa${biz}! We reviewed your project requirements and would love to discuss the next steps with you.`;
}
