const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  slug: { type: String, required: true, unique: true },
  logo: String,
  twilioNumber: String,

  rewardThreshold: { type: Number, default: 10 },
  rewardExpiryDays: { type: Number, default: 7 },
  checkinCooldownHours: { type: Number, default: 1 },
  maxActiveRewards: { type: Number, default: 15 },
  welcomeMessage: { type: String, default: "Welcome! You've earned your first point!" },
  // i have changed this 
  twilioNumberActive: { type: Boolean, default: true }, // ✅ NEW


  // ✅ Age gate settings
  ageGate: {
    enabled: { type: Boolean, default: false },
    minAge: { type: Number, default: 18 }
  },

  // ✅ Branding options
  branding: {
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#ffffff' },
    kioskPicture: String
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ Cascade delete related data when a business is deleted
BusinessSchema.pre("findOneAndDelete", async function (next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      const businessId = doc._id;

      await Promise.all([
        mongoose.model("Reward").deleteMany({ businessId }),
        mongoose.model("PointsLedger").deleteMany({ businessId }),
        mongoose.model("Checkin").deleteMany({ businessId }),
        mongoose.model("InboundEvent").deleteMany({ businessId }),
        mongoose.model("Customer").deleteMany({ businessId }),
      ]);

      console.log(`🧹 Deleted all related data for business: ${doc.name}`);
    }
  } catch (err) {
    console.error("❌ Error cleaning up business data:", err);
  }
  next();
});

module.exports = mongoose.model("Business", BusinessSchema);