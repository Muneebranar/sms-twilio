require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const kioskRoutes = require('./routes/kiosk');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/kiosk', kioskRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.json({ ok: true, version: '1.0' }));

module.exports = app;
