//   const Business = require("../models/Business");
//   const Checkin = require("../models/Checkin");
//   const InboundEvent = require("../models/InboundEvent");
//   const PointsLedger = require("../models/PointsLedger");
//   const Reward = require("../models/Reward");
//   const RewardHistory = require("../models/rewardHistory");



//   const { sendComplianceSms, client } = require("../services/twilioService");
//   const twilio = require("twilio");
//   // ✅ Normalize phone number helper
//   const normalizePhone = (num) => {
//     if (!num) return num;
//     const digits = num.toString().replace(/\D/g, "");
//     if (num.trim().startsWith("+")) return `+${digits}`;
//     return `+${digits}`;
//   };





// /**
//  * 🟢 POST /api/checkin
//  * Handles customer check-in for a given business.
//  * Includes: compliance SMS, welcome SMS, points tracking, cooldown, and auto rewards.
// //  */
// // exports.checkin = async (req, res) => {
// //   try {
// //     const { phone, businessSlug } = req.body;

// //     // ✅ Normalize phone number: always ensure it starts with +1
// //     let normalizedPhone = phone?.trim() || "";
// //     normalizedPhone = normalizedPhone.replace(/\D/g, ""); // remove non-digits
// //     if (!normalizedPhone.startsWith("1")) {
// //       normalizedPhone = "1" + normalizedPhone;
// //     }
// //     normalizedPhone = "+" + normalizedPhone;

// //     console.log("📥 Incoming check-in:", {
// //       original: phone,
// //       normalized: normalizedPhone,
// //       businessSlug,
// //     });

// //     if (!phone || !businessSlug) {
// //       return res.status(400).json({ error: "phone and businessSlug required" });
// //     }

// //     // 🔹 Get business by slug
// //     const business = await Business.findOne({ slug: businessSlug });
// //     if (!business) return res.status(404).json({ error: "Business not found" });

// //     const fromNumber =
// //       business.twilioNumber ||
// //       process.env.DEFAULT_TWILIO_NUMBER ||
// //       process.env.TWILIO_PHONE_NUMBER;

// //     // 🔹 Get existing check-in for this customer
// //     let existingCheckin = await Checkin.findOne({
// //       phone: normalizedPhone,
// //       businessId: business._id,
// //     });

// //     // 🔹 Apply cooldown (in minutes)
// //     const cooldownMinutes = 0.1;
// //     if (existingCheckin) {
// //       const minutesSinceLast =
// //         (Date.now() - new Date(existingCheckin.updatedAt)) / (1000 * 60);
// //       if (minutesSinceLast < cooldownMinutes) {
// //         const remaining = Math.ceil(cooldownMinutes - minutesSinceLast);
// //         console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
// //         return res.json({
// //           ok: false,
// //           message: `You can check in again after ${remaining} minutes.`,
// //         });
// //       }
// //     }

// //     // ✅ If record exists → update existing
// //     if (existingCheckin) {
// //       existingCheckin.totalCheckins = (existingCheckin.totalCheckins || 1) + 1;
// //       existingCheckin.pointsAwarded = (existingCheckin.pointsAwarded || 0) + 1;
// //       existingCheckin.lastCheckinAt = new Date();
// //       await existingCheckin.save();
// //       console.log("🔁 Existing check-in updated:", existingCheckin._id);
// //     } else {
// //       // ✅ If first time → create new record
// //       existingCheckin = await Checkin.create({
// //         phone: normalizedPhone,
// //         businessId: business._id,
// //         pointsAwarded: 1,
// //         totalCheckins: 1,
// //         consentGiven: true,
// //         sentCompliance: false,
// //       });
// //       console.log("💾 New check-in created:", existingCheckin._id);
// //     }

// //     // ✅ Update Points Ledger
// //     const ledger = await PointsLedger.findOneAndUpdate(
// //       { phone: normalizedPhone, businessId: business._id },
// //       {
// //         $inc: { points: 1 },
// //         $set: { lastCheckinAt: new Date() },
// //         $setOnInsert: { createdAt: new Date() },
// //       },
// //       { new: true, upsert: true }
// //     );

// //     console.log("📘 Points Ledger updated:", ledger);

// //     // ✅ Send compliance & welcome SMS only for first-ever check-in
// //     if (!existingCheckin || existingCheckin.totalCheckins === 1) {
// //       try {
// //         await sendComplianceSms(business, normalizedPhone, fromNumber);
// //         console.log("✅ Compliance SMS sent.");

// //         const welcomeMsg =
// //           business.welcomeMessage ||
// //           `Welcome to ${business.name}! Thanks for checking in.`;

// //         await client.messages.create({
// //           to: normalizedPhone,
// //           from: fromNumber,
// //           body: welcomeMsg,
// //         });
// //         console.log("💬 Welcome SMS sent!");
// //       } catch (err) {
// //         console.error("❌ SMS sending failed:", err.message);
// //       }
// //     }

// //     // ✅ Check rewards
// //     const totalPoints = ledger.points;

// //     // ✅ Only fetch reward templates (not yet issued ones)
// //     const rewardTemplates = await Reward.find({
// //       businessId: business._id,
// //       phone: { $exists: false },
// //     });

// //     let newReward = null;

// //     for (const template of rewardTemplates) {
// //       const alreadyIssued = await Reward.findOne({
// //         businessId: business._id,
// //         phone: normalizedPhone,
// //         name: template.name,
// //         redeemed: false,
// //       });

// //       if (!alreadyIssued && totalPoints >= template.threshold) {
// //         newReward = await Reward.create({
// //           businessId: business._id,
// //           phone: normalizedPhone,
// //           name: template.name,
// //           description: template.description,
// //           threshold: template.threshold,
// //           code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
// //           expiresAt: new Date(
// //             Date.now() +
// //               (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
// //           ),
// //           redeemed: false,
// //         });

// //         console.log("🎁 New reward issued:", newReward.code);

// //         // ✅ Deduct points
// //         await PointsLedger.updateOne(
// //           { businessId: business._id, phone: normalizedPhone },
// //           { $inc: { points: -template.threshold } }
// //         );

// //         // ✅ Send SMS
// //         await client.messages.create({
// //           to: normalizedPhone,
// //           from: fromNumber,
// //           body: `🎉 Congrats! You’ve unlocked ${template.name}! Use code ${newReward.code}.`,
// //         });
// //       }
// //     }

