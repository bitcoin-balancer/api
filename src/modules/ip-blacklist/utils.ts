/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sanitizes an IP Address by lowercasing it and removing all whitespaces (if any).
 * @param ip
 * @returns string
 */
const sanitizeIP = (rawIP: string): string =>
  typeof rawIP === 'string' ? rawIP.toLowerCase().replace(/\s+/g, '') : '';

/**
 * Sanitizes all the values required to interact with IP Blacklist Records.
 * @param rawIP
 * @param rawNotes
 * @returns { sanitizedIP: string, sanitizedNotes: string | undefined }
 */
const sanitizeRecordData = (
  rawIP: string,
  rawNotes: string | undefined,
): { sanitizedIP: string; sanitizedNotes: string | undefined } => ({
  sanitizedIP: sanitizeIP(rawIP),
  sanitizedNotes: typeof rawNotes === 'string' && rawNotes.length ? rawNotes : undefined,
});

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { sanitizeIP, sanitizeRecordData };
