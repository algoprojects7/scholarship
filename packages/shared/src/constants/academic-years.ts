/** Indian academic year (April–March), e.g. `2025-26`. */
export function getCurrentAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  const endYearSuffix = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYearSuffix}`;
}

export const CURRENT_ACADEMIC_YEAR = getCurrentAcademicYear();
