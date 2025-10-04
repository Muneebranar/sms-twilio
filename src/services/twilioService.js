const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,  // Twilio Console → Account SID
  process.env.TWILIO_AUTH_TOKEN    // Twilio Console → Auth Token
);

async function sendComplianceSms(business, toPhone) {
  const from = process.env.TWILIO_PHONE_NUMBER;
  const body = `${business.name || "Business"}: Thanks for checking in. Reply STOP to unsubscribe or HELP for support.`;

  console.log("📞 Twilio SMS Params:", { from, to: toPhone, body });

  try {
    const result = await client.messages.create({ to: toPhone, from, body });
    console.log("📨 Twilio response:", result.sid);
    return result;
  } catch (err) {
    console.error("❌ Twilio error details:", err);
    throw err;
  }
}

module.exports = {
  client,
  sendComplianceSms
};
