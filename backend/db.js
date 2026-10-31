
const mysql = require("mysql2");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cardio_care_db",
  ssl: process.env.DB_HOST
    ? {
        ca: process.env.DB_CA_CERT,
        rejectUnauthorized: true
      }
    : undefined,
  connectTimeout: 20000
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});

module.exports = db;
