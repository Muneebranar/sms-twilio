// // const express = require("express");
// // const router = express.Router();
// // const admin = require("../controllers/adminController");
// // const rewardController = require("../controllers/rewardController");
// // const { protect, authorizeRoles } = require("../middleware/auth");
// // const upload = require("../config/mutler.js");
// // const User = require("../models/AdminUser");

// // // 🧩 Public Admin Routes
// // router.post("/create-admin", admin.createAdmin); // Initial master creation
// // router.post("/login", admin.login); // Public login

// // // 🔒 Protected Routes (All routes below require JWT)

// // //////////////////////////
// // // ✅ User Management (Master/Admin) 
// // //////////////////////////

// // // GET all users (master sees all, admin sees staff of their business)
// // router.get("/users", authorizeRoles("master", "admin"), async (req, res) => {
// //   try {
// //     let query = {};
// //     if (req.user.role === "admin") query.businessId = req.user.businessId;
// //     const users = await User.find(query).select("-password");
// //     res.json(users);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // POST create user (master can create admin/staff, admin can create staff)
// // router.post("/users", authorizeRoles("master", "admin"), async (req, res) => {
// //   try {
// //     const { name, email, password, role, businessId } = req.body;

// //     if (req.user.role === "admin" && role === "admin") {
// //       return res.status(403).json({ error: "Admins cannot create other admins" });
// //     }

// //     const existing = await User.findOne({ email });
// //     if (existing) return res.status(400).json({ error: "Email already exists" });

// //     const user = new User({
// //       name,
// //       email,
// //       password,
// //       role,
// //       businessId: req.user.role === "admin" ? req.user.businessId : businessId,
// //     });

// //     await user.save();
// //     res.json({ message: "User created successfully", user });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // PUT update user
// // router.put("/users/:id", authorizeRoles("master", "admin"), async (req, res) => {
// //   try {
// //     const { name, role, businessId } = req.body;
// //     const user = await User.findById(req.params.id);
// //     if (!user) return res.status(404).json({ error: "User not found" });

// //     if (req.user.role === "admin" && user.role === "admin") {
// //       return res.status(403).json({ error: "Admins cannot update other admins" });
// //     }

// //     user.name = name || user.name;
// //     if (req.user.role === "master") user.role = role || user.role;
// //     if (req.user.role === "master") user.businessId = businessId || user.businessId;

// //     await user.save();
// //     res.json({ message: "User updated successfully", user });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // DELETE user
// // router.delete("/users/:id", authorizeRoles("master", "admin"), async (req, res) => {
// //   try {
// //     const user = await User.findById(req.params.id);
// //     if (!user) return res.status(404).json({ error: "User not found" });

// //     if (req.user.role === "admin" && user.role === "admin") {
// //       return res.status(403).json({ error: "Admins cannot delete other admins" });
// //     }

// //     await user.remove();
// //     res.json({ message: "User deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // //////////////////////////
// // // ✅ Business Management
// // //////////////////////////

// // router.post("/business", authorizeRoles("master"), admin.createBusiness);
// // router.get("/business", authorizeRoles("master"), admin.getAllBusinesses);
// // router.put("/business/:id", authorizeRoles("master", "admin"), admin.updateBusiness);
// // router.delete("/business/:id", authorizeRoles("master"), admin.deleteBusiness);

// // // Upload Logo
// // router.post(
// //   "/business/:id/logo",
// //   authorizeRoles("master", "admin"),
// //   upload.single("logo"),
// //   admin.uploadLogo
// // );

// // //////////////////////////
// // // ✅ Twilio Numbers
// // //////////////////////////

// // router.get("/twilio-numbers", authorizeRoles("master", "admin"), admin.getTwilioNumbers);
// // router.post("/twilio-numbers", authorizeRoles("master", "admin"), admin.addTwilioNumber);

// // //////////////////////////
// // // ✅ Logs & Inbound
// // //////////////////////////

// // router.get("/logs/consents", authorizeRoles("master", "admin"), admin.getConsents);

// // // Public webhook (no auth)
// // router.post("/inbound/twilio", admin.handleInboundTwilio);

// // router.get("/logs/inbound", authorizeRoles("master", "admin"), admin.getInboundEvents);

// // //////////////////////////
// // // ✅ Rewards Settings & CRUD
// // //////////////////////////

