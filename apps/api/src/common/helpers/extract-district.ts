import { Prisma } from '@scholarship/database';

export function extractDistrict(
  contactAddress: Prisma.JsonValue | null,
): string | null {
  if (
    !contactAddress ||
    typeof contactAddress !== 'object' ||
    Array.isArray(contactAddress)
  ) {
    return null;
  }

  const district = (contactAddress as Record<string, unknown>).district;
  if (district === undefined || district === null) {
    return null;
  }

  const value = String(district).trim();
  return value.length > 0 ? value : null;
}
