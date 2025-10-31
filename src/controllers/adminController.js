// const AdminUser = require("../models/AdminUser");
// const Business = require("../models/Business");
// const Checkin = require("../models/Checkin");
// const Reward = require("../models/Reward");
// const InboundEvent = require("../models/InboundEvent");
// const TwilioNumber = require("../models/TwilioNumber");
// const PointsLedger = require("../models/PointsLedger");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const mongoose = require('mongoose');
// const fs = require("fs");
// const path = require("path"); // ✅ <--- this was missing
// const RewardHistory = require("../models/rewardHistory");


// /* ---------------------------------------------------
//    ✅ 1. AUTO-CREATE DEFAULT ADMIN FROM .env AT STARTUP
// --------------------------------------------------- */
// (async () => {
//   try {
//     const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
//     const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

//     if (!defaultEmail || !defaultPassword) {
//       console.warn("⚠️ Default admin credentials not set in .env — skipping seed.");
//       return;
//     }

//     const existing = await AdminUser.findOne({ email: defaultEmail });
//     if (!existing) {
//       const hashed = await bcrypt.hash(defaultPassword, 10);
//       await AdminUser.create({
//         email: defaultEmail,
//         password: hashed,
//         name: "Default Admin",
//       });
//       console.log("✅ Default admin created successfully from .env!");
//     } else {
//       console.log("✅ Default admin already exists.");
//     }
//   } catch (err) {
//     console.error("❌ Failed to seed default admin:", err);
//   }
// })();


// /* ---------------------------------------------------
//    2. CREATE ADMIN
// --------------------------------------------------- */
// exports.createAdmin = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "email and password required" });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const admin = await AdminUser.create({ email, password: hashed, name });
//     res.json({ ok: true, id: admin._id });
//   } catch (err) {
//     console.error("❌ Failed to create admin:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };

// /* ---------------------------------------------------
//    3. ADMIN LOGIN → RETURNS JWT TOKEN
// --------------------------------------------------- */
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await AdminUser.findOne({ email });
//     if (!admin) return res.status(401).json({ error: "Invalid credentials" });

//     const valid = await bcrypt.compare(password, admin.password);
//     if (!valid) return res.status(401).json({ error: "Invalid credentials" });

//     const token = jwt.sign(
//       { sub: admin._id, email: admin.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({ ok: true, token });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };

// /* ---------------------------------------------------
//    4. CREATE BUSINESS
// --------------------------------------------------- */
// exports.createBusiness = async (req, res) => {
//   try {
//     const { name, slug, twilioNumber, rewardPoints } = req.body;
//     const imageUrl = req.file ? req.file.path : ""; // ensure string
//     console.log("imageUrl :", req.file);

//     if (!name || !slug) {
//       return res.status(400).json({ error: "name and slug required" });
//     }

//     // ✅ Validate Twilio number if provided, otherwise use default
//     let selectedTwilio = null;
//     if (twilioNumber) {
//       selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
//       if (!selectedTwilio)
//         return res.status(400).json({ error: "Invalid Twilio number" });
//     }

//     const business = await Business.create({
//       name,
//       slug,
//       twilioNumber: selectedTwilio
//         ? selectedTwilio.number
//         : process.env.DEFAULT_TWILIO_NUMBER || null, // default fallback
//       logo: imageUrl,
//       rewardPoints: rewardPoints || 0,
//       rewards: [] // instead of null

//     });


//     console.log(business);
//     res.json({ ok: true, business });
//   } catch (err) {
//     console.error("❌ Failed to create business:", err);
//     res.status(500).json({ error: "Failed to save business" });
//   }
// };






// /* ---------------------------------------------------
//    5. UPDATE BUSINESS
// --------------------------------------------------- */
// exports.updateBusiness = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, slug, twilioNumber, rewardPoints, branding } = req.body;

//     // ✅ Check if business exists
//     const business = await Business.findById(id);
//     if (!business) {
//       return res.status(404).json({ error: "Business not found" });
//     }

//     // 🟢 Only validate name/slug if they are being updated
//     if ((name && !slug) || (!name && slug)) {
//       return res.status(400).json({ error: "Both name and slug required if changing name or slug" });
//     }

//     // ✅ Validate Twilio number if provided
//     let selectedTwilio = null;
//     if (twilioNumber) {
//       selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
//       if (!selectedTwilio)
//         return res.status(400).json({ error: "Invalid Twilio number" });
//     }

//     // ✅ Update only provided fields
//     if (name) business.name = name;
//     if (slug) business.slug = slug;
//     if (selectedTwilio) business.twilioNumber = selectedTwilio.number;
//     if (rewardPoints !== undefined) business.rewardPoints = rewardPoints;
//     if (branding) {
//       business.branding = {
//         ...business.branding,
//         ...branding, // merge existing branding with new branding (e.g., logo)
//       };
//     }

