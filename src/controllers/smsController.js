const express = require('express');
const router = express.Router();
const Phone = require('../models/smsModel');
const twilio = require('twilio');
const TwilioPhone = require('../models/sms-admin');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);





// GET all admin phones
router.get('/admin-phone', async (req, res) => {
  try {
    const adminPhones = await TwilioPhone.find().sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      phones: adminPhones.map(p => ({ id: p._id, number: p.number }))
    });
  } catch (error) {
    console.error('Error fetching admin phones:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin phone numbers' 
    });
  }
});

// POST new admin phone
router.post('/admin-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      });
    }

    // Check if phone already exists
    const existingPhone = await TwilioPhone.findOne({ number: phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false,
        message: 'This phone number already exists' 
      });
    }

    const newPhone = new TwilioPhone({ number: phone });
    await newPhone.save();

    res.json({ 
      success: true,
      phone: { id: newPhone._id, number: newPhone.number },
      message: 'Admin phone number saved successfully' 
    });
  } catch (error) {
    console.error('Error saving admin phone:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save admin phone number' 
    });
  }
});

// DELETE admin phone
router.delete('/admin-phone/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPhone = await TwilioPhone.findByIdAndDelete(id);

    if (!deletedPhone) {
      return res.status(404).json({ 
        success: false,
        message: 'Phone number not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Admin phone number deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting admin phone:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete admin phone number' 
    });
  }
});







// GET all phones
router.get('/phones', async (req, res) => {
  try {
    const phones = await Phone.find().sort({ createdAt: -1 });
    res.json({ 
      success: true,
      phones: phones.map(p => ({ id: p._id, number: p.number }))
    });
  } catch (error) {
    console.error('Error fetching phones:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch phone numbers' 
    });
  }
});

// POST new phone
router.post('/phones', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      });
    }

    // Check if phone already exists
    const existingPhone = await Phone.findOne({ number: phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number already exists' 
      });
    }

    const newPhone = new Phone({ number: phone });
    await newPhone.save();

    res.status(201).json({ 
      success: true,
      phone: { id: newPhone._id, number: newPhone.number },
      message: 'Phone number added successfully' 
    });
  } catch (error) {
    console.error('Error adding phone:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add phone number' 
    });
  }
});

// PUT update phone
router.put('/phones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number is required' 
      });
    }

    const updatedPhone = await Phone.findByIdAndUpdate(
      id,
      { number: phone, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedPhone) {
      return res.status(404).json({ 
        success: false,
        message: 'Phone number not found' 
      });
    }

    res.json({ 
      success: true,
      phone: { id: updatedPhone._id, number: updatedPhone.number },
      message: 'Phone number updated successfully' 
    });
  } catch (error) {
    console.error('Error updating phone:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update phone number' 
    });
  }
});

// DELETE phone
router.delete('/phones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPhone = await Phone.findByIdAndDelete(id);

    if (!deletedPhone) {
      return res.status(404).json({ 
        success: false,
        message: 'Phone number not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Phone number deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting phone:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete phone number' 
    });
  }
});

// POST send SMS
router.post('/send-sms', async (req, res) => {
  try {
    const { fromPhone, toPhones, message } = req.body;

    if (!fromPhone || !toPhones || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    if (!Array.isArray(toPhones) || toPhones.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one recipient is required' 
      });
    }

    // Send SMS to all numbers
    const promises = toPhones.map(toPhone => 
      client.messages.create({
        body: message,
        from: fromPhone,
        to: toPhone
      })
    );

    const results = await Promise.allSettled(promises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({ 
      success: true,
      message: `SMS sent to ${successful} number(s)`,
      details: {
        total: toPhones.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send SMS',
      error: error.message 
    });
  }
});

module.exports = router;

