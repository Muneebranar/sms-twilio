// src/middleware/twilioValidator.js
const twilio = require("twilio");

module.exports = (req, res, next) => {
  // ⚙️ Skip validation in development
  if (process.env.NODE_ENV !== "production") {
    console.log("🧪 Twilio webhook received (signature validation skipped in dev)");
    return next();
  }

  try {
    const twilioSignature = req.headers["x-twilio-signature"];
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      req.body
    );

    if (!isValid) {
      console.warn("⚠️ Invalid Twilio signature — request blocked.");
      return res.status(403).send("<Response>Invalid signature</Response>");
    }

    console.log("✅ Valid Twilio webhook request");
    next();
  } catch (err) {
    console.error("💥 Twilio validation error:", err);
    res.status(500).send("<Response>Server error</Response>");
  }
};
