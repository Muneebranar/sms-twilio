const Business = require("../models/Business");
const Checkin = require("../models/Checkin");
const InboundEvent = require("../models/InboundEvent");
const { sendComplianceSms } = require("../services/twilioService");
const twilio = require("twilio");

/**
 * 🟢 POST /api/checkin
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

    // 🔹 Check if this phone already checked in for this business
    const existingCheckin = await Checkin.findOne({
      phoneNumber: phone,
      businessId: business._id,
    });

    // 🔹 Choose Twilio number (business specific or default)
    const fromNumber = business.twilioNumber || process.env.DEFAULT_TWILIO_NUMBER;
    console.log(`📞 Using Twilio number: ${fromNumber}`);

    // 🔹 Send compliance SMS only on first-time check-in
    if (!existingCheckin) {
      try {
        await sendComplianceSms(business, phone, fromNumber);
        console.log("✅ Compliance SMS sent successfully!");
      } catch (smsErr) {
        console.error("❌ Failed to send compliance SMS:", smsErr.message);
      }
    } else {
      console.log("ℹ️ Returning customer — compliance SMS not resent.");
    }

    // 🔹 Save check-in record
    const checkin = await Checkin.create({
      businessId: business._id,
      phoneNumber: phone,
      timestamp: new Date(),
      smsStatus: existingCheckin ? "skipped" : "sent",
      twilioNumberUsed: fromNumber,
    });

    console.log("💾 Check-in saved:", checkin._id);

    // 🔹 Respond
    res.json({
      ok: true,
      checkinId: checkin._id,
      businessName: business.name,
      phone,
      points: business.rewardPoints || 1,
      newReward: null, // placeholder for future rewards logic
    });
  } catch (err) {
    console.error("💥 Server error in check-in:", err);
    res.status(500).json({ error: "server error" });
  }
};

/**
 * 💬 POST /api/twilio/webhook
 * Handles incoming STOP / START / HELP / OTHER messages from Twilio.
 * Logs event, updates subscription status, and auto-replies.
 */
exports.twilioWebhook = async (req, res) => {
  try {
    const { From, Body } = req.body;
    const incoming = Body ? Body.trim().toUpperCase() : "";

    // 🔹 Try to find existing checkin by sender’s phone
    const checkin = await Checkin.findOne({ phoneNumber: From }) || null;

    // 🔹 Detect message type
    let eventType = "OTHER";
    if (incoming.includes("STOP")) eventType = "STOP";
    else if (incoming.includes("START")) eventType = "START";
    else if (incoming.includes("HELP")) eventType = "HELP";

    // 🔹 Save event log
    await InboundEvent.create({
      fromNumber: From,
      body: Body,
      eventType,
      checkinId: checkin ? checkin._id : null,
      raw: req.body,
    });

    // 🔹 Update checkin subscription status
    if (checkin) {
      if (eventType === "STOP") checkin.unsubscribed = true;
      else if (eventType === "START") checkin.unsubscribed = false;
      await checkin.save();
    }

    console.log(`📩 Webhook event received from ${From}: ${eventType}`);

    // 🔹 Prepare TwiML auto-response
    const twiml = new twilio.twiml.MessagingResponse();

    if (eventType === "STOP") {
      twiml.message("You have been unsubscribed. Reply START to rejoin.");
    } else if (eventType === "START") {
      twiml.message("You are now subscribed again. Thank you!");
    } else if (eventType === "HELP") {
      twiml.message("Reply START to subscribe again or STOP to unsubscribe.");
    } else {
      // For any other message
      twiml.message("Thanks for your message! We'll get back to you soon.");
    }

    // 🔹 Send XML response back to Twilio
    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.error("💥 Webhook error:", err);
    res.status(500).send("<Response></Response>");
  }
};

/**
 * 🏪 GET /api/kiosk/:slug
 * Returns business (kiosk) details by slug.
 */
exports.getKioskBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🟢 Kiosk request for slug: ${slug}`);

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({
      ok: true,
      business,
      message: `Loaded kiosk for ${business.name}`,
    });
  } catch (err) {
    console.error("❌ Failed to load kiosk:", err);
    res.status(500).json({ error: "server error" });
  }
};
