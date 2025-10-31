const mongoose = require('mongoose');

const twilioPhoneSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TwilioPhone', twilioPhoneSchema);