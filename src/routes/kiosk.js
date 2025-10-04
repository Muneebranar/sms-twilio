const express = require('express');
const router = express.Router();
const controller = require('../controllers/kioskController');
const twilioValidator = require('../middleware/twilioValidator');

router.post('/checkin', controller.checkin);
router.post('/webhook/twilio', twilioValidator, controller.twilioWebhook);

module.exports = router;