// //     // ✅ Done
// //     console.log("✅ Check-in complete.");
// //     res.json({
// //       ok: true,
// //       phone: normalizedPhone,
// //       business: business.name,
// //       totalPoints: ledger.points,
// //       newReward,
// //     });
// //   } catch (err) {
// //     console.error("💥 Check-in error:", err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };


// exports.checkin = async (req, res) => {
//   try {
//     // const { phone, businessSlug } = req.body;
//      const { phone, businessSlug, dateOfBirth } = req.body; // ✅ add DOB


//     // ========== VALIDATION ==========
//     if (!phone || !businessSlug) {
//       return res.status(400).json({ 
//         ok: false, 
//         error: "phone and businessSlug are required" 
//       });
//     }

//     // ✅ Normalize phone number
//     let normalizedPhone = phone?.trim() || "";
//     normalizedPhone = normalizedPhone.replace(/\D/g, "");

    
//     if (!normalizedPhone) {
//       return res.status(400).json({ 
//         ok: false, 
//         error: "Invalid phone number format" 
//       });
//     }
    
//     if (!normalizedPhone.startsWith("1")) normalizedPhone = "1" + normalizedPhone;
//     normalizedPhone = "+" + normalizedPhone;

//     console.log("📥 Incoming check-in:", { 
//       original: phone, 
//       normalized: normalizedPhone, 
//       businessSlug 
//     });

//     // ========== GET BUSINESS ==========
//     const business = await Business.findOne({ slug: businessSlug });
//     if (!business) {
//       return res.status(404).json({ 
//         ok: false, 
//         error: "Business not found" 
//       });
//     }

// //new added
//     // ✅ AGE GATE CHECK
//     if (business.ageGate?.enabled && dateOfBirth) {
//       const birthDate = new Date(dateOfBirth);
//       const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
//       if (age < (business.ageGate.minAge || 18)) {
//         return res.status(403).json({
//           ok: false,
//           error: `You must be ${business.ageGate.minAge}+ to check in`,
//         });
//       }
//     }

//     // ✅ CHECK IF NUMBER IS ACTIVE
//     if (!business.twilioNumberActive) {
//       return res.status(503).json({
//         ok: false,
//         error: "SMS service temporarily unavailable for this business",
//       });
//     }

//     const fromNumber =
//       business.twilioNumber ||
//       process.env.DEFAULT_TWILIO_NUMBER ||
//       process.env.TWILIO_PHONE_NUMBER;

//     if (!fromNumber) {
//       console.error("❌ No Twilio number configured");
//       return res.status(500).json({ 
//         ok: false, 
//         error: "SMS service not configured" 
//       });
//     }

//     // ========== CHECK LAST CHECKIN FOR COOLDOWN ==========
//     let lastCheckin = await Checkin.findOne({
//       phone: normalizedPhone,
//       businessId: business._id,
//     }).sort({ createdAt: -1 });

//     const cooldownMinutes = 0.1;
//     const isInCooldown = lastCheckin 
//       ? (Date.now() - new Date(lastCheckin.lastCheckinAt)) / (1000 * 60) < cooldownMinutes
//       : false;
    
//     const remaining = isInCooldown 
//       ? Math.ceil(cooldownMinutes - (Date.now() - new Date(lastCheckin.lastCheckinAt)) / (1000 * 60))
//       : 0;

//     const isFirstCheckin = !lastCheckin;

//     // ========== ALWAYS CREATE NEW CHECKIN LOG ==========
//     let newCheckin;
//     try {
//       newCheckin = await Checkin.create({
//         businessId: business._id,
//         phone: normalizedPhone,
//         pointsAwarded: isInCooldown ? 0 : 1,
//         totalCheckins: (lastCheckin?.totalCheckins || 0) + 1,
//         consentGiven: true,
//         sentCompliance: isFirstCheckin ? false : lastCheckin?.sentCompliance || false,
//         lastCheckinAt: new Date(),
//       });

//       console.log("💾 New checkin log created:", newCheckin._id);
//     } catch (err) {
//       console.error("❌ Failed to create checkin log:", err);
//       return res.status(500).json({ 
//         ok: false, 
//         error: "Failed to log checkin" 
//       });
//     }

//     // ========== IF IN COOLDOWN, RETURN EARLY ==========
//     if (isInCooldown) {
//       console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
//       return res.status(429).json({
//         ok: false,
//         message: `You can check in again after ${remaining} minute(s).`,
//         cooldownRemaining: remaining,
//         checkinLogged: true,
//       });
//     }

//     // ========== UPDATE POINTS LEDGER ==========
//     let ledger;
//     try {
//       ledger = await PointsLedger.findOneAndUpdate(
//         { phone: normalizedPhone, businessId: business._id },
//         {
//           $inc: { points: 1, totalCheckins: 1 },
//           $set: { lastCheckinAt: new Date() },
//         },
//         { new: true, upsert: true, runValidators: true }
//       );

//       console.log("📘 Points Ledger updated:", ledger);
//     } catch (err) {
//       console.error("❌ Failed to update points ledger:", err);
      
//       // Rollback: Delete the checkin log
//       try {
//         await Checkin.deleteOne({ _id: newCheckin._id });
//         console.log("🔄 Rolled back checkin log");
//       } catch (rollbackErr) {
//         console.error("❌ Rollback failed:", rollbackErr);
//       }
      
//       return res.status(500).json({ 
//         ok: false, 
//         error: "Failed to award points" 
//       });
//     }

//     // ========== SEND COMPLIANCE & WELCOME SMS (FIRST CHECKIN ONLY) ==========
//     if (isFirstCheckin) {
//       try {
//         await sendComplianceSms(business, normalizedPhone, fromNumber);
//         console.log("✅ Compliance SMS sent");
//       } catch (err) {
//         console.error("❌ Compliance SMS failed:", err.message);
//         // Don't fail the checkin
//       }

//       try {
//         const welcomeMsg =
//           business.welcomeMessage ||
//           `Welcome to ${business.name}! Thanks for checking in.`;

//         await client.messages.create({
//           to: normalizedPhone,
//           from: fromNumber,
//           body: welcomeMsg,
//         });
//         console.log("💬 Welcome SMS sent!");
//       } catch (err) {
//         console.error("❌ Welcome SMS failed:", err.message);
//         // Don't fail the checkin
//       }
//     }