// // router.put(
// //   "/business/:id/reward-settings",
// //   authorizeRoles("master", "admin"),
// //   admin.updateRewardSettings
// // );

// // router.get(
// //   "/business/:id/reward-overview",
// //   authorizeRoles("master", "admin"),
// //   admin.getBusinessRewardsOverview
// // );

// // router.get(
// //   "/business/:id/rewards",
// //   authorizeRoles("master", "admin"),
// //   rewardController.getBusinessRewards
// // );

// // router.post(
// //   "/business/:id/rewards",
// //   authorizeRoles("master", "admin"),
// //   rewardController.addBusinessReward
// // );

// // router.delete(
// //   "/business/:id/rewards/:rewardId",
// //   authorizeRoles("master", "admin"),
// //   rewardController.deleteBusinessReward
// // );

// // //////////////////////////
// // // ✅ Points Ledger
// // //////////////////////////

// // router.get("/points-ledger", authorizeRoles("master"), admin.getPointsLedger);
// // router.get(
// //   "/business/:id/points-ledger",
// //   authorizeRoles("master", "admin"),
// //   admin.getBusinessPointsLedger
// // );

// // //////////////////////////
// // // ✅ General Rewards
// // //////////////////////////

// // router.get("/rewards", authorizeRoles("master", "admin"), admin.getAllRewards);
// // router.put("/rewards/:id/redeem", authorizeRoles("master", "admin"), admin.redeemReward);
// // router.get("/rewards/active", rewardController.getRewards);
// // router.get("/reward-history", authorizeRoles("master", "admin"), admin.getRewardHistory);

// // module.exports = router;










// const express = require("express");
// const router = express.Router();
// const admin = require("../controllers/adminController");
// const rewardController = require("../controllers/rewardController");
// const auth = require("../middleware/auth");
// const upload = require("../config/mutler.js");
// const kioskRouter = require("../controllers/kioskController.js")


// // 🧩 Public Admin Routes
// router.post("/login", admin.login);

// // 🔒 Protected Routes (optional)
// // router.use(auth);

// // ✅ Business Management
// router.post("/business", admin.createBusiness);
// router.get("/business", admin.getAllBusinesses);
// router.put("/business/:id", admin.updateBusiness);
// router.delete("/business/:id", admin.deleteBusiness);

// // ✅ Upload Logo (Form field name must be 'logo')
// router.post("/business/:id/logo", upload.single("logo"), admin.uploadLogo);

// // ✅ Twilio Numbers Management
// router.get("/twilio-numbers", admin.getTwilioNumbers);
// router.post("/twilio-numbers", admin.addTwilioNumber);

// // ✅ Logs and Reports
// router.get("/logs/consents", admin.getConsents);
// // ✅ Twilio Webhook for Inbound SMS
// router.post("/inbound/twilio", admin.handleInboundTwilio);
// router.get("/logs/inbound", admin.getInboundEvents);

// // ✅ Rewards Settings
// router.put("/business/:id/reward-settings", admin.updateRewardSettings);
// router.get("/business/:id/reward-overview", admin.getBusinessRewardsOverview);


// router.get("/business/:id/rewards", rewardController.getBusinessRewards);
// router.post("/business/:id/rewards", rewardController.addBusinessReward);
// router.delete("/business/:id/rewards/:rewardId", rewardController.deleteBusinessReward);


// // ✅ Add these two new lines 👇
// router.get("/points-ledger", admin.getPointsLedger);
// router.get("/business/:id/points-ledger", admin.getBusinessPointsLedger);
// router.get("/rewards", admin.getAllRewards);
// //Redeem Reward
// // ✅ Redeem a reward
// router.put("/rewards/:id/redeem", admin.redeemReward);
// // GET all active rewards (not redeemed and not expired)
// router.get("/rewards/active", rewardController.getRewards);



// //reward history
// router.get("/reward-history", admin.getRewardHistory);


// // ✅ NEW: Fetch all inbound messages
// // router.get("/inbound", adminController.getInboundEvents);

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// // Controllers
// const adminController = require("../controllers/adminController");
// const customerController = require("../controllers/customerController");
// const rewardController = require("../controllers/rewardController");
// const csvImportController = require("../controllers/csvImportController");

// // Middleware
// const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// // ✅ Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ 
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|csv/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Only images and CSV files are allowed"));
//     }
//   }
// });

// // ========================================
// // PUBLIC ROUTES (no auth required)
// // ========================================
// router.post("/login", adminController.login);
// // ========================================
// // PROTECTED ROUTES (auth required)
// // ========================================

