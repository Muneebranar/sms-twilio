const express = require("express");
const router = express.Router();
const { sendComplianceSms } = require("../services/twilioService");
const Business = require("../models/Business");
const Checkin = require("../models/Checkin");

// 🧩 Handle kiosk check-in
router.post("/checkin", async (req, res) => {
  console.log("📥 Incoming check-in:", req.body);

  try {
    const { phone, countryCode = "", businessSlug, fromNumber } = req.body;

    if (!phone || !businessSlug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format phone number for Twilio
    let formattedPhone = phone.replace(/\D/g, "");
    if (countryCode) formattedPhone = countryCode + formattedPhone;
    if (!formattedPhone.startsWith("+")) formattedPhone = "+" + formattedPhone;

    // Find business in DB
    const business = await Business.findOne({ slug: businessSlug });
    if (!business) return res.status(404).json({ error: "Business not found" });

    // Send compliance SMS
    const smsResult = await sendComplianceSms(business, formattedPhone, fromNumber);

    // Save check-in to MongoDB
    const checkin = await Checkin.create({
      phone: formattedPhone,
      businessId: business._id,
      sentCompliance: true,
      consentGiven: true,
    });

    // Respond to frontend with info
    res.json({
      success: true,
      message: "Check-in successful",
      numberSentTo: formattedPhone,
      fromNumberUsed: smsResult.from,
      checkinId: checkin._id,
    });

    console.log(`📤 Message sent from: ${smsResult.from} to: ${formattedPhone}`);
  } catch (err) {
    console.error("❌ Error in /checkin:", err.message || err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Additional routes (Twilio webhook, kiosk page by slug)
router.post("/webhook/twilio", require("../middleware/twilioValidator"), require("../controllers/kioskController").twilioWebhook);
router.get("/:slug", require("../controllers/kioskController").getKioskBySlug);

module.exports = router;