//     // ========== GET TOTAL POINTS AFTER CHECKIN ==========
//     const totalPoints = ledger.points;

//     // ========== FETCH REWARD TEMPLATES ==========
//     const rewardTemplates = await Reward.find({
//       businessId: business._id,
//       phone: { $exists: false },
//     }).sort({ threshold: 1 });

//     let newReward = null;

//     // ========== PROCESS REWARDS ==========
//     try {
//       for (const template of rewardTemplates) {
//         const alreadyIssued = await Reward.findOne({
//           businessId: business._id,
//           phone: normalizedPhone,
//           name: template.name,
//           redeemed: false,
//         });

//         if (!alreadyIssued && totalPoints >= template.threshold) {
//           newReward = await Reward.create({
//             businessId: business._id,
//             phone: normalizedPhone,
//             name: template.name,
//             description: template.description,
//             threshold: template.threshold,
//             code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
//             expiresAt: new Date(
//               Date.now() + (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
//             ),
//             redeemed: false,
//           });

//           console.log("🎁 New reward issued:", newReward.code);

//           // 🟢 Log reward issuance into RewardHistory
//           await RewardHistory.create({
//             businessId: business._id,
//             rewardId: newReward._id,
//             checkinId: newCheckin._id,
//             phone: normalizedPhone,
//             status: "Active",
//           });
//           console.log("🧾 RewardHistory entry created.");

//           // ✅ Send reward SMS
//           try {
//             await client.messages.create({
//               to: normalizedPhone,
//               from: fromNumber,
//               body: `🎉 Congrats! You've unlocked ${template.name}! Use code ${newReward.code}.`,
//             });
//             console.log("📱 Reward SMS sent");
//           } catch (err) {
//             console.error("❌ Reward SMS failed:", err.message);
//             // Don't fail - reward is still valid
//           }

//           break; // Issue only one reward per checkin
//         }
//       }
//     } catch (err) {
//       console.error("❌ Reward processing error:", err.message);
//       // Don't fail the checkin if reward fails
//     }

//     // ========== SUCCESS RESPONSE ==========
//     console.log("✅ Check-in complete.");
//     res.json({
//       ok: true,
//       phone: normalizedPhone,
//       business: business.name,
//       totalPoints: ledger.points,
//       totalCheckins: ledger.totalCheckins,
//       newReward: newReward ? {
//         name: newReward.name,
//         code: newReward.code,
//         description: newReward.description,
//         expiresAt: newReward.expiresAt,
//       } : null,
//     });

//   } catch (err) {
//     console.error("💥 Check-in error:", err);

//     // Handle specific mongoose errors
//     if (err.name === "ValidationError") {
//       return res.status(400).json({
//         ok: false,
//         error: "Invalid data provided",
//         details: Object.keys(err.errors).map(key => ({
//           field: key,
//           message: err.errors[key].message,
//         })),
//       });
//     }

//     if (err.name === "MongoError" || err.name === "MongoServerError") {
//       return res.status(500).json({
//         ok: false,
//         error: "Database error occurred",
//       });
//     }

//     // Generic error
//     res.status(500).json({ 
//       ok: false, 
//       error: "Server error" 
//     });
//   }
// };



// // exports.checkin = async (req, res) => {
// //   try {
// //     const { phone, businessSlug } = req.body;

// //     // ✅ Normalize phone number
// //     let normalizedPhone = phone?.trim() || "";
// //     normalizedPhone = normalizedPhone.replace(/\D/g, "");
// //     if (!normalizedPhone.startsWith("1")) normalizedPhone = "1" + normalizedPhone;
// //     normalizedPhone = "+" + normalizedPhone;

// //     console.log("📥 Incoming check-in:", { original: phone, normalized: normalizedPhone, businessSlug });

// //     if (!phone || !businessSlug)
// //       return res.status(400).json({ error: "phone and businessSlug required" });

// //     // 🔹 Get business
// //     const business = await Business.findOne({ slug: businessSlug });
// //     if (!business) return res.status(404).json({ error: "Business not found" });

// //     const fromNumber =
// //       business.twilioNumber ||
// //       process.env.DEFAULT_TWILIO_NUMBER ||
// //       process.env.TWILIO_PHONE_NUMBER;

// //     // 🔹 Check existing check-in
// //     let existingCheckin = await Checkin.findOne({
// //       phone: normalizedPhone,
// //       businessId: business._id,
// //     });

// //     // 🔹 Cooldown
// //     const cooldownMinutes = 0.1;
// //     if (existingCheckin) {
// //       const minutesSinceLast =
// //         (Date.now() - new Date(existingCheckin.updatedAt)) / (1000 * 60);
// //       if (minutesSinceLast < cooldownMinutes) {
// //         const remaining = Math.ceil(cooldownMinutes - minutesSinceLast);
// //         console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
// //         return res.json({
// //           ok: false,
// //           message: `You can check in again after ${remaining} minutes.`,
// //         });
// //       }
// //     }

// //     // ✅ Update or create checkin
// //     if (existingCheckin) {
// //       existingCheckin.totalCheckins += 1;
// //       existingCheckin.pointsAwarded += 1;
// //       existingCheckin.lastCheckinAt = new Date();
// //       await existingCheckin.save();
// //       console.log("🔁 Existing check-in updated:", existingCheckin._id);
// //     } else {
// //       existingCheckin = await Checkin.create({
// //         businessId: business._id,
// //         phone: normalizedPhone,
// //         pointsAwarded: 1,
// //         totalCheckins: 1,
// //         consentGiven: true,
// //         sentCompliance: false,
// //       });
// //       console.log("💾 New check-in created:", existingCheckin._id);
// //     }

// //     // ✅ Update Points Ledger
// //     const ledger = await PointsLedger.findOneAndUpdate(
// //       { phone: normalizedPhone, businessId: business._id },
// //       {
// //         $inc: { points: 1 },
// //         $set: { lastCheckinAt: new Date() },
// //         $setOnInsert: { createdAt: new Date() },
// //       },
// //       { new: true, upsert: true }
// //     );

// //     console.log("📘 Points Ledger updated:", ledger);

