require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Routes
const kioskRoutes = require("./routes/kiosk");
const adminRoutes = require("./routes/admin");
const smsRoutes = require('./controllers/smsController');

const app = express();

// 🛡️ CORS Configuration - MUST be before routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4000',
      'https://sms-twilio-i93c.onrender.com',
      // Add your production frontend URL here
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
      // In production, use: callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// 🛡️ Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// 📁 Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 API Routes
app.use("/kiosk", kioskRoutes);
app.use("/admin", adminRoutes);
app.use('/api', smsRoutes);

// 🧩 Health check route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    message: "Server is running 🚀",
  });
});

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 💥 Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Global Error:", err);
  
  // Send detailed error in development
  const errorResponse = {
    error: err.message || "Internal server error",
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

module.exports = app;