// // --- ADMIN MANAGEMENT ---
// router.post("/create-admin", protect, authorizeRoles('master'), adminController.createAdmin);

// // --- BUSINESS MANAGEMENT ---
// router.get("/business", adminController.getBusinesses);
// router.get("/business/:slug", protect, adminController.getBusiness);
// router.post("/business", protect, authorizeRoles('master', 'admin'), upload.single("logo"), adminController.createBusiness);
// router.put("/business/:id", protect, authorizeRoles('master', 'admin'), adminController.updateBusiness);
// router.delete("/business/:id", protect, authorizeRoles('master'), adminController.deleteBusiness);
// router.post("/business/:id/logo", protect, authorizeRoles('master', 'admin'), upload.single("logo"), adminController.uploadLogo);

// // --- TWILIO NUMBERS ---
// router.get("/twilio-numbers", protect, adminController.getTwilioNumbers);
// router.post("/twilio-numbers", protect, authorizeRoles('master', 'admin'), adminController.addTwilioNumber);

// // --- CHECK-IN LOGS ---
// router.get("/logs/consents", protect, adminController.getConsents);
// router.get("/logs/inbound", protect, adminController.getInboundEvents);

// // --- POINTS LEDGER ---
// router.get("/points-ledger", protect, adminController.getPointsLedger);
// router.get("/business/:id/points-ledger", protect, adminController.getBusinessPointsLedger);
// router.get("/business/:id/checkins", protect, adminController.getBusinessCheckins);

// // --- REWARDS ---
// router.get("/rewards", protect, adminController.getAllRewards);
// router.put("/rewards/:id/redeem", protect, authorizeRoles('master', 'admin', 'staff'), adminController.redeemReward);
// router.get("/reward-history", protect, adminController.getRewardHistory);
// router.get("/business/:id/rewards-overview", protect, adminController.getBusinessRewardsOverview);
// router.put("/business/:id/reward-settings", protect, authorizeRoles('master', 'admin'), adminController.updateRewardSettings);

// // --- BUSINESS REWARDS MANAGEMENT ---
// router.get("/business/:id/rewards", protect, rewardController.getBusinessRewards);
// router.post("/business/:id/rewards", protect, authorizeRoles('master', 'admin'), rewardController.addBusinessReward);
// router.delete("/business/:id/rewards/:rewardId", protect, authorizeRoles('master', 'admin'), rewardController.deleteBusinessReward);
// router.put("/business/:id/rewards/:rewardId", protect, authorizeRoles('master', 'admin'), rewardController.updateBusinessReward);
// router.put("/business/:id/rewards/:rewardId/redeem", protect, authorizeRoles('master', 'admin', 'staff'), rewardController.redeemReward);

// // --- CUSTOMER MANAGEMENT ---
// router.get("/customers", protect, customerController.searchCustomers);
// router.get("/customers/:id", protect, customerController.getCustomerDetails);
// router.post("/customers/:id/checkin", protect, authorizeRoles('master', 'admin', 'staff'), customerController.addManualCheckin);
// router.put("/customers/:id/status", protect, authorizeRoles('master', 'admin'), customerController.updateSubscriberStatus);
// router.put("/customers/:id", protect, authorizeRoles('master', 'admin'), customerController.updateCustomer);
// router.delete("/customers/:id", protect, authorizeRoles('master', 'admin'), customerController.deleteCustomer);

// // --- CSV IMPORT ---
// router.post("/customers/import", protect, authorizeRoles('master', 'admin'), upload.single('csv'), csvImportController.importCustomersCSV);
// router.get("/customers/import-history", protect, authorizeRoles('master', 'admin'), csvImportController.getImportHistory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Controllers
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const rewardController = require("../controllers/rewardController");
const csvImportController = require("../controllers/csvImportController");
const kioskController=require("../controllers/kioskController");
const { protect } = require("../middleware/authMiddleware");
const {upload,uploadCSV} = require("../config/mutler"); // ✅ import Cloudinary multer
// const {uploadCSV } = require("../config/multer");


// 🧩 Debug Logs — check which functions are actually loaded
console.log("✅ adminController:", Object.keys(adminController));
console.log("✅ customerController:", Object.keys(customerController));
console.log("✅ rewardController:", Object.keys(rewardController));
console.log("✅ csvImportController:", Object.keys(csvImportController));
console.log("csvImportController:", csvImportController);


