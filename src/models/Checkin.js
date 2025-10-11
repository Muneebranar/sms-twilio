const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheckinSchema = new Schema({
  phone: { type: String, required: true },
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  consentGiven: { type: Boolean, default: true },
  sentCompliance: { type: Boolean, default: false },
  unsubscribed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Checkin", CheckinSchema);
