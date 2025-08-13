const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
// Load environment variables based on NODE_ENV
const envPath =
  process.env.NODE_ENV === "production"
    ? "./config.production.env"
    : "./config.env";

require("dotenv").config({ path: envPath });

const authRoutes = require("./routes/auth");
const readingRoutes = require("./routes/readings");
const dreamRoutes = require("./routes/dreams");
const { authenticateToken } = require("./middleware/auth");
const passport = require("./config/passport");
const sequelize = require("./sequelize");
const User = require("./models/User");
const Reading = require("./models/Reading");

const app = express();
app.set("trust proxy", 1);

// Force HTTPS redirect in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// Security middleware
app.use(helmet());

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://pocket-tarot.vercel.app",
        "https://pocket-tarot-git-main.vercel.app",
        "https://pocket-tarot-git-develop.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean)
    : ["http://localhost:3000", "http://localhost:3001"];

if (process.env.NODE_ENV === "production") {
  console.log("CORS allowed origins:", allowedOrigins);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session middleware
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ PostgreSQL connected and models synced successfully");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", authenticateToken, readingRoutes);
app.use("/api/dreams", dreamRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Tarot Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors gracefully
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use. Please try a different port or kill the process using this port.`
    );
    console.error(`💡 Try: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});

// Handle process termination gracefully
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

module.exports = app;