// //     // ✅ Send compliance & welcome SMS for first checkin only
// //     if (!existingCheckin || existingCheckin.totalCheckins === 1) {
// //       try {
// //         await sendComplianceSms(business, normalizedPhone, fromNumber);
// //         console.log("✅ Compliance SMS sent.");

// //         const welcomeMsg =
// //           business.welcomeMessage ||
// //           `Welcome to ${business.name}! Thanks for checking in.`;

// //         await client.messages.create({
// //           to: normalizedPhone,
// //           from: fromNumber,
// //           body: welcomeMsg,
// //         });
// //         console.log("💬 Welcome SMS sent!");
// //       } catch (err) {
// //         console.error("❌ SMS sending failed:", err.message);
// //       }
// //     }

// //     // ✅ Get total points after checkin
// //     const totalPoints = ledger.points;

// //     // ✅ Fetch reward templates
// //     const rewardTemplates = await Reward.find({
// //       businessId: business._id,
// //       phone: { $exists: false },
// //     });

// //     let newReward = null;

// //     for (const template of rewardTemplates) {
// //       const alreadyIssued = await Reward.findOne({
// //         businessId: business._id,
// //         phone: normalizedPhone,
// //         name: template.name,
// //         redeemed: false,
// //       });

// //       if (!alreadyIssued && totalPoints >= template.threshold) {
// //         newReward = await Reward.create({
// //           businessId: business._id,
// //           phone: normalizedPhone,
// //           name: template.name,
// //           description: template.description,
// //           threshold: template.threshold,
// //           code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
// //           expiresAt: new Date(
// //             Date.now() + (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
// //           ),
// //           redeemed: false,
// //         });

// //         console.log("🎁 New reward issued:", newReward.code);

// //         // ✅ Deduct points
// //         await PointsLedger.updateOne(
// //           { businessId: business._id, phone: normalizedPhone },
// //           { $inc: { points: -template.threshold } }
// //         );

// //         // 🟢 NEW: Log reward issuance into RewardHistory
// //         await RewardHistory.create({
// //           businessId: business._id,
// //           rewardId: newReward._id,
// //           checkinId: existingCheckin._id,
// //           phone: normalizedPhone,
// //           status: "Active",
// //         });
// //         console.log("🧾 RewardHistory entry created.");

// //         // ✅ Send SMS
// //         await client.messages.create({
// //           to: normalizedPhone,
// //           from: fromNumber,
// //           body: `🎉 Congrats! You’ve unlocked ${template.name}! Use code ${newReward.code}.`,
// //         });
// //       }
// //     }

// //     // ✅ Done
// //     console.log("✅ Check-in complete.");
// //     res.json({
// //       ok: true,
// //       phone: normalizedPhone,
// //       business: business.name,
// //       totalPoints: ledger.points,
// //       newReward,
// //     });
// //   } catch (err) {
// //     console.error("💥 Check-in error:", err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };





//   /**
//    * 💬 POST /api/twilio/webhook
//    * Handles incoming STOP / START / HELP / OTHER messages from Twilio.
//    */
//   exports.twilioWebhook = async (req, res) => {
//     try {
//       const { From, Body, MessageSid, To } = req.body;
//       const incomingFrom = normalizePhone(From);
//       console.log("📩 Incoming Twilio message:", req.body);

//       if (!From) {
//         console.warn("⚠️ Webhook missing 'From' number, ignoring.");
//         return res.type("text/xml").send("<Response></Response>");
//       }

//       const incoming = Body ? Body.trim().toUpperCase() : "";
//       let eventType = "OTHER";
//       if (incoming.includes("STOP")) eventType = "STOP";
//       else if (incoming.includes("START")) eventType = "START";
//       else if (incoming.includes("HELP")) eventType = "HELP";

//       // 🔹 Find last check-in by phone (if any)
//       const checkin = await Checkin.findOne({ phone: incomingFrom }).sort({ createdAt: -1 });

//       // 🔹 Log inbound event
//       const inbound = await InboundEvent.create({
//         fromNumber: incomingFrom,
//         body: Body,
//         eventType,
//         checkinId: checkin ? checkin._id : null,
//         raw: req.body,
//       });

//       console.log("✅ InboundEvent saved:", inbound._id, "Type:", eventType);

//       // 🔹 Update subscription status if STOP/START
//       if (checkin) {
//         if (eventType === "STOP") checkin.unsubscribed = true;
//         else if (eventType === "START") checkin.unsubscribed = false;
//         await checkin.save();
//       }

//       // 🔹 Respond to Twilio
//       const twiml = new twilio.twiml.MessagingResponse();

//       if (eventType === "STOP") {
//         twiml.message("You have been unsubscribed. Reply START to rejoin.");
//       } else if (eventType === "START") {
//         twiml.message("You are now subscribed again. Thank you!");
//       } else if (eventType === "HELP") {
//         twiml.message("Reply START to subscribe again or STOP to unsubscribe.");
//       } else {
//         twiml.message("Thanks for your message! We'll get back to you soon.");
//       }

//       res.type("text/xml").send(twiml.toString());
//     } catch (err) {
//       console.error("💥 Webhook error:", err);
//       res.status(500).send("<Response></Response>");
//     }
//   };




//   /**
//    * 🏪 GET /api/kiosk/:slug
//    * Returns business details by slug for kiosk display.
//    */
//   exports.getKioskBySlug = async (req, res) => {
//     try {
//       const { slug } = req.params;
//       console.log(`🟢 Kiosk request for slug: ${slug}`);

//       const business = await Business.findOne({ slug });
//       if (!business) {
//         return res.status(404).json({ error: "Business not found" });
//       }

//       // 🔹 Fetch current active rewards for display
//       const activeRewards = await Reward.find({
//         businessId: business._id,
//         redeemed: false,
//         $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
//       }).sort({ createdAt: -1 });

//       res.json({
//         ok: true,
//         business,
//         activeRewards,
//         message: `Loaded kiosk for ${business.name}`,
//       });
//     } catch (err) {
//       console.error("❌ Failed to load kiosk:", err);
//       res.status(500).json({ error: "server error" });
//     }
//   };


const Business = require("../models/Business");
const Customer = require("../models/Customer");
const CheckinLog = require("../models/CheckinLog");
const InboundEvent = require("../models/InboundEvent");
const Reward = require("../models/Reward");
const RewardHistory = require("../models/rewardHistory");
const { sendComplianceSms, client } = require("../services/twilioService");
const twilio = require("twilio");

