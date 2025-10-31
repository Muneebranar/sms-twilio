require("dotenv").config();
const express = require("express");
const cors = require("cors");



const app = express();

app.use(cors({
  origin: '*', // or ['http://localhost:5173']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Handle preflight requests globally
app.options('*', cors());



const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Routes
const kioskRoutes = require("./routes/kiosk");
const adminRoutes = require("./routes/admin");
const smsRoutes = require('./controllers/smsController');



// 🛡️ Security & Middleware
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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
  res.status(500).json({
    error: err.message || "Internal server error",
  });
});

module.exports = app;
