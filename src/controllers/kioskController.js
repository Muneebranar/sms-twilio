  const Business = require("../models/Business");
  const Checkin = require("../models/Checkin");
  const InboundEvent = require("../models/InboundEvent");
  const PointsLedger = require("../models/PointsLedger");
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
 * 🟢 POST /api/checkin
 * Handles customer check-in for a given business.
 * Includes: compliance SMS, welcome SMS, points tracking, cooldown, and auto rewards.
//  */
// exports.checkin = async (req, res) => {
//   try {
//     const { phone, businessSlug } = req.body;

//     // ✅ Normalize phone number: always ensure it starts with +1
//     let normalizedPhone = phone?.trim() || "";
//     normalizedPhone = normalizedPhone.replace(/\D/g, ""); // remove non-digits
//     if (!normalizedPhone.startsWith("1")) {
//       normalizedPhone = "1" + normalizedPhone;
//     }
//     normalizedPhone = "+" + normalizedPhone;

//     console.log("📥 Incoming check-in:", {
//       original: phone,
//       normalized: normalizedPhone,
//       businessSlug,
//     });

//     if (!phone || !businessSlug) {
//       return res.status(400).json({ error: "phone and businessSlug required" });
//     }

//     // 🔹 Get business by slug
//     const business = await Business.findOne({ slug: businessSlug });
//     if (!business) return res.status(404).json({ error: "Business not found" });

//     const fromNumber =
//       business.twilioNumber ||
//       process.env.DEFAULT_TWILIO_NUMBER ||
//       process.env.TWILIO_PHONE_NUMBER;

//     // 🔹 Get existing check-in for this customer
//     let existingCheckin = await Checkin.findOne({
//       phone: normalizedPhone,
//       businessId: business._id,
//     });

//     // 🔹 Apply cooldown (in minutes)
//     const cooldownMinutes = 0.1;
//     if (existingCheckin) {
//       const minutesSinceLast =
//         (Date.now() - new Date(existingCheckin.updatedAt)) / (1000 * 60);
//       if (minutesSinceLast < cooldownMinutes) {
//         const remaining = Math.ceil(cooldownMinutes - minutesSinceLast);
//         console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
//         return res.json({
//           ok: false,
//           message: `You can check in again after ${remaining} minutes.`,
//         });
//       }
//     }

//     // ✅ If record exists → update existing
//     if (existingCheckin) {
//       existingCheckin.totalCheckins = (existingCheckin.totalCheckins || 1) + 1;
//       existingCheckin.pointsAwarded = (existingCheckin.pointsAwarded || 0) + 1;
//       existingCheckin.lastCheckinAt = new Date();
//       await existingCheckin.save();
//       console.log("🔁 Existing check-in updated:", existingCheckin._id);
//     } else {
//       // ✅ If first time → create new record
//       existingCheckin = await Checkin.create({
//         phone: normalizedPhone,
//         businessId: business._id,
//         pointsAwarded: 1,
//         totalCheckins: 1,
//         consentGiven: true,
//         sentCompliance: false,
//       });
//       console.log("💾 New check-in created:", existingCheckin._id);
//     }

//     // ✅ Update Points Ledger
//     const ledger = await PointsLedger.findOneAndUpdate(
//       { phone: normalizedPhone, businessId: business._id },
//       {
//         $inc: { points: 1 },
//         $set: { lastCheckinAt: new Date() },
//         $setOnInsert: { createdAt: new Date() },
//       },
//       { new: true, upsert: true }
//     );

//     console.log("📘 Points Ledger updated:", ledger);

//     // ✅ Send compliance & welcome SMS only for first-ever check-in
//     if (!existingCheckin || existingCheckin.totalCheckins === 1) {
//       try {
//         await sendComplianceSms(business, normalizedPhone, fromNumber);
//         console.log("✅ Compliance SMS sent.");

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
//         console.error("❌ SMS sending failed:", err.message);
//       }
//     }

//     // ✅ Check rewards
//     const totalPoints = ledger.points;

//     // ✅ Only fetch reward templates (not yet issued ones)
//     const rewardTemplates = await Reward.find({
//       businessId: business._id,
//       phone: { $exists: false },
//     });

//     let newReward = null;

//     for (const template of rewardTemplates) {
//       const alreadyIssued = await Reward.findOne({
//         businessId: business._id,
//         phone: normalizedPhone,
//         name: template.name,
//         redeemed: false,
//       });