// ✅ Normalize phone number helper
const normalizePhone = (num) => {
  if (!num) return num;
  const digits = num.toString().replace(/\D/g, "");
  if (num.trim().startsWith("+")) return `+${digits}`;
  return `+${digits}`;
};

/**
 * 📲 POST /api/kiosk/checkin
 * Main check-in endpoint - creates/updates Customer record
 */
/**
 * 📲 POST /api/kiosk/checkin
 * Main check-in endpoint - creates/updates Customer record
 * ✅ MODIFIED: 24-hour cooldown for earning points
 */
exports.checkin = async (req, res) => {
  try {
    const { phone, businessSlug, dateOfBirth } = req.body;

    // ========== VALIDATION ==========
    if (!phone || !businessSlug) {
      return res.status(400).json({ 
        ok: false, 
        error: "phone and businessSlug are required" 
      });
    }

    // ✅ Normalize phone number
    let normalizedPhone = phone?.trim() || "";
    normalizedPhone = normalizedPhone.replace(/\D/g, "");

    if (!normalizedPhone) {
      return res.status(400).json({ 
        ok: false, 
        error: "Invalid phone number format" 
      });
    }
    
    if (!normalizedPhone.startsWith("1")) normalizedPhone = "1" + normalizedPhone;
    normalizedPhone = "+" + normalizedPhone;

    console.log("📥 Incoming check-in:", { 
      original: phone, 
      normalized: normalizedPhone, 
      businessSlug 
    });

    // ========== GET BUSINESS ==========
    const business = await Business.findOne({ slug: businessSlug });
    if (!business) {
      return res.status(404).json({ 
        ok: false, 
        error: "Business not found" 
      });
    }

    // ========== AGE GATE CHECK ==========
    if (business.ageGate?.enabled && dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < (business.ageGate.minAge || 18)) {
        return res.status(403).json({
          ok: false,
          error: `You must be ${business.ageGate.minAge || 18}+ to check in`,
        });
      }
    }

    // ========== CHECK IF TWILIO NUMBER IS ACTIVE ==========
    if (!business.twilioNumberActive) {
      return res.status(503).json({
        ok: false,
        error: "SMS service temporarily unavailable for this business",
      });
    }

    const fromNumber =
      business.twilioNumber ||
      process.env.DEFAULT_TWILIO_NUMBER ||
      process.env.TWILIO_PHONE_NUMBER;

    if (!fromNumber) {
      console.error("❌ No Twilio number configured");
      return res.status(500).json({ 
        ok: false, 
        error: "SMS service not configured" 
      });
    }

    // ========== FIND CUSTOMER AND CHECK STATUS ==========
    let customer = await Customer.findOne({
      phone: normalizedPhone,
      businessId: business._id,
    });

    // ========== BLOCKED STATUS CHECK ==========
    if (customer && customer.subscriberStatus === 'blocked') {
      console.log("🚫 Customer is blocked:", normalizedPhone);
      
      // Log the blocked attempt
      try {
        await CheckinLog.create({
          businessId: business._id,
          phone: normalizedPhone,
          countryCode: "+1",
          status: "kiosk",
          pointsAwarded: 0,
          metadata: {
            blocked: true,
            subscriberStatus: "blocked",
            attemptReason: "Customer is blocked from checking in"
          }
        });
        console.log("📝 Blocked attempt logged");
      } catch (logErr) {
        console.error("❌ Failed to log blocked attempt:", logErr);
      }

      return res.status(403).json({
        ok: false,
        error: "Your account has been blocked. Please contact the business for assistance.",
        blocked: true
      });
    }

    // ========== OPTED-OUT STATUS CHECK ==========
    if (customer && customer.subscriberStatus === 'opted-out') {
      console.log("⚠️ Customer is opted-out:", normalizedPhone);
      
      // Log the opted-out attempt
      try {
        await CheckinLog.create({
          businessId: business._id,
          phone: normalizedPhone,
          countryCode: "+1",
          status: "kiosk",
          pointsAwarded: 0,
          metadata: {
            optedOut: true,
            subscriberStatus: "opted-out",
            attemptReason: "Customer has opted out of service"
          }
        });
        console.log("📝 Opted-out attempt logged");
      } catch (logErr) {
        console.error("❌ Failed to log opted-out attempt:", logErr);
      }

      return res.status(403).json({
        ok: false,
        error: "You have opted out of this service. Reply START to resubscribe first.",
        optedOut: true
      });
    }

    const isFirstCheckin = !customer;
    let isNewlyUnblocked = false;

    // ========== CHECK IF RECENTLY UNBLOCKED ==========
    if (customer && customer.unblockDate) {
      const hoursSinceUnblock = (Date.now() - new Date(customer.unblockDate).getTime()) / (1000 * 60 * 60);
      
      // If unblocked within last 24 hours, show welcome back message
      if (hoursSinceUnblock < 24) {
        isNewlyUnblocked = true;
      }
    }

    // ========== 24-HOUR COOLDOWN CHECK ==========
    // ✅ CHANGED: From 0.1 minutes to 24 hours (1440 minutes)
    const cooldownHours = 24; // ✅ NEW: 24-hour cooldown period
    const cooldownMinutes = cooldownHours * 60; // ✅ CHANGED: Convert to minutes
    let isInCooldown = false;
    let remainingHours = 0;
    let remainingMinutes = 0;

    if (customer && customer.lastCheckinAt) {
      // ✅ CHANGED: Calculate hours instead of minutes
      const hoursSinceLast = (Date.now() - new Date(customer.lastCheckinAt)) / (1000 * 60 * 60);
      isInCooldown = hoursSinceLast < cooldownHours; // ✅ CHANGED: Check against 24 hours
      
      if (isInCooldown) {
        remainingHours = Math.floor(cooldownHours - hoursSinceLast); // ✅ NEW: Calculate remaining hours
        remainingMinutes = Math.ceil((cooldownHours - hoursSinceLast - remainingHours) * 60); // ✅ NEW: Calculate remaining minutes
      }
    }

    // ========== DETERMINE POINTS TO AWARD ==========
    // ✅ NEW: Only award points if NOT in cooldown
    const pointsToAward = isInCooldown ? 0 : 1;

    // ========== CREATE CHECKIN LOG (ALWAYS) ==========
    let checkinLog;
    try {
      const logData = {
        businessId: business._id,
        phone: normalizedPhone,
        countryCode: "+1",
        status: "kiosk",
        pointsAwarded: pointsToAward, // ✅ CHANGED: Use calculated points
      };

      // ✅ CHANGED: Add 24-hour cooldown metadata
      if (isInCooldown) {
        logData.metadata = {
          cooldown: true,
          cooldownRemainingHours: remainingHours, // ✅ NEW: Track remaining hours
          cooldownRemainingMinutes: remainingMinutes, // ✅ NEW: Track remaining minutes
          attemptReason: "Check-in attempted within 24-hour cooldown period", // ✅ CHANGED: Updated message
          lastCheckinAt: customer.lastCheckinAt // ✅ NEW: Track when they last checked in
        };
      }

      // Add unblock metadata if newly unblocked
      if (isNewlyUnblocked) {
        logData.metadata = {
          ...logData.metadata,
          newlyUnblocked: true,
          unblockDate: customer.unblockDate
        };
      }

      checkinLog = await CheckinLog.create(logData);
      console.log("💾 Checkin log created:", checkinLog._id);
    } catch (err) {
      console.error("❌ Failed to create checkin log:", err);
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to log checkin" 
      });
    }

    // ========== IF IN COOLDOWN, STILL UPDATE CHECKIN COUNT BUT NOT POINTS ==========
    // ✅ CHANGED: Cooldown now means they can check in but don't earn points
    try {
      if (customer) {
        // ✅ CHANGED: Update customer record differently based on cooldown
        if (isInCooldown) {
          // During cooldown: increment checkin count but DON'T add points
          customer.totalCheckins += 1;
          // lastCheckinAt stays the same (from the last points-earning checkin)
          console.log(`⏳ Cooldown active: ${remainingHours}h ${remainingMinutes}m remaining. No points awarded.`);
        } else {
          // After cooldown: increment both checkins AND points
          customer.points += 1; // ✅ Only add point if cooldown passed
          customer.totalCheckins += 1;
          customer.lastCheckinAt = new Date(); // ✅ CHANGED: Only update timestamp when points awarded
          console.log(`✅ Cooldown passed. Point awarded. Next point available in 24 hours.`);
        }

        // Clear unblockDate flag after first successful checkin post-unblock
        if (customer.unblockDate && isNewlyUnblocked) {
          const hoursSinceUnblock = (Date.now() - new Date(customer.unblockDate).getTime()) / (1000 * 60 * 60);
          if (hoursSinceUnblock >= 24) {
            customer.unblockDate = undefined;
          }
        }

        // Update age verification if provided
        if (dateOfBirth && !customer.ageVerified) {
          customer.ageVerified = true;
          customer.ageVerifiedAt = new Date();
        }

        await customer.save();
        console.log("🔄 Customer updated:", customer._id);
      } else {
        // ✅ NEW CUSTOMER: Always award first point
        customer = await Customer.create({
          phone: normalizedPhone,
          countryCode: "+1",
          businessId: business._id,
          subscriberStatus: "active",
          points: 1, // ✅ First checkin always gets a point
          totalCheckins: 1,
          firstCheckinAt: new Date(),
          lastCheckinAt: new Date(), // ✅ Set the cooldown timer
          consentGiven: true,
          consentTimestamp: new Date(),
          ageVerified: !!dateOfBirth,
          ageVerifiedAt: dateOfBirth ? new Date() : undefined,
        });

        console.log("✨ New customer created:", customer._id);
      }
    } catch (err) {
      console.error("❌ Failed to update customer:", err);
      
      // Rollback: Delete the checkin log
      try {
        await CheckinLog.deleteOne({ _id: checkinLog._id });
        console.log("🔄 Rolled back checkin log");
      } catch (rollbackErr) {
        console.error("❌ Rollback failed:", rollbackErr);
      }
      
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to update customer record" 
      });
    }

    // ========== SEND COMPLIANCE & WELCOME SMS (FIRST CHECKIN ONLY) ==========
    if (isFirstCheckin) {
      try {
        await sendComplianceSms(business, normalizedPhone, fromNumber);
        console.log("✅ Compliance SMS sent");
      } catch (err) {
        console.error("❌ Compliance SMS failed:", err.message);
      }

      try {
        const welcomeMsg =
          business.welcomeMessage ||
          `Welcome to ${business.name}! Thanks for checking in. You'll earn 1 point per day.`; // ✅ CHANGED: Updated welcome message

        await client.messages.create({
          to: normalizedPhone,
          from: fromNumber,
          body: welcomeMsg,
        });
        console.log("💬 Welcome SMS sent!");
      } catch (err) {
        console.error("❌ Welcome SMS failed:", err.message);
      }
    }

    // ========== SEND WELCOME BACK SMS (NEWLY UNBLOCKED) ==========
    if (isNewlyUnblocked) {
      try {
        await client.messages.create({
          to: normalizedPhone,
          from: fromNumber,
          body: `Welcome back to ${business.name}! Your account has been reactivated and points reset. Thanks for returning!`,
        });
        console.log("🎉 Welcome back SMS sent to unblocked customer");
      } catch (err) {
        console.error("❌ Welcome back SMS failed:", err.message);
      }
    }

    // ========== FETCH REWARD TEMPLATES ==========
    // ✅ CHANGED: Only check for rewards if points were awarded
    let newReward = null;
    
    if (!isInCooldown) { // ✅ NEW: Only process rewards when points are earned
      const rewardTemplates = await Reward.find({
        businessId: business._id,
        phone: { $exists: false }, // Only templates (not assigned to customers)
        isActive: true,
      }).sort({ priority: 1 });

      // ========== PROCESS REWARDS ==========
      try {
        for (const template of rewardTemplates) {
          // Check if customer already has this reward (unredeemed)
          const alreadyIssued = await Reward.findOne({
            businessId: business._id,
            phone: normalizedPhone,
            name: template.name,
            redeemed: false,
          });

          // If not issued yet and customer has enough points
          if (!alreadyIssued && customer.points >= template.threshold) {
            // Generate unique reward code
            const rewardCode = `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

            // Create reward instance for this customer
            newReward = await Reward.create({
              businessId: business._id,
              phone: normalizedPhone,
              name: template.name,
              description: template.description,
              threshold: template.threshold,
              code: rewardCode,
              expiresAt: template.expiryDays 
                ? new Date(Date.now() + template.expiryDays * 24 * 60 * 60 * 1000)
                : null,
              redeemed: false,
              priority: template.priority,
              isActive: true,
            });

            console.log("🎁 New reward issued:", newReward.code);

            // Log reward issuance into RewardHistory
            await RewardHistory.create({
              businessId: business._id,
              rewardId: newReward._id,
              checkinId: checkinLog._id,
              phone: normalizedPhone,
              status: "Active",
            });
            console.log("🧾 RewardHistory entry created");

            // Send reward SMS
            try {
              const expiryText = template.expiryDays 
                ? ` Valid for ${template.expiryDays} days.`
                : "";

              await client.messages.create({
                to: normalizedPhone,
                from: fromNumber,
                body: `🎉 Congrats! You've unlocked ${template.name}! Use code ${rewardCode}.${expiryText}`,
              });
              console.log("📱 Reward SMS sent");
            } catch (err) {
              console.error("❌ Reward SMS failed:", err.message);
            }

            // Only issue one reward per checkin
            break;
          }
        }
      } catch (err) {
        console.error("❌ Reward processing error:", err.message);
      }
    }

    // ========== SUCCESS RESPONSE ==========
    console.log("✅ Check-in complete");
    
    // ✅ CHANGED: Response includes cooldown information
    const response = {
      ok: true,
      phone: normalizedPhone,
      business: business.name,
      totalPoints: customer.points,
      totalCheckins: customer.totalCheckins,
      pointsAwarded: pointsToAward, // ✅ NEW: Tell them if they got points
      isNewCustomer: isFirstCheckin,
      isNewlyUnblocked: isNewlyUnblocked,
      subscriberStatus: customer.subscriberStatus,
      newReward: newReward ? {
        name: newReward.name,
        code: newReward.code,
        description: newReward.description,
        expiresAt: newReward.expiresAt,
      } : null,
    };

    // ✅ NEW: Add cooldown information to response
    if (isInCooldown) {
      response.cooldown = {
        active: true,
        remainingHours: remainingHours,
        remainingMinutes: remainingMinutes,
        message: `You can earn your next point in ${remainingHours}h ${remainingMinutes}m`, // ✅ NEW: User-friendly message
        nextPointAvailableAt: new Date(new Date(customer.lastCheckinAt).getTime() + (24 * 60 * 60 * 1000)) // ✅ NEW: Exact timestamp
      };
    } else if (customer.lastCheckinAt) {
      response.cooldown = {
        active: false,
        message: "Point earned! Check in again in 24 hours for your next point.", // ✅ NEW: Success message
        nextPointAvailableAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // ✅ NEW: When next point available
      };
    }

    res.json(response);

  } catch (err) {
    console.error("💥 Check-in error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        ok: false,
        error: "Invalid data provided",
        details: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message,
        })),
      });
    }

    if (err.name === "MongoError" || err.name === "MongoServerError") {
      return res.status(500).json({
        ok: false,
        error: "Database error occurred",
      });
    }

    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};