//     business.updatedAt = new Date();
//     await business.save();

//     res.json({ ok: true, business });
//   } catch (err) {
//     console.error("❌ Failed to update business:", err);
//     res.status(500).json({ error: "Failed to update business" });
//   }
// };




// /* ---------------------------------------------------
//    5. GET BUSINESS BY SLUG
// --------------------------------------------------- */
// exports.getBusiness = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const business = await Business.findOne({ slug });
//     if (!business) return res.status(404).json({ error: "not found" });
//     res.json({ ok: true, business });
//   } catch (err) {
//     console.error("❌ Failed to fetch business:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };

// /* ---------------------------------------------------
//    6. GET ALL BUSINESSES
// --------------------------------------------------- */
// exports.getAllBusinesses = async (req, res) => {
//   try {
//     const list = await Business.find().sort({ createdAt: -1 });    
//     res.json({ ok: true, list });
//   } catch (err) {
//     console.error("❌ Failed to fetch businesses:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };



// exports.uploadLogo = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("controller")

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid business ID" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: "file required" });
//     }
//      const imageUrl = req.file ? req.file.path : null;

//     const logoPath = imageUrl;
//     await Business.findByIdAndUpdate(id, { $set: { logo: logoPath } });

//     res.json({ ok: true, logo: logoPath });
//   } catch (err) {
//     console.error("❌ Failed to upload logo:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };










// /* ---------------------------------------------------
//    8. DELETE BUSINESS
// --------------------------------------------------- */
// exports.deleteBusiness = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("🟡 DELETE Request for Business ID:", id);

//     // ✅ Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid business ID" });
//     }

//     // ✅ Find business
//     const business = await Business.findById(id);
//     if (!business) {
//       return res.status(404).json({ error: "Business not found" });
//     }

//     console.log("🟢 Found business:", business.name);
//     console.log("🔍 Logo field contents:", business.logo);

//     // ✅ Delete associated logo file if exists
//     if (business.logo) {
//       const logoPath = path.join(__dirname, `../${business.logo}`);
//       try {
//         if (fs.existsSync(logoPath)) {
//           fs.unlinkSync(logoPath);
//           console.log(`🗑️ Deleted logo file: ${logoPath}`);
//         } else {
//           console.warn("⚠️ Logo file not found on disk:", logoPath);
//         }
//       } catch (fileErr) {
//         console.warn("⚠️ Could not delete logo file:", fileErr.message);
//       }
//     } else {
//       console.log("⚠️ No logo field found, skipping file deletion");
//     }

//     // ✅ Delete business from DB
//     await Business.findByIdAndDelete(id);
//     console.log("✅ Business deleted from database:", business.name);

//     res.json({ ok: true, message: "Business and logo deleted successfully" });
//   } catch (err) {
//     console.error("❌ Failed to delete business:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };





// /* ---------------------------------------------------
//    8. TWILIO NUMBERS (GET / ADD)
// --------------------------------------------------- */
// exports.getTwilioNumbers = async (req, res) => {
//   try {
//     const numbers = await TwilioNumber.find().sort({ createdAt: -1 });
//     res.json({ ok: true, numbers });
//   } catch (err) {
//     console.error("❌ Failed to get Twilio numbers:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };

// exports.addTwilioNumber = async (req, res) => {
//   try {
//     const { number, friendlyName } = req.body;
//     if (!number) return res.status(400).json({ error: "number required" });

//     const exists = await TwilioNumber.findOne({ number });
//     if (exists) return res.status(400).json({ error: "Number already exists" });

//     const newNum = await TwilioNumber.create({ number, friendlyName });
//     res.json({ ok: true, newNum });
//   } catch (err) {
//     console.error("❌ Failed to add Twilio number:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };

// /* ---------------------------------------------------
//    9. GET ALL CUSTOMER CONSENTS / CHECK-INS
// --------------------------------------------------- */
// exports.getConsents = async (req, res) => {
//   try {
//     // 🔹 Fetch check-ins with business info
//     const checkins = await Checkin.find()
//       .populate("businessId", "name slug")
//       .sort({ createdAt: -1 });

//     // 🔹 Build full list with inbound messages
//     const list = await Promise.all(
//       checkins.map(async (checkin) => {
//         // find inbound messages for this checkin
//         const inboundEvents = await InboundEvent.find({
//           checkinId: checkin._id,
//         })
//           .sort({ createdAt: -1 })
//           .lean();

//         return {
//           _id: checkin._id,
//           phone: checkin.phone,
//           businessName: checkin.businessId?.name || "Unknown",
//           businessSlug: checkin.businessId?.slug || "",
//           createdAt: checkin.createdAt,
//           status: checkin.sentCompliance ? "Sent" : "Pending",

//           // 🔹 Map inbound messages in frontend-friendly shape
//           inboundEvents: inboundEvents.map((e) => ({
//             from: e.fromNumber || "Unknown",
//             message: e.body || "",
//             type: e.eventType || "OTHER",
//             createdAt: e.createdAt,
//           })),
//         };
//       })
//     );

