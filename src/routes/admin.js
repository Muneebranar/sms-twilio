const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'src/uploads/' });

router.post('/create-admin', admin.createAdmin);
router.post('/login', admin.login);

router.use(auth);
router.post('/business', admin.createBusiness);
router.get('/business/:slug', admin.getBusiness);
router.post('/business/:id/logo', upload.single('logo'), admin.uploadLogo);
router.get('/logs/consents', admin.getConsents);
router.get('/logs/inbound', admin.getInboundEvents);

module.exports = router;