/**
 * 💬 POST /api/twilio/webhook
 * Handles incoming STOP / START / HELP / OTHER messages from Twilio.
 */
exports.twilioWebhook = async (req, res) => {
  try {
    const { From, Body, MessageSid, To } = req.body;
    const incomingFrom = normalizePhone(From);
    console.log("📩 Incoming Twilio message:", req.body);

    if (!From) {
      console.warn("⚠️ Webhook missing 'From' number, ignoring.");
      return res.type("text/xml").send("<Response></Response>");
    }

    const incoming = Body ? Body.trim().toUpperCase() : "";
    let eventType = "OTHER";
    if (incoming.includes("STOP")) eventType = "STOP";
    else if (incoming.includes("START")) eventType = "START";
    else if (incoming.includes("HELP")) eventType = "HELP";

    // Find customer by phone
    const customer = await Customer.findOne({ phone: incomingFrom }).sort({ createdAt: -1 });

    // Log inbound event
    const inbound = await InboundEvent.create({
      fromNumber: incomingFrom,
      body: Body,
      eventType,
      customerId: customer ? customer._id : null,
      raw: req.body,
    });

    console.log("✅ InboundEvent saved:", inbound._id, "Type:", eventType);

    // Update subscription status
    if (customer) {
      // Don't allow START if customer is blocked
      if (customer.subscriberStatus === 'blocked' && eventType === 'START') {
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message("Your account is blocked. Please contact the business for assistance.");
        console.log("🚫 Blocked customer attempted to START");
        return res.type("text/xml").send(twiml.toString());
      }

      if (eventType === "STOP") {
        customer.subscriberStatus = "opted-out";
      } else if (eventType === "START") {
        customer.subscriberStatus = "active";
      }
      await customer.save();
      console.log(`📝 Customer status updated to: ${customer.subscriberStatus}`);
    }

    // Respond to Twilio
    const twiml = new twilio.twiml.MessagingResponse();

    if (eventType === "STOP") {
      twiml.message("You have been unsubscribed. Reply START to rejoin.");
    } else if (eventType === "START") {
      twiml.message("You are now subscribed again. Thank you!");
    } else if (eventType === "HELP") {
      twiml.message("Reply START to subscribe again or STOP to unsubscribe.");
    } else {
      twiml.message("Thanks for your message! We'll get back to you soon.");
    }

    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.error("💥 Webhook error:", err);
    res.status(500).send("<Response></Response>");
  }
};