//     res.json({ ok: true, list });
//   } catch (err) {
//     console.error("❌ Failed to fetch check-ins:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ---------------------------------------------------
//    10. GET ALL INBOUND TWILIO EVENTS
// --------------------------------------------------- */
// exports.getInboundEvents = async (req, res) => {
//   try {
//     const items = await InboundEvent.find()
//       .populate("checkinId", "phone businessId")
//       .populate("businessId", "name slug")
//       .sort({ createdAt: -1 })
//       .limit(300)
//       .lean();

//     const list = items.map((e) => ({
//       _id: e._id,
//       from: e.fromNumber,
//       message: e.body,
//       type: e.eventType,
//       businessName: e.businessId?.name || "Unknown",
//       createdAt: e.createdAt,
//     }));

//     res.json({ ok: true, list });
//   } catch (err) {
//     console.error("❌ Failed to fetch inbound events:", err);
//     res.status(500).json({ ok: false, error: "server error" });
//   }
// };
// /* ---------------------------------------------------
//    11. HANDLE INBOUND TWILIO WEBHOOK
// --------------------------------------------------- */

// exports.handleInboundTwilio = async (req, res) => {
//   try {
//     const { From, To, Body } = req.body;

//     // 🔹 Normalize numbers (Twilio sends with + sign)
//     const fromNumber = From ? From.replace("+", "") : null;
//     const toNumber = To?.replace("+", "") || "Unknown";

//     // 🔹 Try to find latest check-in by same phone number
//    const checkin = await Checkin.findOne({
//   phone: fromNumber ? `+${fromNumber}` : null,
// }).sort({ createdAt: -1 });
// //.lean();

//     // 🔹 Save the inbound message
//     const inbound = await InboundEvent.create({
//       checkinId: checkin?._id || null,
//       fromNumber,
//       body: Body,
//       eventType: "INBOUND_SMS",
//       raw: req.body,
//     });

//     console.log("✅ Inbound event saved:", inbound._id);

//     res.status(200).send("<Response></Response>"); // Twilio expects XML-style response
//   } catch (err) {
//     console.error("❌ Failed to handle inbound Twilio event:", err);
//     res.status(500).json({ ok: false, error: "Server error" });
//   }
// };



// //Rewards



// exports.updateRewardSettings = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       rewardThreshold,
//       maxActiveRewards,
//       checkinCooldownHours,
//       welcomeMessage,
//       rewardExpiryDays
//     } = req.body;

//     const business = await Business.findById(id);
//     if (!business) return res.status(404).json({ error: "Business not found" });

//     if (rewardThreshold !== undefined) business.rewardThreshold = rewardThreshold;
//     if (maxActiveRewards !== undefined) business.maxActiveRewards = maxActiveRewards;
//     if (checkinCooldownHours !== undefined) business.checkinCooldownHours = checkinCooldownHours;
//     if (welcomeMessage !== undefined) business.welcomeMessage = welcomeMessage;
//     if (rewardExpiryDays !== undefined) business.rewardExpiryDays = rewardExpiryDays;

//     await business.save();
//     res.json({ ok: true, business });
//   } catch (err) {
//     console.error("❌ Failed to update reward settings:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };


// // ✅ REDEEM A REWARD
// exports.redeemReward = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const reward = await Reward.findById(id);
//     if (!reward) return res.status(404).json({ ok: false, error: "Reward not found" });

//     reward.redeemed = true;
//     await reward.save();

//     res.json({ ok: true, reward });
//   } catch (err) {
//     console.error("❌ Error redeeming reward:", err);
//     res.status(500).json({ ok: false, error: "Server error" });
//   }
// };




// /* ---------------------------------------------------
//    11. GET BUSINESS REWARD STATS & POINTS LEDGER
// --------------------------------------------------- */
// // const Reward = require("../models/Reward");

// exports.getBusinessRewardsOverview = async (req, res) => {
//   try {
//     const { id } = req.params; // businessId

//     const business = await Business.findById(id);
//     if (!business) return res.status(404).json({ error: "Business not found" });

//     // 📊 Get total points + user-level data
//     const pointsLedger = await PointsLedger.find({ businessId: business._id })
//       .sort({ updatedAt: -1 })
//       .select("phoneNumber points totalCheckins lastCheckinAt hasPendingReward");

//     const totalPoints = pointsLedger.reduce((acc, l) => acc + (l.points || 0), 0);
//     const totalUsers = pointsLedger.length;

//     // 🎁 Active rewards
//     const activeRewards = await Reward.find({
//       businessId: business._id,
//       redeemed: false,
//       $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
//     }).sort({ createdAt: -1 });

