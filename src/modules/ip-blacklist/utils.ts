

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Sanitizes an IP Address by lowercasing it and removing all whitespaces (if any).
 * @param ip
 * @returns string
 */
const sanitizeIP = (rawIP: string): string => (
  typeof rawIP === 'string' ? rawIP.toLowerCase().replace(/\s+/g, '') : ''
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  sanitizeIP,
};