//       if (!alreadyIssued && totalPoints >= template.threshold) {
//         newReward = await Reward.create({
//           businessId: business._id,
//           phone: normalizedPhone,
//           name: template.name,
//           description: template.description,
//           threshold: template.threshold,
//           code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
//           expiresAt: new Date(
//             Date.now() +
//               (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
//           ),
//           redeemed: false,
//         });

//         console.log("🎁 New reward issued:", newReward.code);

//         // ✅ Deduct points
//         await PointsLedger.updateOne(
//           { businessId: business._id, phone: normalizedPhone },
//           { $inc: { points: -template.threshold } }
//         );

//         // ✅ Send SMS
//         await client.messages.create({
//           to: normalizedPhone,
//           from: fromNumber,
//           body: `🎉 Congrats! You’ve unlocked ${template.name}! Use code ${newReward.code}.`,
//         });
//       }
//     }

//     // ✅ Done
//     console.log("✅ Check-in complete.");
//     res.json({
//       ok: true,
//       phone: normalizedPhone,
//       business: business.name,
//       totalPoints: ledger.points,
//       newReward,
//     });
//   } catch (err) {
//     console.error("💥 Check-in error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


exports.checkin = async (req, res) => {
  try {
    // const { phone, businessSlug } = req.body;
     const { phone, businessSlug, dateOfBirth } = req.body; // ✅ add DOB


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

//new added
    // ✅ AGE GATE CHECK
    if (business.ageGate?.enabled && dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < (business.ageGate.minAge || 18)) {
        return res.status(403).json({
          ok: false,
          error: `You must be ${business.ageGate.minAge}+ to check in`,
        });
      }
    }

    // ✅ CHECK IF NUMBER IS ACTIVE
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

    // ========== CHECK LAST CHECKIN FOR COOLDOWN ==========
    let lastCheckin = await Checkin.findOne({
      phone: normalizedPhone,
      businessId: business._id,
    }).sort({ createdAt: -1 });

    const cooldownMinutes = 0.1;
    const isInCooldown = lastCheckin 
      ? (Date.now() - new Date(lastCheckin.lastCheckinAt)) / (1000 * 60) < cooldownMinutes
      : false;
    
    const remaining = isInCooldown 
      ? Math.ceil(cooldownMinutes - (Date.now() - new Date(lastCheckin.lastCheckinAt)) / (1000 * 60))
      : 0;

    const isFirstCheckin = !lastCheckin;

    // ========== ALWAYS CREATE NEW CHECKIN LOG ==========
    let newCheckin;
    try {
      newCheckin = await Checkin.create({
        businessId: business._id,
        phone: normalizedPhone,
        pointsAwarded: isInCooldown ? 0 : 1,
        totalCheckins: (lastCheckin?.totalCheckins || 0) + 1,
        consentGiven: true,
        sentCompliance: isFirstCheckin ? false : lastCheckin?.sentCompliance || false,
        lastCheckinAt: new Date(),
      });

      console.log("💾 New checkin log created:", newCheckin._id);
    } catch (err) {
      console.error("❌ Failed to create checkin log:", err);
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to log checkin" 
      });
    }

    // ========== IF IN COOLDOWN, RETURN EARLY ==========
    if (isInCooldown) {
      console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
      return res.status(429).json({
        ok: false,
        message: `You can check in again after ${remaining} minute(s).`,
        cooldownRemaining: remaining,
        checkinLogged: true,
      });
    }

    // ========== UPDATE POINTS LEDGER ==========
    let ledger;
    try {
      ledger = await PointsLedger.findOneAndUpdate(
        { phone: normalizedPhone, businessId: business._id },
        {
          $inc: { points: 1, totalCheckins: 1 },
          $set: { lastCheckinAt: new Date() },
        },
        { new: true, upsert: true, runValidators: true }
      );

      console.log("📘 Points Ledger updated:", ledger);
    } catch (err) {
      console.error("❌ Failed to update points ledger:", err);
      
      // Rollback: Delete the checkin log
      try {
        await Checkin.deleteOne({ _id: newCheckin._id });
        console.log("🔄 Rolled back checkin log");
      } catch (rollbackErr) {
        console.error("❌ Rollback failed:", rollbackErr);
      }
      
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to award points" 
      });
    }

    // ========== SEND COMPLIANCE & WELCOME SMS (FIRST CHECKIN ONLY) ==========
    if (isFirstCheckin) {
      try {
        await sendComplianceSms(business, normalizedPhone, fromNumber);
        console.log("✅ Compliance SMS sent");
      } catch (err) {
        console.error("❌ Compliance SMS failed:", err.message);
        // Don't fail the checkin
      }

      try {
        const welcomeMsg =
          business.welcomeMessage ||
          `Welcome to ${business.name}! Thanks for checking in.`;

        await client.messages.create({
          to: normalizedPhone,
          from: fromNumber,
          body: welcomeMsg,
        });
        console.log("💬 Welcome SMS sent!");
      } catch (err) {
        console.error("❌ Welcome SMS failed:", err.message);
        // Don't fail the checkin
      }
    }

    // ========== GET TOTAL POINTS AFTER CHECKIN ==========
    const totalPoints = ledger.points;

    // ========== FETCH REWARD TEMPLATES ==========
    const rewardTemplates = await Reward.find({
      businessId: business._id,
      phone: { $exists: false },
    }).sort({ threshold: 1 });

    let newReward = null;

    // ========== PROCESS REWARDS ==========
    try {
      for (const template of rewardTemplates) {
        const alreadyIssued = await Reward.findOne({
          businessId: business._id,
          phone: normalizedPhone,
          name: template.name,
          redeemed: false,
        });

        if (!alreadyIssued && totalPoints >= template.threshold) {
          newReward = await Reward.create({
            businessId: business._id,
            phone: normalizedPhone,
            name: template.name,
            description: template.description,
            threshold: template.threshold,
            code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            expiresAt: new Date(
              Date.now() + (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
            ),
            redeemed: false,
          });

          console.log("🎁 New reward issued:", newReward.code);

          // 🟢 Log reward issuance into RewardHistory
          await RewardHistory.create({
            businessId: business._id,
            rewardId: newReward._id,
            checkinId: newCheckin._id,
            phone: normalizedPhone,
            status: "Active",
          });
          console.log("🧾 RewardHistory entry created.");

          // ✅ Send reward SMS
          try {
            await client.messages.create({
              to: normalizedPhone,
              from: fromNumber,
              body: `🎉 Congrats! You've unlocked ${template.name}! Use code ${newReward.code}.`,
            });
            console.log("📱 Reward SMS sent");
          } catch (err) {
            console.error("❌ Reward SMS failed:", err.message);
            // Don't fail - reward is still valid
          }

          break; // Issue only one reward per checkin
        }
      }
    } catch (err) {
      console.error("❌ Reward processing error:", err.message);
      // Don't fail the checkin if reward fails
    }

    // ========== SUCCESS RESPONSE ==========
    console.log("✅ Check-in complete.");
    res.json({
      ok: true,
      phone: normalizedPhone,
      business: business.name,
      totalPoints: ledger.points,
      totalCheckins: ledger.totalCheckins,
      newReward: newReward ? {
        name: newReward.name,
        code: newReward.code,
        description: newReward.description,
        expiresAt: newReward.expiresAt,
      } : null,
    });

  } catch (err) {
    console.error("💥 Check-in error:", err);

    // Handle specific mongoose errors
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

    // Generic error
    res.status(500).json({ 
      ok: false, 
      error: "Server error" 
    });
  }
};



