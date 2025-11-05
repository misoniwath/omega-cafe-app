/**
 * Utility functions for sanitizing user input
 */

/**
 * Sanitize text input - trim whitespace and limit length
 * @param {string} str - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeText(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove angle brackets to prevent HTML injection
}

/**
 * Sanitize phone number - keep only digits, spaces, and common phone characters
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone
    .trim()
    .slice(0, 20) // Limit phone length
    .replace(/[^0-9+\-\s()]/g, ''); // Keep only digits and common phone characters
}

/**
 * Sanitize name - remove special characters except spaces and common name characters
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized name
 */
export function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name
    .trim()
    .slice(0, 100) // Limit name length
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Sanitize address - allow more characters for addresses
 * @param {string} address - Address to sanitize
 * @returns {string} Sanitized address
 */
export function sanitizeAddress(address) {
  if (typeof address !== 'string') return '';
  return address
    .trim()
    .slice(0, 300) // Limit address length
    .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Sanitize note - allow more characters for notes
 * @param {string} note - Note to sanitize
 * @returns {string} Sanitized note
 */
export function sanitizeNote(note) {
  if (typeof note !== 'string') return '';
  return note
    .trim()
    .slice(0, 500) // Limit note length
    .replace(/[<>]/g, ''); // Remove angle brackets
}

