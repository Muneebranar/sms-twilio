const AdminUser = require('../models/AdminUser');
const Business = require('../models/Business');
const Checkin = require('../models/Checkin');
const InboundEvent = require('../models/InboundEvent');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.createAdmin = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  const admin = await AdminUser.create({ email, password: hashed, name });
  res.json({ ok: true, id: admin._id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await AdminUser.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'invalid' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ sub: admin._id, email: admin.email }, process.env.JWT_SECRET);
  res.json({ ok: true, token });
};

exports.createBusiness = async (req, res) => {
  const { name, country, city, postal_code, slug, twilioNumber, branding } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
  const b = await Business.create({ name, country, city, postal_code, slug, twilioNumber, branding });
  res.json({ ok: true, business: b });
};

exports.getBusiness = async (req, res) => {
  const { slug } = req.params;
  const b = await Business.findOne({ slug });
  if (!b) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, business: b });
};

exports.uploadLogo = async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const path = `/uploads/${req.file.filename}`;
  await Business.findByIdAndUpdate(id, { $set: { 'branding.logo': path } });
  res.json({ ok: true, path });
};

exports.getConsents = async (req, res) => {
  const items = await Checkin.find().sort({ createdAt: -1 }).limit(200);
  res.json({ ok: true, items });
};

exports.getInboundEvents = async (req, res) => {
  const items = await InboundEvent.find().sort({ createdAt: -1 }).limit(200);
  res.json({ ok: true, items });
};