// ========================================
// PUBLIC ROUTES
// ========================================
router.post("/login", adminController.login);//

// ========================================
// TEMPORARILY UNPROTECTED ROUTES (for local testing)
// ========================================
router.use(protect);


// USERS
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createAdmin); // ✅ reuse createAdmin
// router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);


// --- BUSINESS MANAGEMENT ---
router.get("/business",protect, adminController.getAllBusinesses);
router.get("/business/:id", protect, adminController.getBusinessById);
router.get("/business/:slug",protect, adminController.getBusiness);
router.post("/business",protect, upload.single("logo"), adminController.createBusiness);
router.put("/business/:id",protect, adminController.updateBusiness);
router.put("/business/:id/twilio-number", protect, adminController.assignTwilioNumber);
router.delete("/business/:id",protect, adminController.deleteBusiness);
router.post("/business/:id/logo",protect, upload.single("logo"), adminController.uploadLogo);

// --- TWILIO NUMBERS ---
router.get("/twilio-numbers",protect, adminController.getTwilioNumbers);
router.post("/twilio-numbers",protect, adminController.addTwilioNumber);

// --- CHECK-IN LOGS ---
router.get("/logs/consents",protect, adminController.getConsents);
router.post("/inbound/twilio",protect, adminController.handleInboundTwilio);
router.get("/logs/inbound",protect, adminController.getInboundEvents);

// --- POINTS LEDGER ---
router.get("/points-ledger",protect, adminController.getPointsLedger);
router.get("/business/:id/points-ledger",protect, adminController.getBusinessPointsLedger);
router.get("/business/:id/checkins",protect, adminController.getBusinessCheckins);


// --- CHECK-IN STATISTICS --- ✨ ADD THESE TWO LINES
router.get("/checkins/daily-stats", protect, adminController.getDailyCheckinStats);
router.get("/checkins/summary", protect, adminController.getCheckinSummary);

// --- REWARDS ---
router.get("/rewards",protect, adminController.getAllRewards);
router.put("/rewards/:id/redeem",protect, adminController.redeemReward);
router.get("/reward-history",protect, adminController.getRewardHistory);
router.get("/business/:id/rewards-overview",protect, adminController.getBusinessRewardsOverview);
router.put("/business/:id/reward-settings",protect, adminController.updateRewardSettings);

// --- BUSINESS REWARDS MANAGEMENT ---
router.get("/business/:id/rewards", rewardController.getBusinessRewards);
router.post("/business/:id/rewards", rewardController.addBusinessReward);
router.delete("/business/:id/rewards/:rewardId", rewardController.deleteBusinessReward);
router.put("/business/:id/rewards/:rewardId", rewardController.updateBusinessReward);
router.put("/business/:id/rewards/:rewardId/redeem", rewardController.redeemReward);

// --- CUSTOMER MANAGEMENT ---
// Search with code support
// router.get('/admin/customers', auth, customerController.searchCustomers);

// New: Get customer by reward code
router.get("/customers",protect, customerController.searchCustomers);
router.get('/admin/customers/by-code/:code', protect, customerController.getCustomerByRewardCode);
router.get("/customers/:id",protect , customerController.getCustomerDetails);
router.post("/customers/:id/checkin", customerController.addManualCheckin);
router.put("/customers/:id/status", customerController.updateSubscriberStatus);
router.put("/customers/:id", customerController.updateCustomer);
router.delete("/customers/:id", customerController.deleteCustomer);


// Admin routes (by customer ID)
router.post("/customers/:id/block", protect, kioskController.blockCustomerById);
router.post("/customers/:id/unblock", protect, kioskController.unblockCustomerById);

// Legacy kiosk routes (by phone)
router.post("/admin/unblock-customer", protect, kioskController.unblockCustomer);
router.post("/admin/block-customer", protect, kioskController.blockCustomer);
// --- CSV IMPORT ---
router.post("/customers/import", protect,uploadCSV.single("csv"), csvImportController.importCustomersCSV);
// router.post("/customers/import", protect, uploadCSV.single("csv"), importCustomers);
router.get("/customers/import-history", csvImportController.getImportHistory);
router.post("/create-admin", adminController.createAdmin);

// --- ADMIN CREATION (keep protected if needed)
router.post("/create-admin", adminController.createAdmin);

module.exports = router;
