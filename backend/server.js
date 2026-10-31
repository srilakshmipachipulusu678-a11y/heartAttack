const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const db = require("./db");
const authRoutes = require("./auth");
const healthRoutes = require("./healthRoutes");
const trackerRoutes = require("./trackerRoutes");

const app = express();
console.log("RUNNING SERVER FILE:", __filename);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin during development (e.g. localhost:5173, localhost:5174, etc.)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/tracker", trackerRoutes);

// Direct diagnostic route
app.get("/tracker-check", (req, res) => {
  res.json({ message: "Server route is working!" });
});

app.get("/", (req, res) => {
  res.json({
    message: "CardioCare Plus API is running successfully!"
  });
});

app.get("/api/db-test", (req, res) => {
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database query failed",
        error: err.message
      });
    }

    res.json({
      message: "Database connected successfully!",
      tables: results
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CardioCare Plus server running on port ${PORT}`);
});