/**
 * 🔒 POST /api/admin/customers/:id/block
 * Blocks a customer by customer ID (for admin panel)
 */
exports.blockCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ 
        ok: false, 
        error: "Customer not found" 
      });
    }

    if (customer.subscriberStatus === 'blocked') {
      return res.status(400).json({ 
        ok: false, 
        error: "Customer is already blocked" 
      });
    }

    // Block customer
    customer.subscriberStatus = "blocked";
    customer.blockReason = reason || "Blocked by admin";
    customer.blockDate = new Date();
    
    await customer.save();

    console.log(`🔒 Customer blocked: ${customer.phone}`);

    res.json({
      ok: true,
      message: "Customer blocked successfully",
      customer: {
        id: customer._id,
        phone: customer.phone,
        subscriberStatus: customer.subscriberStatus,
        blockReason: customer.blockReason,
        blockDate: customer.blockDate,
      }
    });
  } catch (err) {
    console.error("💥 Block customer error:", err);
    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};

/**
 * 🔓 POST /api/admin/customers/:id/unblock
 * Unblocks a customer by customer ID (for admin panel)
 */
exports.unblockCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ 
        ok: false, 
        error: "Customer not found" 
      });
    }

    if (customer.subscriberStatus !== 'blocked') {
      return res.status(400).json({ 
        ok: false, 
        error: "Customer is not currently blocked" 
      });
    }

    // Update customer: unblock and reset points
    customer.subscriberStatus = "active";
    customer.points = 0; // ✅ Reset points to 0
    customer.totalCheckins = 0; // ✅ Reset checkin count
    customer.unblockDate = new Date(); // ✅ Track when unblocked
    customer.blockReason = undefined; // Clear block reason
    
    await customer.save();

    console.log(`🔓 Customer unblocked and points reset: ${customer.phone}`);

    // Optional: Send SMS notification
    try {
      const business = await Business.findById(customer.businessId);
      if (business && business.twilioNumber) {
        await client.messages.create({
          to: customer.phone,
          from: business.twilioNumber,
          body: `Good news! Your account with ${business.name} has been unblocked. Your points have been reset to 0. Check in again to start earning rewards!`,
        });
        console.log("📱 Unblock notification SMS sent");
      }
    } catch (smsErr) {
      console.error("❌ Failed to send unblock SMS:", smsErr.message);
    }

    res.json({
      ok: true,
      message: "Customer unblocked successfully. Points reset to 0.",
      customer: {
        id: customer._id,
        phone: customer.phone,
        subscriberStatus: customer.subscriberStatus,
        points: customer.points,
        totalCheckins: customer.totalCheckins,
        unblockDate: customer.unblockDate,
      }
    });
  } catch (err) {
    console.error("💥 Unblock customer error:", err);
    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};

