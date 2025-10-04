// Placeholder: implement Twilio signature validation in production using Twilio SDK.
module.exports = (req, res, next) => {
  // For now accept all (but log)
  console.log('Twilio webhook received (no signature validation active)');
  next();
};
