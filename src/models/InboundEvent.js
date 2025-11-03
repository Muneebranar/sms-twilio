const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InboundEventSchema = new Schema({
  checkinId: { type: Schema.Types.ObjectId, ref: 'Checkin' },
  businessId: { type: Schema.Types.ObjectId, ref: "Business" }, // ✅ add this

  fromNumber: String,
  
  body: String,
  toNumber: String, // ✅ add this
  eventType: String,
  raw: Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('InboundEvent', InboundEventSchema);
