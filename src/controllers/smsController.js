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






// POST new admin phone (single)
router.post('/admin-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const trimmedPhone = phone.trim();

    // Check if phone already exists
    const existingPhone = await TwilioPhone.findOne({ number: trimmedPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists',
      });
    }

    // Save new phone
    const newPhone = new TwilioPhone({ number: trimmedPhone });
    await newPhone.save();

    res.status(201).json({
      success: true,
      phone: { id: newPhone._id, number: newPhone.number },
      message: 'Admin phone number added successfully',
    });

  } catch (error) {
    console.error('Error saving admin phone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save admin phone number',
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



// POST new phones (single or batch insert)
router.post('/phones', async (req, res) => {
  try {
    // Accept either a single phone string or an array of phones
    let phoneArray = [];

    if (req.body.phone) {
      // Single phone upload
      phoneArray = [req.body.phone.trim()];
    } else if (req.body.phones && Array.isArray(req.body.phones)) {
      // Batch upload
      phoneArray = req.body.phones.map(p => p.trim());
    }

    // Validate input
    if (phoneArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid phone number(s) provided',
      });
    }

    // Remove duplicates in the request itself
    const uniquePhones = [...new Set(phoneArray)];

    // Find which numbers already exist in DB
    const existing = await Phone.find(
      { number: { $in: uniquePhones } },
      { number: 1, _id: 0 }
    );
    const existingNumbers = new Set(existing.map(p => p.number));

    // Filter only new numbers
    const newNumbers = uniquePhones.filter(p => !existingNumbers.has(p));

    if (newNumbers.length === 0) {
      return res.json({
        success: true,
        message: 'All phone numbers already exist',
        phones: [],
        count: 0,
      });
    }

    // Insert new numbers
    const newPhoneDocs = newNumbers.map(number => ({ number }));
    const inserted = await Phone.insertMany(newPhoneDocs, { ordered: false });

    // Respond differently for single vs batch
    if (req.body.phone) {
      // Single phone upload
      return res.status(201).json({
        success: true,
        phone: { id: inserted[0]._id, number: inserted[0].number },
        message: 'Phone number added successfully',
      });
    } else {
      // Batch upload
      return res.status(201).json({
        success: true,
        phones: inserted.map(p => ({ id: p._id, number: p.number })),
        count: inserted.length,
        message: `Added ${inserted.length} new phone number(s) successfully`,
      });
    }

  } catch (error) {
    console.error('Phone save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save phone number(s)',
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


// ✅ DELETE all phone numbers
router.delete('/phones/delete-all', async (req, res) => {
  try {
    await Phone.deleteMany({}); // ✅ Correct model name
    console.log('✅ All phone numbers deleted successfully');
    res.json({ success: true, message: 'All phone numbers deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting all phone numbers:', error);
    res.status(500).json({ success: false, message: 'Failed to delete all phone numbers' });
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

