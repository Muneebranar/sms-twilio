const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InboundEventSchema = new Schema({
  checkinId: { type: Schema.Types.ObjectId, ref: 'Checkin' },
  fromNumber: String,
  body: String,
  eventType: String,
  raw: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InboundEvent', InboundEventSchema);
