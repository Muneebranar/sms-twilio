const Business = require("../models/Business");
const Checkin = require("../models/Checkin");
const InboundEvent = require("../models/InboundEvent");
const { sendComplianceSms } = require("../services/twilioService");

/**
 * POST /api/checkin
 * Handles customer check-in for a given business.
 * Sends compliance SMS only on first check-in.
 */
exports.checkin = async (req, res) => {
  try {
    const { phone, businessSlug } = req.body;
    console.log("📥 Incoming check-in:", { phone, businessSlug });

    if (!phone || !businessSlug) {
      return res.status(400).json({ error: "phone and businessSlug required" });
    }

    // 🔹 Fetch business from DB
    const business = await Business.findOne({ slug: businessSlug });
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // 🔹 Check if customer has checked in before
    const existingCheckin = await Checkin.findOne({ phoneNumber: phone, businessId: business._id });

    // 🔹 Choose Twilio number: business-specific or default
    const fromNumber = business.twilioNumber || process.env.DEFAULT_TWILIO_NUMBER;
    console.log(`📞 Using Twilio number: ${fromNumber}`);

    // 🔹 Send compliance SMS only for first-time check-in
    if (!existingCheckin) {
      try {
        await sendComplianceSms(business, phone, fromNumber);
        console.log("✅ Compliance SMS sent successfully!");
      } catch (smsErr) {
        console.error("❌ Failed to send compliance SMS:", smsErr.message);
      }
    } else {
      console.log("ℹ️ Returning customer — SMS not resent.");
    }

    // 🔹 Create a check-in record
    const checkin = await Checkin.create({
      businessId: business._id,
      phoneNumber: phone,
      timestamp: new Date(),
      smsStatus: existingCheckin ? "skipped" : "sent",
      twilioNumberUsed: fromNumber,
    });

    console.log("💾 Check-in saved:", checkin._id);

    // (Milestone 3 integration will handle rewards here)
    res.json({
      ok: true,
      checkinId: checkin._id,
      businessName: business.name,
      phone,
      points: business.rewardPoints || 1,
      newReward: null,
    });
  } catch (err) {
    console.error("💥 Server error in check-in:", err);
    res.status(500).json({ error: "server error" });
  }
};

/**
 * POST /api/twilio/webhook
 * Handles incoming STOP/START/HELP messages.
 */
exports.twilioWebhook = async (req, res) => {
  try {
    const { From, Body } = req.body;
    const incoming = Body ? Body.trim().toUpperCase() : "";
    const checkin = await Checkin.findOne({ phoneNumber: From }) || null;

    let eventType = "OTHER";
    if (incoming.includes("STOP")) eventType = "STOP";
    else if (incoming.includes("START")) eventType = "START";
    else if (incoming.includes("HELP")) eventType = "HELP";

    const event = await InboundEvent.create({
      fromNumber: From,
      body: Body,
      eventType,
      checkinId: checkin ? checkin._id : null,
      raw: req.body,
    });

    if (checkin) {
      checkin.unsubscribed = eventType === "STOP";
      await checkin.save();
    }

    console.log(`📩 Webhook event received: ${eventType}`);
    res.send("<Response></Response>");
  } catch (err) {
    console.error("💥 Webhook error:", err);
    res.status(500).send("<Response></Response>");
  }
};



exports.getKioskBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🟢 Kiosk request for slug: ${slug}`);

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      ok: true,
      business,
      message: `Loaded kiosk for ${business.name}`,
    });
  } catch (err) {
    console.error('❌ Failed to load kiosk:', err);
    res.status(500).json({ error: 'server error' });
  }
};