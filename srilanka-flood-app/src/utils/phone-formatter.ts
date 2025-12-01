// Phone number formatter for Sri Lankan phone numbers
// Format: 0XXXXXXXXX (10 digits, no spaces)
// Example: 0765367297

export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  let cleaned = value.replace(/\D/g, '')
  
  // If starts with +94, convert to local format
  if (cleaned.length > 0 && !cleaned.startsWith('0')) {
    // If it's 9 digits (without leading 0), add 0 prefix
    if (cleaned.length <= 9) {
      cleaned = '0' + cleaned
    }
  }
  
  // Limit to 10 digits (0 + 9 digits)
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10)
  }
  
  // If user starts typing without 0, add it
  if (cleaned.length > 0 && !cleaned.startsWith('0')) {
    // If it's 9 digits, add 0 prefix
    if (cleaned.length <= 9) {
      cleaned = '0' + cleaned
    } else {
      // If more than 9 digits, take first 9 and add 0
      cleaned = '0' + cleaned.substring(0, 9)
    }
  }
  
  return cleaned
}

export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's exactly 10 digits and starts with 0
  return cleaned.length === 10 && cleaned.startsWith('0')
}

