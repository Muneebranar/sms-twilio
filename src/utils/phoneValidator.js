// // utils/phoneValidator.js

// /**
//  * Normalize phone number to E.164 format
//  * @param {string} phone - Raw phone number
//  * @returns {string} - Normalized phone (e.g., +12145551234)
//  */
// function normalizePhone(phone) {
//   if (!phone) return "";

//   // Remove all non-digit characters except +
//   let cleaned = phone.replace(/[^\d+]/g, "");

//   // If starts with +1 or +, keep it
//   if (cleaned.startsWith("+")) {
//     return cleaned;
//   }

//   // If 11 digits starting with 1, add +
//   if (cleaned.length === 11 && cleaned.startsWith("1")) {
//     return "+" + cleaned;
//   }

//   // If 10 digits, assume US/Canada (+1)
//   if (cleaned.length === 10) {
//     return "+1" + cleaned;
//   }

//   // Otherwise return as-is
//   return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
// }

// /**
//  * Validate phone number format
//  * @param {string} phone - Normalized phone
//  * @returns {boolean}
//  */
// function isValidPhone(phone) {
//   if (!phone) return false;

//   // Must start with +
//   if (!phone.startsWith("+")) return false;

//   // US/Canada: +1 followed by 10 digits
//   const usRegex = /^\+1\d{10}$/;
//   if (usRegex.test(phone)) return true;

//   // Generic international: + followed by 7-15 digits
//   const intlRegex = /^\+\d{7,15}$/;
//   return intlRegex.test(phone);
// }

// /**
//  * Extract country code from phone
//  * @param {string} phone - Normalized phone
//  * @returns {string} - Country code (e.g., "+1")
//  */
// function extractCountryCode(phone) {
//   if (!phone || !phone.startsWith("+")) return "+1";

//   // For US/Canada
//   if (phone.startsWith("+1")) return "+1";

//   // For others, extract first 1-4 digits after +
//   const match = phone.match(/^\+(\d{1,4})/);
//   return match ? "+" + match[1] : "+1";
// }

// module.exports = {
//   normalizePhone,
//   isValidPhone,
//   extractCountryCode,
// };




// utils/phoneValidator.js

/**
 * Normalize phone number to E.164 format
 * @param {string} phone - Raw phone number
 * @returns {string} - Normalized phone (e.g., +12145551234)
 */
function normalizePhone(phone) {
  if (!phone) return "";

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +1 or +, keep it
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If 11 digits starting with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return "+" + cleaned;
  }

  // If 10 digits, assume US/Canada (+1)
  if (cleaned.length === 10) {
    return "+1" + cleaned;
  }

  // Otherwise return as-is
  return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
}

/**
 * Validate phone number format
 * @param {string} phone - Normalized phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  if (!phone) return false;

  // Must start with +
  if (!phone.startsWith("+")) return false;

  // US/Canada: +1 followed by 10 digits
  const usRegex = /^\+1\d{10}$/;
  if (usRegex.test(phone)) return true;

  // Generic international: + followed by 7-15 digits
  const intlRegex = /^\+\d{7,15}$/;
  return intlRegex.test(phone);
}

/**
 * Extract country code from phone
 * @param {string} phone - Normalized phone
 * @returns {string} - Country code (e.g., "+1")
 */
function extractCountryCode(phone) {
  if (!phone || !phone.startsWith("+")) return "+1";

  // For US/Canada
  if (phone.startsWith("+1")) return "+1";

  // For others, extract first 1-4 digits after +
  const match = phone.match(/^\+(\d{1,4})/);
  return match ? "+" + match[1] : "+1";
}

module.exports = {
  normalizePhone,
  isValidPhone,
  extractCountryCode,
};