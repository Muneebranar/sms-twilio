const Business = require('../models/Business');
const Checkin = require('../models/Checkin');
const InboundEvent = require('../models/InboundEvent');
const { sendComplianceSms } = require('../services/twilioService'); // ✅ destructuring import

exports.checkin = async (req, res) => {
  try {
    const { phone, businessSlug } = req.body;
    console.log("📥 Incoming checkin request:", { phone, businessSlug });

    if (!phone || !businessSlug) {
      console.error("❌ Missing phone or businessSlug");
      return res.status(400).json({ error: 'phone and businessSlug required' });
    }

    const business = await Business.findOne({ slug: businessSlug });
    console.log("🏪 Business found:", business ? business.name : "NOT FOUND");

    if (!business) return res.status(404).json({ error: 'business not found' });

    let checkin = await Checkin.findOne({ phone, businessId: business._id });

    if (!checkin) {
      console.log("🆕 Creating new checkin for phone:", phone);
      checkin = await Checkin.create({ phone, businessId: business._id });

      try {
        console.log("📤 Sending compliance SMS...");
        await sendComplianceSms(business, phone); // ✅ fixed function call
        console.log("✅ SMS sent successfully!");
        checkin.sentCompliance = true;
        await checkin.save();
      } catch (err) {
        console.error("❌ Twilio send failed:", err.message);
      }
    } else {
      console.log("ℹ️ Existing checkin found, not sending SMS again.");
    }

    return res.json({ ok: true, checkinId: checkin._id, points: 0, newReward: null });
  } catch (err) {
    console.error("💥 Server error in checkin:", err);
    return res.status(500).json({ error: 'server error' });
  }
};

exports.twilioWebhook = async (req, res) => {
  try {
    const { From, Body } = req.body;
    const incoming = Body ? Body.trim().toUpperCase() : '';
    const checkin = await Checkin.findOne({ phone: From }) || null;

    let eventType = 'OTHER';
    if (incoming.includes('STOP')) eventType = 'STOP';
    else if (incoming.includes('START')) eventType = 'START';
    else if (incoming.includes('HELP')) eventType = 'HELP';

    const event = await InboundEvent.create({
      fromNumber: From,
      body: Body,
      eventType,
      checkinId: checkin ? checkin._id : null,
      raw: req.body
    });

    if (eventType === 'STOP' && checkin) {
      checkin.unsubscribed = true;
      await checkin.save();
    }
    if (eventType === 'START' && checkin) {
      checkin.unsubscribed = false;
      await checkin.save();
    }

    res.send('<Response></Response>');
  } catch (err) {
    console.error("💥 Webhook error:", err);
    res.status(500).send('<Response></Response>');
  }
};
