const mongoose = require('mongoose');

const twilioNumberSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true, required: true },
    friendlyName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('TwilioNumber', twilioNumberSchema);
