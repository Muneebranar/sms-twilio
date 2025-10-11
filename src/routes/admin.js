const express = require('express');
const router = express.Router();
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');
const admin = require('../controllers/adminController');
const auth = require('../middleware/auth');
const upload = require('../config/mutler.js');

// // ✅ Ensure uploads directory exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // ✅ Configure multer storage (preserve file extension)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname); // e.g. .jpg
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// // ✅ Initialize multer
// const upload = multer({ storage });

// 🧩 Public routes
router.post('/create-admin', admin.createAdmin);
router.post('/login', admin.login);

// 🔐 Protected routes (optional auth middleware)
// router.use(auth);

// ✅ Business routes
router.post('/business',admin.createBusiness);
router.get('/business', admin.getAllBusinesses);
router.put('/business/:id', admin.updateBusiness);
// ✅ Delete a business
router.delete('/business/:id', admin.deleteBusiness);


// ✅ Upload logo for business
// NOTE: the form field name must be 'logo'
router.post('/business/:id/logo', upload.single('logo'), admin.uploadLogo);

// ✅ Twilio Numbers
router.get('/twilio-numbers', admin.getTwilioNumbers);
router.post('/twilio-numbers', admin.addTwilioNumber);

// ✅ Logs
router.get('/logs/consents', admin.getConsents);
router.get('/logs/inbound', admin.getInboundEvents);

module.exports = router;