// exports.checkin = async (req, res) => {
//   try {
//     const { phone, businessSlug } = req.body;

//     // ✅ Normalize phone number
//     let normalizedPhone = phone?.trim() || "";
//     normalizedPhone = normalizedPhone.replace(/\D/g, "");
//     if (!normalizedPhone.startsWith("1")) normalizedPhone = "1" + normalizedPhone;
//     normalizedPhone = "+" + normalizedPhone;

//     console.log("📥 Incoming check-in:", { original: phone, normalized: normalizedPhone, businessSlug });

//     if (!phone || !businessSlug)
//       return res.status(400).json({ error: "phone and businessSlug required" });

//     // 🔹 Get business
//     const business = await Business.findOne({ slug: businessSlug });
//     if (!business) return res.status(404).json({ error: "Business not found" });

//     const fromNumber =
//       business.twilioNumber ||
//       process.env.DEFAULT_TWILIO_NUMBER ||
//       process.env.TWILIO_PHONE_NUMBER;

//     // 🔹 Check existing check-in
//     let existingCheckin = await Checkin.findOne({
//       phone: normalizedPhone,
//       businessId: business._id,
//     });

//     // 🔹 Cooldown
//     const cooldownMinutes = 0.1;
//     if (existingCheckin) {
//       const minutesSinceLast =
//         (Date.now() - new Date(existingCheckin.updatedAt)) / (1000 * 60);
//       if (minutesSinceLast < cooldownMinutes) {
//         const remaining = Math.ceil(cooldownMinutes - minutesSinceLast);
//         console.log(`⏳ Cooldown active: ${remaining} minutes remaining`);
//         return res.json({
//           ok: false,
//           message: `You can check in again after ${remaining} minutes.`,
//         });
//       }
//     }

