const Customer = require("../models/Customer");
const Business = require("../models/Business");
const { parseCSV } = require("../utils/csvParser");

exports.importCustomersCSV = async (req, res) => {
  try {
    // Determine target business id (always keep it as a string)
    const requestedBusinessId = req.body.businessId;
    console.log("adasdadasdasdasdasdasdasdas",requestedBusinessId,req.user.role);
    const targetBusinessId =
      req.user.role === "master"
        ? String(requestedBusinessId)
        : String(req.user.businessId); // normalize to string

    console.log("📦 CSV Import request:", {
      userRole: req.user.role,
      userId: req.user.id,
      requestedBusinessId,
      actualBusinessId: targetBusinessId,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
    });

    // Validate businessId
    if (
      !targetBusinessId ||
      targetBusinessId === "null" ||
      targetBusinessId === "undefined"
    ) {
      return res.status(400).json({
        ok: false,
        error: "Business ID is required for CSV import.",
      });
    }

    // Find the business
    const business = await Business.findById(targetBusinessId);
    if (!business) {
      return res.status(404).json({
        ok: false,
        error: "Business not found.",
      });
    }

    console.log("✅ Business found:", business.name);

    // Role-based access control
    if (
      req.user.role === "admin" &&
      String(req.user.businessId) !== targetBusinessId
    ) {
      console.log(
        "❌ Access denied: Admin trying to import to different business"
      );
      return res.status(403).json({
        ok: false,
        error: "Access denied. You can only import to your assigned business.",
      });
    }

    if (req.user.role === "staff") {
      console.log("❌ Access denied: Staff cannot import CSV");
      return res.status(403).json({
        ok: false,
        error: "Staff members cannot import CSV files.",
      });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No CSV file uploaded.",
      });
    }

    // File size limit (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        ok: false,
        error: "File too large (max 5MB).",
      });
    }

    console.log("📊 Parsing CSV file...");

    // Parse CSV into rows
    const { validRows, errors } = await parseCSV(req.file.buffer, business);

    console.log(
      `📊 Parse results: ${validRows.length} valid rows, ${errors.length} errors`
    );

    if (!validRows || validRows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No valid rows found in CSV file.",
        errors,
      });
    }

    // Process in batches
    const BATCH_SIZE = 500;
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [...errors],
    };

    console.log(
      `🔄 Processing ${validRows.length} rows in batches of ${BATCH_SIZE}...`
    );

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

      for (const row of batch) {
        try {
          const existing = await Customer.findOne({
            phone: row.phone,
            businessId: business._id,
          });

          if (existing) {
            // Update existing customer
            existing.points += row.points;

            existing.metadata = {
              ...existing.metadata,
              name: row.metadata.name || existing.metadata?.name,
              email: row.metadata.email || existing.metadata?.email,
            };

            await existing.save();
            results.updated++;
            console.log(
              `✓ Updated: ${row.phone} (total points: ${existing.points})`
            );
          } else {
            // Create new customer
            const newCustomer = await Customer.create({
              phone: row.phone,
              countryCode: row.countryCode,
              businessId: business._id,
              points: row.points,
              subscriberStatus: "active",
              consentGiven: false,
              ageVerified: false,
              firstCheckinAt: new Date(),
              metadata: {
                name: row.metadata.name,
                email: row.metadata.email,
              },
            });

            results.created++;
            console.log(`✓ Created: ${row.phone} (points: ${row.points})`);
          }
        } catch (err) {
          console.error(`❌ Error processing ${row.phone}:`, err.message);
          results.errors.push({
            phone: row.phone,
            reason: err.message || "Database error",
          });
          results.skipped++;
        }
      }
    }

    console.log("✅ CSV Import completed:", {
      totalRows: validRows.length,
      created: results.created,
      updated: results.updated,
      skipped: results.skipped,
      errorCount: results.errors.length,
    });

    res.json({
      ok: true,
      message: "CSV import completed successfully.",
      results: {
        totalRows: validRows.length,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors,
      },
    });
  } catch (err) {
    console.error("❌ CSV Import Error:", err);
    res.status(500).json({
      ok: false,
      error: "Import failed: " + err.message,
    });
  }
};



/**
 * Get import history (for future implementation)
 */
exports.getImportHistory = async (req, res) => {
  try {
    res.json({
      ok: true,
      message: "Import history not yet implemented.",
      history: [],
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};

module.exports = {
  importCustomersCSV: exports.importCustomersCSV,
  getImportHistory: exports.getImportHistory,
  downloadSampleCSV: exports.downloadSampleCSV,
};
