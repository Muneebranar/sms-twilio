// // const Papa = require('papaparse');

// // /**
// //  * Parse CSV file and validate rows
// //  * @param {Buffer} fileBuffer - CSV file buffer
// //  * @param {Object} business - Business document
// //  * @returns {Object} { validRows, errors }
// //  */
// // exports.parseCSV = async (fileBuffer, business) => {
// //   return new Promise((resolve) => {
// //     const fileContent = fileBuffer.toString('utf-8');
    
// //     Papa.parse(fileContent, {
// //       header: true,
// //       skipEmptyLines: true,
// //       transformHeader: (header) => header.trim().toLowerCase(),
// //       complete: (results) => {
// //         const validRows = [];
// //         const errors = [];
        
// //         results.data.forEach((row, index) => {
// //           const rowNum = index + 2; // +2 because of header and 0-index
          
// //           // Required fields
// //           const phone = row.phone || row.phonenumber || row['phone number'];
// //           const points = parseInt(row.points || '0');
          
// //           // Validation
// //           if (!phone) {
// //             errors.push({
// //               row: rowNum,
// //               phone: phone || 'N/A',
// //               reason: 'Missing phone number'
// //             });
// //             return;
// //           }
          
// //           // Normalize phone number
// //           let normalizedPhone = phone.toString().replace(/\D/g, '');
// //           if (normalizedPhone.length === 10) {
// //             normalizedPhone = '1' + normalizedPhone;
// //           }
// //           normalizedPhone = '+' + normalizedPhone;
          
// //           // Validate phone format
// //           if (normalizedPhone.length < 11 || normalizedPhone.length > 15) {
// //             errors.push({
// //               row: rowNum,
// //               phone,
// //               reason: 'Invalid phone format'
// //             });
// //             return;
// //           }
          
// //           // Build customer object
// //           validRows.push({
// //             businessId: business._id,
// //             phone: normalizedPhone,
// //             countryCode: normalizedPhone.substring(0, normalizedPhone.length - 10),
// //             points: isNaN(points) ? 0 : points,
// //             metadata: {
// //               name: row.name || row.customername || '',
// //               email: row.email || '',
// //               notes: row.notes || ''
// //             }
// //           });
// //         });
        
// //         resolve({ validRows, errors });
// //       },
// //       error: (error) => {
// //         resolve({
// //           validRows: [],
// //           errors: [{ row: 0, phone: 'N/A', reason: `Parse error: ${error.message}` }]
// //         });
// //       }
// //     });
// //   });



// // };





// // utils/csvParser.js
// const csv = require("csv-parser");
// const { Readable } = require("stream");
// const phoneUtil = require("./phoneValidator");

// /**
//  * Parse CSV buffer and validate rows
//  * @param {Buffer} buffer - CSV file buffer
//  * @param {Object} business - Business object
//  * @returns {Promise<Object>} - { validRows, errors }
//  */
// async function parseCSV(buffer, business) {
//   return new Promise((resolve, reject) => {
//     const validRows = [];
//     const errors = [];
//     let rowIndex = 0;

//     const stream = Readable.from(buffer.toString());

//     stream
//       .pipe(csv())
//       .on("data", (row) => {
//         rowIndex++;

//         // Expected columns: phone, points (optional), name (optional), email (optional)
//         const phone = row.phone || row.Phone || row.PHONE || row.phoneNumber;
//         const points = parseInt(row.points || row.Points || "0", 10);
//         const name = row.name || row.Name || "";
//         const email = row.email || row.Email || "";

//         // Validate phone
//         if (!phone) {
//           errors.push({
//             row: rowIndex,
//             reason: "Missing phone number",
//             data: row,
//           });
//           return;
//         }

//         const normalizedPhone = phoneUtil.normalizePhone(phone);
//         if (!phoneUtil.isValidPhone(normalizedPhone)) {
//           errors.push({
//             row: rowIndex,
//             reason: "Invalid phone format",
//             data: row,
//           });
//           return;
//         }

//         // Add to valid rows
//         validRows.push({
//           phone: normalizedPhone,
//           countryCode: phoneUtil.extractCountryCode(normalizedPhone),
//           points: isNaN(points) ? 0 : points,
//           metadata: {
//             name: name.trim(),
//             email: email.trim(),
//           },
//           businessId: business._id,
//         });
//       })
//       .on("end", () => {
//         resolve({ validRows, errors });
//       })
//       .on("error", (err) => {
//         reject(err);
//       });
//   });
// }

// module.exports = { parseCSV };


// utils/csvParser.js
const csv = require("csv-parser");
const { Readable } = require("stream");

/**
 * Normalize phone number to E.164 format
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

  // Otherwise return as-is with +
  return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
}

/**
 * Validate phone number format
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
 */
function extractCountryCode(phone) {
  if (!phone || !phone.startsWith("+")) return "+1";

  // For US/Canada
  if (phone.startsWith("+1")) return "+1";

  // For others, extract first 1-4 digits after +
  const match = phone.match(/^\+(\d{1,4})/);
  return match ? "+" + match[1] : "+1";
}

/**
 * Parse CSV buffer and validate rows
 * @param {Buffer} buffer - CSV file buffer
 * @param {Object} business - Business object
 * @returns {Promise<Object>} - { validRows, errors }
 */
async function parseCSV(buffer, business) {
  return new Promise((resolve, reject) => {
    const validRows = [];
    const errors = [];
    let rowIndex = 0;

    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on("data", (row) => {
        rowIndex++;

        // Expected columns: phone, points (optional), name (optional), email (optional)
        const phone = row.phone || row.Phone || row.PHONE || row.phoneNumber;
        const points = parseInt(row.points || row.Points || "0", 10);
        const name = row.name || row.Name || "";
        const email = row.email || row.Email || "";

        // Validate phone
        if (!phone) {
          errors.push({
            row: rowIndex,
            reason: "Missing phone number",
            data: row,
          });
          return;
        }

        const normalizedPhone = normalizePhone(phone);
        if (!isValidPhone(normalizedPhone)) {
          errors.push({
            row: rowIndex,
            reason: "Invalid phone format",
            data: row,
          });
          return;
        }

        // Add to valid rows
        validRows.push({
          phone: normalizedPhone,
          countryCode: extractCountryCode(normalizedPhone),
          points: isNaN(points) ? 0 : points,
          metadata: {
            name: name.trim(),
            email: email.trim(),
          },
          businessId: business._id,
        });
      })
      .on("end", () => {
        resolve({ validRows, errors });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = { parseCSV, normalizePhone, isValidPhone, extractCountryCode };