//     // ✅ Update or create checkin
//     if (existingCheckin) {
//       existingCheckin.totalCheckins += 1;
//       existingCheckin.pointsAwarded += 1;
//       existingCheckin.lastCheckinAt = new Date();
//       await existingCheckin.save();
//       console.log("🔁 Existing check-in updated:", existingCheckin._id);
//     } else {
//       existingCheckin = await Checkin.create({
//         businessId: business._id,
//         phone: normalizedPhone,
//         pointsAwarded: 1,
//         totalCheckins: 1,
//         consentGiven: true,
//         sentCompliance: false,
//       });
//       console.log("💾 New check-in created:", existingCheckin._id);
//     }

//     // ✅ Update Points Ledger
//     const ledger = await PointsLedger.findOneAndUpdate(
//       { phone: normalizedPhone, businessId: business._id },
//       {
//         $inc: { points: 1 },
//         $set: { lastCheckinAt: new Date() },
//         $setOnInsert: { createdAt: new Date() },
//       },
//       { new: true, upsert: true }
//     );

//     console.log("📘 Points Ledger updated:", ledger);

//     // ✅ Send compliance & welcome SMS for first checkin only
//     if (!existingCheckin || existingCheckin.totalCheckins === 1) {
//       try {
//         await sendComplianceSms(business, normalizedPhone, fromNumber);
//         console.log("✅ Compliance SMS sent.");

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
//         console.error("❌ SMS sending failed:", err.message);
//       }
//     }

//     // ✅ Get total points after checkin
//     const totalPoints = ledger.points;

//     // ✅ Fetch reward templates
//     const rewardTemplates = await Reward.find({
//       businessId: business._id,
//       phone: { $exists: false },
//     });

//     let newReward = null;

//     for (const template of rewardTemplates) {
//       const alreadyIssued = await Reward.findOne({
//         businessId: business._id,
//         phone: normalizedPhone,
//         name: template.name,
//         redeemed: false,
//       });

//       if (!alreadyIssued && totalPoints >= template.threshold) {
//         newReward = await Reward.create({
//           businessId: business._id,
//           phone: normalizedPhone,
//           name: template.name,
//           description: template.description,
//           threshold: template.threshold,
//           code: `RW-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
//           expiresAt: new Date(
//             Date.now() + (business.rewardExpiryDays || 7) * 24 * 60 * 60 * 1000
//           ),
//           redeemed: false,
//         });

//         console.log("🎁 New reward issued:", newReward.code);

//         // ✅ Deduct points
//         await PointsLedger.updateOne(
//           { businessId: business._id, phone: normalizedPhone },
//           { $inc: { points: -template.threshold } }
//         );

//         // 🟢 NEW: Log reward issuance into RewardHistory
//         await RewardHistory.create({
//           businessId: business._id,
//           rewardId: newReward._id,
//           checkinId: existingCheckin._id,
//           phone: normalizedPhone,
//           status: "Active",
//         });
//         console.log("🧾 RewardHistory entry created.");

//         // ✅ Send SMS
//         await client.messages.create({
//           to: normalizedPhone,
//           from: fromNumber,
//           body: `🎉 Congrats! You’ve unlocked ${template.name}! Use code ${newReward.code}.`,
//         });
//       }
//     }

//     // ✅ Done
//     console.log("✅ Check-in complete.");
//     res.json({
//       ok: true,
//       phone: normalizedPhone,
//       business: business.name,
//       totalPoints: ledger.points,
//       newReward,
//     });
//   } catch (err) {
//     console.error("💥 Check-in error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };





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

      // 🔹 Find last check-in by phone (if any)
      const checkin = await Checkin.findOne({ phone: incomingFrom }).sort({ createdAt: -1 });

      // 🔹 Log inbound event
      const inbound = await InboundEvent.create({
        fromNumber: incomingFrom,
        body: Body,
        eventType,
        checkinId: checkin ? checkin._id : null,
        raw: req.body,
      });

      console.log("✅ InboundEvent saved:", inbound._id, "Type:", eventType);

      // 🔹 Update subscription status if STOP/START
      if (checkin) {
        if (eventType === "STOP") checkin.unsubscribed = true;
        else if (eventType === "START") checkin.unsubscribed = false;
        await checkin.save();
      }

      // 🔹 Respond to Twilio
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

      // 🔹 Fetch current active rewards for display
      const activeRewards = await Reward.find({
        businessId: business._id,
        redeemed: false,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      }).sort({ createdAt: -1 });

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
