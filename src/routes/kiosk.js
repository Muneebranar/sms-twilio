const express = require("express");
const router = express.Router();

const { sendComplianceSms } = require("../services/twilioService");
const Business = require("../models/Business");
const Checkin = require("../models/Checkin");
const { 
  twilioWebhook, 
  getKioskBySlug, 
  checkin,
  blockCustomer,
  unblockCustomer 
} = require("../controllers/kioskController");
const twilioValidator = require("../middleware/twilioValidator");
const { protect } = require("../middleware/authMiddleware"); // Your auth middleware

/**
 * 🧩 Kiosk Check-In Route (PUBLIC)
 * Handles user check-in from a business kiosk.
 * Sends compliance SMS and stores check-in details.
 */
router.post("/checkin", checkin);

/**
 * ✅ Twilio Webhook Route (PUBLIC)
 * Handles inbound SMS or delivery status callbacks.
 */
router.post("/webhook/twilio", twilioValidator, twilioWebhook);

/**
 * 🔓 Admin: Unblock Customer (PROTECTED)
 * Unblocks a customer and resets their points to 0
 */
router.post("/admin/unblock-customer", protect, unblockCustomer);

/**
 * 🔒 Admin: Block Customer (PROTECTED)
 * Blocks a customer from checking in
 */
router.post("/admin/block-customer", protect, blockCustomer);

/**
 * ✅ Kiosk by Slug (PUBLIC)
 * Returns business kiosk page details by slug.
 */
router.get("/:slug", getKioskBySlug);

module.exports = router;