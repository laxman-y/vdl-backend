const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

dotenv.config(); // Load .env

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Explicit CORS setup
const corsOptions = {
  origin: [
    "https://vdlibrary-in.vercel.app", // your frontend (production)
    "http://localhost:5173",           // your frontend (local dev)
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middlewares
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("📚 Library Management Server is Running!");
});

// ✅ Test CORS route
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// ✅ Mount all API routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
