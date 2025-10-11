const AdminUser = require("../models/AdminUser");
const Business = require("../models/Business");
const Checkin = require("../models/Checkin");
const InboundEvent = require("../models/InboundEvent");
const TwilioNumber = require("../models/TwilioNumber");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path"); // ✅ <--- this was missing


/* ---------------------------------------------------
   ✅ 1. AUTO-CREATE DEFAULT ADMIN AT SERVER STARTUP
--------------------------------------------------- */
(async () => {
  try {
    const defaultEmail = "darronwilliams@verizon.net";
    const defaultPassword = "EngageDFW@#";

    const existing = await AdminUser.findOne({ email: defaultEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await AdminUser.create({
        email: defaultEmail,
        password: hashed,
        name: "Default Admin",
      });
      console.log("✅ Default admin created successfully!");
    } else {
      console.log("✅ Default admin already exists.");
    }
  } catch (err) {
    console.error("❌ Failed to seed default admin:", err);
  }
})();

/* ---------------------------------------------------
   2. CREATE ADMIN
--------------------------------------------------- */
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({ email, password: hashed, name });
    res.json({ ok: true, id: admin._id });
  } catch (err) {
    console.error("❌ Failed to create admin:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   3. ADMIN LOGIN → RETURNS JWT TOKEN
--------------------------------------------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ ok: true, token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   4. CREATE BUSINESS
--------------------------------------------------- */
exports.createBusiness = async (req, res) => {
  try {
    const { name, slug, twilioNumber, rewardPoints } = req.body;
     const imageUrl = req.file ? req.file.path : null;
     console.log("imageUrl :",req.file);
    if (!name || !slug) {
      return res.status(400).json({ error: "name and slug required" });
    }

    // ✅ Validate twilio number if provided
    let selectedTwilio = null;
    if (twilioNumber) {
      selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
      if (!selectedTwilio)
        return res.status(400).json({ error: "Invalid Twilio number" });
    }

    const business = await Business.create({
      name,
      slug,
      twilioNumber: selectedTwilio ? selectedTwilio.number : null,
      logo:imageUrl,
      rewardPoints: rewardPoints || 0,
    });

    console.log(business)

    res.json({ ok: true, business });
  } catch (err) {
    console.error("❌ Failed to create business:", err);
    res.status(500).json({ error: "Failed to save business" });
  }
};





/* ---------------------------------------------------
   5. UPDATE BUSINESS
--------------------------------------------------- */
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, twilioNumber, rewardPoints, branding } = req.body;

    // ✅ Check if business exists
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // 🟢 Only validate name/slug if they are being updated
    if ((name && !slug) || (!name && slug)) {
      return res.status(400).json({ error: "Both name and slug required if changing name or slug" });
    }

    // ✅ Validate Twilio number if provided
    let selectedTwilio = null;
    if (twilioNumber) {
      selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
      if (!selectedTwilio)
        return res.status(400).json({ error: "Invalid Twilio number" });
    }

    // ✅ Update only provided fields
    if (name) business.name = name;
    if (slug) business.slug = slug;
    if (selectedTwilio) business.twilioNumber = selectedTwilio.number;
    if (rewardPoints !== undefined) business.rewardPoints = rewardPoints;
    if (branding) {
      business.branding = {
        ...business.branding,
        ...branding, // merge existing branding with new branding (e.g., logo)
      };
    }

    business.updatedAt = new Date();
    await business.save();

    res.json({ ok: true, business });
  } catch (err) {
    console.error("❌ Failed to update business:", err);
    res.status(500).json({ error: "Failed to update business" });
  }
};




/* ---------------------------------------------------
   5. GET BUSINESS BY SLUG
--------------------------------------------------- */
exports.getBusiness = async (req, res) => {
  try {
    const { slug } = req.params;
    const business = await Business.findOne({ slug });
    if (!business) return res.status(404).json({ error: "not found" });
    res.json({ ok: true, business });
  } catch (err) {
    console.error("❌ Failed to fetch business:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   6. GET ALL BUSINESSES
--------------------------------------------------- */
exports.getAllBusinesses = async (req, res) => {
  try {
    const list = await Business.find().sort({ createdAt: -1 });    
    res.json({ ok: true, list });
  } catch (err) {
    console.error("❌ Failed to fetch businesses:", err);
    res.status(500).json({ error: "server error" });
  }
};



exports.uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("controller")

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "file required" });
    }
     const imageUrl = req.file ? req.file.path : null;

    const logoPath = imageUrl;
    await Business.findByIdAndUpdate(id, { $set: { logo: logoPath } });

    res.json({ ok: true, logo: logoPath });
  } catch (err) {
    console.error("❌ Failed to upload logo:", err);
    res.status(500).json({ error: "server error" });
  }
};





/* ---------------------------------------------------
   8. DELETE BUSINESS
--------------------------------------------------- */
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🟡 DELETE Request for Business ID:", id);

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    // ✅ Find business
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    console.log("🟢 Found business:", business.name);
    console.log("🔍 Logo field contents:", business.logo);

    // ✅ Delete associated logo file if exists
    if (business.logo) {
      const logoPath = path.join(__dirname, `../${business.logo}`);
      try {
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          console.log(`🗑️ Deleted logo file: ${logoPath}`);
        } else {
          console.warn("⚠️ Logo file not found on disk:", logoPath);
        }
      } catch (fileErr) {
        console.warn("⚠️ Could not delete logo file:", fileErr.message);
      }
    } else {
      console.log("⚠️ No logo field found, skipping file deletion");
    }

    // ✅ Delete business from DB
    await Business.findByIdAndDelete(id);
    console.log("✅ Business deleted from database:", business.name);

    res.json({ ok: true, message: "Business and logo deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete business:", err);
    res.status(500).json({ error: "Server error" });
  }
};





/* ---------------------------------------------------
   8. TWILIO NUMBERS (GET / ADD)
--------------------------------------------------- */
exports.getTwilioNumbers = async (req, res) => {
  try {
    const numbers = await TwilioNumber.find().sort({ createdAt: -1 });
    res.json({ ok: true, numbers });
  } catch (err) {
    console.error("❌ Failed to get Twilio numbers:", err);
    res.status(500).json({ error: "server error" });
  }
};

exports.addTwilioNumber = async (req, res) => {
  try {
    const { number, friendlyName } = req.body;
    if (!number) return res.status(400).json({ error: "number required" });

    const exists = await TwilioNumber.findOne({ number });
    if (exists) return res.status(400).json({ error: "Number already exists" });

    const newNum = await TwilioNumber.create({ number, friendlyName });
    res.json({ ok: true, newNum });
  } catch (err) {
    console.error("❌ Failed to add Twilio number:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   9. GET ALL CUSTOMER CONSENTS / CHECK-INS
--------------------------------------------------- */
exports.getConsents = async (req, res) => {
  try {
    const items = await Checkin.find()
      .populate("businessId", "name slug")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ ok: true, items });
  } catch (err) {
    console.error("❌ Failed to fetch check-ins:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   10. GET ALL INBOUND TWILIO EVENTS
--------------------------------------------------- */
exports.getInboundEvents = async (req, res) => {
  try {
    const items = await InboundEvent.find().sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, items });
  } catch (err) {
    console.error("❌ Failed to fetch inbound events:", err);
    res.status(500).json({ error: "server error" });
  }
};
