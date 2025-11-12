const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const libraryCheckRoutes = require("./routes/libraryCheck");
const seatRoutes = require("./routes/seats");
const sendMessageRoute = require("./routes/sendMessageRoute"); // ✅ using require now

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
  origin: ["https://vdlibrary-in.vercel.app", "http://localhost:5173"], // frontend URLs
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
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

// ✅ Register route
app.use("/send-message", sendMessageRoute);

// ✅ Mount all API routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
// ...other app.use routes
app.use("/api/library", libraryCheckRoutes);
app.use("/api", seatRoutes);
// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