/**
 * 🔓 POST /api/kiosk/admin/unblock-customer (Legacy - by phone)
 * Unblocks a customer by phone and resets their points to 0
 */
exports.unblockCustomer = async (req, res) => {
  try {
    const { phone, businessId } = req.body;

    if (!phone || !businessId) {
      return res.status(400).json({ 
        ok: false, 
        error: "phone and businessId are required" 
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const customer = await Customer.findOne({
      phone: normalizedPhone,
      businessId: businessId,
    });

    if (!customer) {
      return res.status(404).json({ 
        ok: false, 
        error: "Customer not found" 
      });
    }

    if (customer.subscriberStatus !== 'blocked') {
      return res.status(400).json({ 
        ok: false, 
        error: "Customer is not currently blocked" 
      });
    }

    // Update customer: unblock and reset points
    customer.subscriberStatus = "active";
    customer.points = 0; // ✅ Reset points to 0
    customer.totalCheckins = 0; // ✅ Reset checkin count
    customer.unblockDate = new Date(); // ✅ Track when unblocked
    
    await customer.save();

    console.log(`🔓 Customer unblocked and points reset: ${normalizedPhone}`);

    // Optional: Send SMS notification
    try {
      const business = await Business.findById(businessId);
      if (business && business.twilioNumber) {
        await client.messages.create({
          to: normalizedPhone,
          from: business.twilioNumber,
          body: `Good news! Your account with ${business.name} has been unblocked. Your points have been reset to 0. Check in again to start earning rewards!`,
        });
        console.log("📱 Unblock notification SMS sent");
      }
    } catch (smsErr) {
      console.error("❌ Failed to send unblock SMS:", smsErr.message);
    }

    res.json({
      ok: true,
      message: "Customer unblocked successfully",
      customer: {
        phone: customer.phone,
        subscriberStatus: customer.subscriberStatus,
        points: customer.points,
        totalCheckins: customer.totalCheckins,
        unblockDate: customer.unblockDate,
      }
    });
  } catch (err) {
    console.error("💥 Unblock customer error:", err);
    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};

/**
 * 🔒 POST /api/kiosk/admin/block-customer (Legacy - by phone)
 * Blocks a customer by phone from checking in
 */
exports.blockCustomer = async (req, res) => {
  try {
    const { phone, businessId, reason } = req.body;

    if (!phone || !businessId) {
      return res.status(400).json({ 
        ok: false, 
        error: "phone and businessId are required" 
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const customer = await Customer.findOne({
      phone: normalizedPhone,
      businessId: businessId,
    });

    if (!customer) {
      return res.status(404).json({ 
        ok: false, 
        error: "Customer not found" 
      });
    }

    if (customer.subscriberStatus === 'blocked') {
      return res.status(400).json({ 
        ok: false, 
        error: "Customer is already blocked" 
      });
    }

    // Block customer
    customer.subscriberStatus = "blocked";
    customer.blockReason = reason || "Blocked by admin";
    customer.blockDate = new Date();
    
    await customer.save();

    console.log(`🔒 Customer blocked: ${normalizedPhone}`);

    res.json({
      ok: true,
      message: "Customer blocked successfully",
      customer: {
        phone: customer.phone,
        subscriberStatus: customer.subscriberStatus,
        blockReason: customer.blockReason,
        blockDate: customer.blockDate,
      }
    });
  } catch (err) {
    console.error("💥 Block customer error:", err);
    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};

/**
 * 🏪 GET /api/kiosk/:slug
 * Returns business details by slug for kiosk display.
 */
exports.getKioskBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🟢 Kiosk request for slug: ${slug}`);

    const business = await Business.findOne({ slug });
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Fetch active reward templates (not customer-specific)
    const activeRewards = await Reward.find({
      businessId: business._id,
      phone: { $exists: false }, // Only templates
      isActive: true,
    }).sort({ priority: 1 });

    res.json({
      ok: true,
      business,
      activeRewards,
      message: `Loaded kiosk for ${business.name}`,
    });
  } catch (err) {
    console.error("❌ Failed to load kiosk:", err);
    res.status(500).json({ error: "server error" });
  }
};

module.exports = exports;