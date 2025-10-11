const twilio = require("twilio");

// ✅ Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send a compliance SMS message.
 * - Uses the business’s assigned Twilio number if available
 * - Falls back to DEFAULT_TWILIO_NUMBER from .env
 * - Returns the SID and the actual number used
 */
async function sendComplianceSms(business, toPhone, fromNumber) {
  const from =
    fromNumber ||
    business.twilioNumber ||
    process.env.DEFAULT_TWILIO_NUMBER ||
    process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error("No Twilio 'from' number defined!");
  }

  const body = `${business.name || "Business"}: Thanks for checking in! Reply STOP to unsubscribe or HELP for support.`;

  console.log("📞 Sending Twilio SMS:", { from, to: toPhone, body });

  try {
    const result = await client.messages.create({ to: toPhone, from, body });
    console.log("✅ Twilio message sent:", result.sid);

    // Return SID and actual from number used
    return {
      sid: result.sid,
      from,
      to: toPhone,
    };
  } catch (err) {
    console.error("❌ Twilio error:", err?.message || err);
    throw err;
  }
}

module.exports = {
  client,
  sendComplianceSms,
};
