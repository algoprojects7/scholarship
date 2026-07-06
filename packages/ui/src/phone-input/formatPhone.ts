const DEFAULT_COUNTRY_CODE = '+91';

/**
 * Formats phone for display: +91 98765 43210
 */
export function formatPhone(
  mobile: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  const digits = mobile.replace(/\D/g, '');

  if (!digits) {
    return countryCode;
  }

  if (digits.length <= 5) {
    return `${countryCode} ${digits}`;
  }

  return `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/**
 * E.164 format without spaces: +919876543210
 */
export function formatPhoneE164(
  mobile: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  const digits = mobile.replace(/\D/g, '');
  return `${countryCode}${digits}`;
}

export { DEFAULT_COUNTRY_CODE };
