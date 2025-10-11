const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessSchema = new Schema({
  name: { type: String, required: true },
  country: String,
  city: String,
  postal_code: String,
  slug: { type: String, required: true, unique: true },
  logo: String,  // ✅ directly store logo here
  twilioNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);