//     res.json({
//       ok: true,
//       business: {
//         id: business._id,
//         name: business.name,
//         rewardThreshold: business.rewardThreshold,
//         checkinCooldownHours: business.checkinCooldownHours,
//         welcomeMessage: business.welcomeMessage,
//       },
//       totalUsers,
//       totalPoints,
//       pointsLedger,
//       activeRewards,
//     });
//   } catch (err) {
//     console.error("❌ Failed to fetch reward overview:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };






// /* ---------------------------------------------------
//    12. GET ALL POINTS LEDGER
// --------------------------------------------------- */
// exports.getPointsLedger = async (req, res) => {
//   try {
//     const list = await PointsLedger.find()
//       .populate("businessId", "name")
//       .sort({ createdAt: -1 })
//       .lean();

//     // 🧠 Add a direct field for businessName to simplify frontend
//     const formattedList = list.map((item) => ({
//       ...item,
//       businessName: item.businessId?.name || "—",
//     }));

//     res.json({ ok: true, list: formattedList });
//   } catch (err) {
//     console.error("❌ Error fetching ledger:", err);
//     res.status(500).json({ ok: false, error: "Server error" });
//   }
// };





// /* ---------------------------------------------------
//    13. GET ALL REWARDS
// --------------------------------------------------- */
// exports.getAllRewards = async (req, res) => {
//   try {
//     const list = await Reward.find({})
//       .populate("businessId", "name slug")
//       .sort({ createdAt: -1 });

//     res.json({ ok: true, list });
//   } catch (err) {
//     console.error("❌ Error fetching rewards:", err);
//     res.status(500).json({ ok: false, error: "Server error" });
//   }
// };






// //
// /* ---------------------------------------------------
//    14. GET REWARD HISTORY
// --------------------------------------------------- */
// // controllers/rewardHistoryController.js
// exports.getRewardHistory = async (req, res) => {
//   try {
//     const histories = await RewardHistory.find()
//       .populate("businessId", "name")
//       .populate("rewardId", "name code expiresAt redeemed description threshold")
//       .populate("checkinId", "createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     const formatted = histories.map((h) => {
//       const reward = h.rewardId || {};
//       const business = h.businessId || {};

//       // ✅ Final shape (frontend-ready)
//       return {
//         _id: h._id,
//         business: { name: business.name || "—" }, // ✅ fix this line        
//         phone: h.phone || "—",
//         name: reward.name || "—",
//         code: reward.code || "—",
//         issuedAt: h.createdAt || null,
//         expiresAt: reward.expiresAt || null,
//         status:
//           h.status ||
//           (reward.redeemed
//             ? "Redeemed"
//             : reward.expiresAt && new Date(reward.expiresAt) < new Date()
//             ? "Expired"
//             : "Active"),
//       };
//     });

//     res.json({ ok: true, list: formatted });
//   } catch (err) {
//     console.error("❌ Error fetching reward history:", err);
//     res.status(500).json({ ok: false, error: "Server error" });
//   }
// };





// //Inbound Messages


// // GET /admin/business/:id/points-ledger
// exports.getBusinessPointsLedger = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const ledger = await PointsLedger.find({ businessId: id })
//       .sort({ points: -1 })
//       .lean();

//     res.json({ ok: true, ledger });
//   } catch (err) {
//     console.error("💥 Error fetching points ledger:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };






// // GET /admin/business/:id/checkins
// exports.getBusinessCheckins = async (req, res) => {
//   try {
//     const { id } = req.params; // businessId

//     const checkins = await Checkin.find({ businessId: id })
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json({ ok: true, checkins });
//   } catch (err) {
//     console.error("💥 Error fetching checkins:", err);
//     res.status(500).json({ error: "server error" });
//   }
// };






const AdminUser = require("../models/AdminUser");
const Business = require("../models/Business");
const Checkin = require("../models/Checkin");
const Reward = require("../models/Reward");
const InboundEvent = require("../models/InboundEvent");
const TwilioNumber = require("../models/TwilioNumber");
const PointsLedger = require("../models/PointsLedger");
  const Customer = require("../models/Customer");
    const CheckinLog = require("../models/CheckinLog");
    //const Reward = require("../models/Reward");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const RewardHistory = require("../models/rewardHistory");











// ==========================================
// 🔐 AUTHENTICATION & USER MANAGEMENT
// ==========================================

/**
 * Create initial master admin
 * POST /admin/create-master
 */
exports.createMasterAdmin = async (req, res) => {
  try {
    // Check if master already exists
    const existingMaster = await AdminUser.findOne({ role: "master" });
    if (existingMaster) {
      return res.status(400).json({ error: "Master admin already exists" });
    }

    const { name, email, password } = req.body;

    const master = await AdminUser.create({
      name,
      email,
      password,
      role: "master",
    });

    res.json({
      ok: true,
      message: "Master admin created successfully",
      user: {
        id: master._id,
        name: master.name,
        email: master.email,
        role: master.role,
      },
    });
  } catch (err) {
    console.error("Create Master Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Login
 * POST /admin/login
 */

// 🧩 Environment variables for default admin

exports.login = async (req, res) => {
      console.log("asdasdasdasdasdasdasdasd");

  try {
    const { email, password } = req.body;


    // 🛑 Validate input
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password required" });
    }

    const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "darronwilliams@verizon.net";
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "EngageDFW@#";
    const JWT_SECRET = process.env.JWT_SECRET || "muneeb";

    // ✅ Check against default admin credentials
    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      // 🔐 Generate JWT token
      const token = jwt.sign(
        {
          id: "default-admin",
          role: "sdasda",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 🧩 Debug log
      console.log("✅ Default admin login successful. Token generated:", token);

      // ✅ Respond with token and admin info
      return res.status(200).json({
        ok: true,
        message: "Login successful",
        token,
        user: {
          id: "default-admin",
          name: "Admin",
          email: DEFAULT_ADMIN_EMAIL,
          role: "lskjdasldhadasdjhajhkjhk",
        },
      });
    }

    // ❌ Invalid credentials
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ ok: false, error: "Server error during login" });
  }
};


/**
 * Get all users (role-based)
 * GET /admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    let query = {};

    // Admin can only see users of their business
    if (req.user.role === "admin") {
      query.businessId = req.user.businessId;
    }

    const users = await AdminUser.find(query)
      .populate("businessId", "name slug")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      ok: true,
      users,
    });
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create new user (admin or staff)
 * POST /admin/users
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, businessId } = req.body;

    // Validation
    if (req.user.role === "admin" && role === "admin") {
      return res
        .status(403)
        .json({ error: "Admins cannot create other admins" });
    }

    if (req.user.role === "staff") {
      return res.status(403).json({ error: "Staff cannot create users" });
    }

    // Check if email exists
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create user
    const user = await AdminUser.create({
      name,
      email,
      password,
      role,
      businessId:
        req.user.role === "admin" ? req.user.businessId : businessId,
    });

    res.json({
      ok: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update user
 * PUT /admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, role, businessId, isActive, permissions } = req.body;

    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Permission checks
    if (req.user.role === "admin" && user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Admins cannot update other admins" });
    }

    if (req.user.role === "staff") {
      return res.status(403).json({ error: "Staff cannot update users" });
    }

    // Update fields
    if (name) user.name = name;
    if (isActive !== undefined) user.isActive = isActive;

    // Only master can change role and businessId
    if (req.user.role === "master") {
      if (role) user.role = role;
      if (businessId) user.businessId = businessId;
      if (permissions) user.permissions = { ...user.permissions, ...permissions };
    }

    await user.save();

    res.json({
      ok: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        isActive: user.isActive,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete user
 * DELETE /admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Permission checks
    if (req.user.role === "admin" && user.role === "admin") {
      return res
        .status(403)
        .json({ error: "Admins cannot delete other admins" });
    }

    if (req.user.role === "staff") {
      return res.status(403).json({ error: "Staff cannot delete users" });
    }

    await user.deleteOne();

    res.json({
      ok: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🏢 BUSINESS SETTINGS (Enhanced for Age Gate)
// ==========================================

/**
 * Update business settings including age gate
 * PUT /admin/business/:id/settings
 */
exports.updateBusinessSettings = async (req, res) => {
  try {
    const {
      ageGateEnabled,
      ageGateMinimum,
      timezone,
      welcomeText,
      colors,
      rewardThreshold,
    } = req.body;

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check access
    if (
      req.user.role !== "master" &&
      business._id.toString() !== req.user.businessId.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update settings
    if (ageGateEnabled !== undefined) {
      business.ageGateEnabled = ageGateEnabled;
    }
    if (ageGateMinimum !== undefined) {
      business.ageGateMinimum = ageGateMinimum; // 18 or 21
    }
    if (timezone) business.timezone = timezone;
    if (welcomeText) business.welcomeText = welcomeText;
    if (colors) business.branding.colors = { ...business.branding.colors, ...colors };
    if (rewardThreshold) business.rewardThreshold = rewardThreshold;

    await business.save();

    res.json({
      ok: true,
      message: "Settings updated successfully",
      business,
    });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Toggle Twilio number assignment for business
 * PUT /admin/business/:id/twilio-number
 */
// exports.assignTwilioNumber = async (req, res) => {
//   try {
//     const { twilioNumber, isActive } = req.body;

//     const business = await Business.findById(req.params.id);
//     if (!business) {
//       return res.status(404).json({ error: "Business not found" });
//     }

//     // Check access
//     if (
//       req.user.role !== "master" &&
//       business._id.toString() !== req.user.businessId.toString()
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     business.twilioNumber = twilioNumber;
//     business.twilioNumberActive = isActive !== undefined ? isActive : true;

//     await business.save();

//     res.json({
//       ok: true,
//       message: "Twilio number updated successfully",
//       business,
//     });
//   } catch (err) {
//     console.error("Assign Twilio Number Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


exports.assignTwilioNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { twilioNumber, isActive } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check access
    if (
      req.user.role !== "master" &&
      business._id.toString() !== req.user.businessId.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    business.twilioNumber = twilioNumber;
    business.twilioNumberActive = isActive !== undefined ? isActive : true;

    await business.save();

    res.json({
      ok: true,
      message: "Twilio number updated successfully",
      business,
    });
  } catch (err) {
    console.error("Assign Twilio Number Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 📊 DASHBOARD STATS (Enhanced)
// ==========================================

/**
 * Get dashboard statistics for business
 * GET /admin/business/:id/stats
 */
exports.getBusinessStats = async (req, res) => {
  try {
    const businessId = req.params.id;

    // Check access
    if (
      req.user.role !== "master" &&
      businessId !== req.user.businessId.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

  

    // Get counts
    const totalCustomers = await Customer.countDocuments({ businessId });
    const activeCustomers = await Customer.countDocuments({
      businessId,
      subscriberStatus: "active",
    });
    const totalCheckins = await CheckinLog.countDocuments({ businessId });
    const totalRewardsIssued = await Reward.countDocuments({ businessId });
    const activeRewards = await Reward.countDocuments({
      businessId,
      redeemed: false,
      expiresAt: { $gt: new Date() },
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCheckins = await CheckinLog.countDocuments({
      businessId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      ok: true,
      stats: {
        totalCustomers,
        activeCustomers,
        totalCheckins,
        recentCheckins,
        totalRewardsIssued,
        activeRewards,
      },
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------------------
   ✅ 1. AUTO-CREATE DEFAULT ADMIN FROM .env AT STARTUP
--------------------------------------------------- */
(async () => {
  try {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!defaultEmail || !defaultPassword) {
      console.warn("⚠️ Default admin credentials not set in .env — skipping seed.");
      return;
    }

    const existing = await AdminUser.findOne({ email: defaultEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await AdminUser.create({
        email: defaultEmail,
        password: hashed,
        name: "Default Admin",
        role: "master", // ✅ Master admin by default
      });
      console.log("✅ Default master admin created successfully from .env!");
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
    const { email, password, name, role, businessId } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password, and role required" });
    }

    // Validate role
    if (!['master', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Admin/Staff must have businessId
    if ((role === 'admin' || role === 'staff') && !businessId) {
      return res.status(400).json({ error: "businessId required for admin/staff" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({ 
      email, 
      password: hashed, 
      name,
      role,
      businessId: role === 'master' ? null : businessId
    });
    
    res.json({ ok: true, id: admin._id, role: admin.role });
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

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // ✅ Find admin by email
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        businessId: admin.businessId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Return success response
    res.status(200).json({
      ok: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        businessId: admin.businessId,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
/* ---------------------------------------------------
   4. CREATE BUSINESS
--------------------------------------------------- */
exports.createBusiness = async (req, res) => {
  try {
    const { name, slug, twilioNumber, rewardPoints, ageGateEnabled, ageGateMinAge } = req.body;
    const imageUrl = req.file ? req.file.path : "";

    if (!name || !slug) {
      return res.status(400).json({ error: "name and slug required" });
    }

    // ✅ Validate Twilio number if provided
    let selectedTwilio = null;
    if (twilioNumber) {
      selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
      if (!selectedTwilio)
        return res.status(400).json({ error: "Invalid Twilio number" });
    }

    const business = await Business.create({
      name,
      slug,
      twilioNumber: selectedTwilio
        ? selectedTwilio.number
        : process.env.DEFAULT_TWILIO_NUMBER || null,
      logo: imageUrl,
      rewardPoints: rewardPoints || 0,
      rewards: [],
      ageGate: {
        enabled: ageGateEnabled || false,
        minAge: ageGateMinAge || 18
      }
    });

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
    const { name, slug, twilioNumber, rewardPoints, branding, ageGateEnabled, ageGateMinAge } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check permissions (admin can only update their business)
    if (req.user.role === 'admin' && req.user.businessId.toString() !== id) {
      return res.status(403).json({ error: "Access denied" });
    }

    if ((name && !slug) || (!name && slug)) {
      return res.status(400).json({ error: "Both name and slug required if changing name or slug" });
    }

    let selectedTwilio = null;
    if (twilioNumber) {
      selectedTwilio = await TwilioNumber.findOne({ number: twilioNumber });
      if (!selectedTwilio)
        return res.status(400).json({ error: "Invalid Twilio number" });
    }

    if (name) business.name = name;
    if (slug) business.slug = slug;
    if (selectedTwilio) business.twilioNumber = selectedTwilio.number;
    if (rewardPoints !== undefined) business.rewardPoints = rewardPoints;
    if (branding) {
      business.branding = {
        ...business.branding,
        ...branding,
      };
    }
    
    // ✅ Update age gate settings
    if (ageGateEnabled !== undefined) {
      business.ageGate = business.ageGate || {};
      business.ageGate.enabled = ageGateEnabled;
    }
    if (ageGateMinAge !== undefined) {
      business.ageGate = business.ageGate || {};
      business.ageGate.minAge = ageGateMinAge;
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
   6. GET BUSINESS BY SLUG
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
   7. GET ALL BUSINESSES (filtered by role)
--------------------------------------------------- */
exports.getAllBusinesses = async (req, res) => {
  try {
    let query = {};
    
    // ✅ Admin/Staff can only see their business
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    // Master can see all
    
    const list = await Business.find(query).sort({ createdAt: -1 });    
    res.json({ ok: true, list });
  } catch (err) {
    console.error("❌ Failed to fetch businesses:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   8. UPLOAD LOGO
--------------------------------------------------- */
exports.uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🟢 Uploading logo for business:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Cloudinary gives a hosted URL in req.file.path
    const logoUrl = req.file.path;

    const updated = await Business.findByIdAndUpdate(
      id,
      { $set: { logo: logoUrl } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Business not found" });
    }

    // ✅ return consistent response
    res.json({
      success: true,
      message: "Logo uploaded successfully",
      logoUrl, // 👈 this key is important
    });
  } catch (err) {
    console.error("❌ Failed to upload logo:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------------
   9. DELETE BUSINESS
--------------------------------------------------- */
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Only master can delete
    if (req.user.role !== 'master') {
      return res.status(403).json({ error: "Only master admin can delete businesses" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (business.logo) {
      const logoPath = path.join(__dirname, `../${business.logo}`);
      try {
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          console.log(`🗑️ Deleted logo file: ${logoPath}`);
        }
      } catch (fileErr) {
        console.warn("⚠️ Could not delete logo file:", fileErr.message);
      }
    }

    await Business.findByIdAndDelete(id);
    res.json({ ok: true, message: "Business and logo deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete business:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------------------
   10. TWILIO NUMBERS (GET / ADD)
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
   11. GET ALL CUSTOMER CONSENTS / CHECK-INS
--------------------------------------------------- */
exports.getConsents = async (req, res) => {
  try {
    let query = {};
    
    // Filter by business for admin/staff
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    
    const checkins = await Checkin.find(query)
      .populate("businessId", "name slug")
      .sort({ createdAt: -1 });

    const list = await Promise.all(
      checkins.map(async (checkin) => {
        const inboundEvents = await InboundEvent.find({
          checkinId: checkin._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: checkin._id,
          phone: checkin.phone,
          businessName: checkin.businessId?.name || "Unknown",
          businessSlug: checkin.businessId?.slug || "",
          createdAt: checkin.createdAt,
          status: checkin.sentCompliance ? "Sent" : "Pending",
          inboundEvents: inboundEvents.map((e) => ({
            from: e.fromNumber || "Unknown",
            message: e.body || "",
            type: e.eventType || "OTHER",
            createdAt: e.createdAt,
          })),
        };
      })
    );

    res.json({ ok: true, list });
  } catch (err) {
    console.error("❌ Failed to fetch check-ins:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------------------
   12. GET ALL INBOUND TWILIO EVENTS
--------------------------------------------------- */
exports.getInboundEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    
    const items = await InboundEvent.find(query)
      .populate("checkinId", "phone businessId")
      .populate("businessId", "name slug")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    const list = items.map((e) => ({
      _id: e._id,
      from: e.fromNumber,
      message: e.body,
      type: e.eventType,
      businessName: e.businessId?.name || "Unknown",
      createdAt: e.createdAt,
    }));

    res.json({ ok: true, list });
  } catch (err) {
    console.error("❌ Failed to fetch inbound events:", err);
    res.status(500).json({ ok: false, error: "server error" });
  }
};

/* ---------------------------------------------------
   13. HANDLE INBOUND TWILIO WEBHOOK
--------------------------------------------------- */
exports.handleInboundTwilio = async (req, res) => {
  try {
    const { From, To, Body } = req.body;

    const fromNumber = From ? From.replace("+", "") : null;
    const toNumber = To?.replace("+", "") || "Unknown";

    const checkin = await Checkin.findOne({
      phone: fromNumber ? `+${fromNumber}` : null,
    }).sort({ createdAt: -1 });

    const inbound = await InboundEvent.create({
      checkinId: checkin?._id || null,
      fromNumber,
      body: Body,
      eventType: "INBOUND_SMS",
      raw: req.body,
    });

    res.status(200).send("<Response></Response>");
  } catch (err) {
    console.error("❌ Failed to handle inbound Twilio event:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* ---------------------------------------------------
   14. REWARD SETTINGS
--------------------------------------------------- */
exports.updateRewardSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rewardThreshold,
      maxActiveRewards,
      checkinCooldownHours,
      welcomeMessage,
      rewardExpiryDays
    } = req.body;

    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ error: "Business not found" });

    if (rewardThreshold !== undefined) business.rewardThreshold = rewardThreshold;
    if (maxActiveRewards !== undefined) business.maxActiveRewards = maxActiveRewards;
    if (checkinCooldownHours !== undefined) business.checkinCooldownHours = checkinCooldownHours;
    if (welcomeMessage !== undefined) business.welcomeMessage = welcomeMessage;
    if (rewardExpiryDays !== undefined) business.rewardExpiryDays = rewardExpiryDays;

    await business.save();
    res.json({ ok: true, business });
  } catch (err) {
    console.error("❌ Failed to update reward settings:", err);
    res.status(500).json({ error: "server error" });
  }
};

exports.redeemReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await Reward.findById(id);
    if (!reward) return res.status(404).json({ ok: false, error: "Reward not found" });

    reward.redeemed = true;
    await reward.save();

    res.json({ ok: true, reward });
  } catch (err) {
    console.error("❌ Error redeeming reward:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* ---------------------------------------------------
   15. GET BUSINESS REWARD STATS & POINTS LEDGER
--------------------------------------------------- */
exports.getBusinessRewardsOverview = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ error: "Business not found" });

    const pointsLedger = await PointsLedger.find({ businessId: business._id })
      .sort({ updatedAt: -1 })
      .select("phoneNumber points totalCheckins lastCheckinAt hasPendingReward");

    const totalPoints = pointsLedger.reduce((acc, l) => acc + (l.points || 0), 0);
    const totalUsers = pointsLedger.length;

    const activeRewards = await Reward.find({
      businessId: business._id,
      redeemed: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      business: {
        id: business._id,
        name: business.name,
        rewardThreshold: business.rewardThreshold,
        checkinCooldownHours: business.checkinCooldownHours,
        welcomeMessage: business.welcomeMessage,
      },
      totalUsers,
      totalPoints,
      pointsLedger,
      activeRewards,
    });
  } catch (err) {
    console.error("❌ Failed to fetch reward overview:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------------------
   16. GET ALL POINTS LEDGER
--------------------------------------------------- */
exports.getPointsLedger = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    
    const list = await PointsLedger.find(query)
      .populate("businessId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formattedList = list.map((item) => ({
      ...item,
      businessName: item.businessId?.name || "—",
    }));

    res.json({ ok: true, list: formattedList });
  } catch (err) {
    console.error("❌ Error fetching ledger:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* ---------------------------------------------------
   17. GET ALL REWARDS
--------------------------------------------------- */
exports.getAllRewards = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    
    const list = await Reward.find(query)
      .populate("businessId", "name slug")
      .sort({ createdAt: -1 });

    res.json({ ok: true, list });
  } catch (err) {
    console.error("❌ Error fetching rewards:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* ---------------------------------------------------
   18. GET REWARD HISTORY
--------------------------------------------------- */
exports.getRewardHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      query.businessId = req.user.businessId;
    }
    
    const histories = await RewardHistory.find(query)
      .populate("businessId", "name")
      .populate("rewardId", "name code expiresAt redeemed description threshold")
      .populate("checkinId", "createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = histories.map((h) => {
      const reward = h.rewardId || {};
      const business = h.businessId || {};

      return {
        _id: h._id,
        business: { name: business.name || "—" },
        phone: h.phone || "—",
        name: reward.name || "—",
        code: reward.code || "—",
        issuedAt: h.createdAt || null,
        expiresAt: reward.expiresAt || null,
        status:
          h.status ||
          (reward.redeemed
            ? "Redeemed"
            : reward.expiresAt && new Date(reward.expiresAt) < new Date()
            ? "Expired"
            : "Active"),
      };
    });

    res.json({ ok: true, list: formatted });
  } catch (err) {
    console.error("❌ Error fetching reward history:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* ---------------------------------------------------
   19. GET BUSINESS POINTS LEDGER
--------------------------------------------------- */
exports.getBusinessPointsLedger = async (req, res) => {
  try {
    const { id } = req.params;

    const ledger = await PointsLedger.find({ businessId: id })
      .sort({ points: -1 })
      .lean();

    res.json({ ok: true, ledger });
  } catch (err) {
    console.error("💥 Error fetching points ledger:", err);
    res.status(500).json({ error: "server error" });
  }
};

/* ---------------------------------------------------
   20. GET BUSINESS CHECKINS
--------------------------------------------------- */
exports.getBusinessCheckins = async (req, res) => {
  try {
    const { id } = req.params;

    const checkins = await Checkin.find({ businessId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ ok: true, checkins });
  } catch (err) {
    console.error("💥 Error fetching checkins:", err);
    res.status(500).json({ error: "server error" });
  }
};