
const express = require("express");
const router = express.Router();
console.log("DAILY TRACKER ROUTES LOADED");
const db = require("./db");
const { auth } = require("./auth");

router.post("/", auth, (req, res) => {
  const {
    water_glasses,
    sleep_hours,
    exercise_minutes,
    steps,
    mood,
    symptoms
  } = req.body;

  const userId = req.user.id;

  const today = new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO daily_health_logs
    (
      user_id,
      log_date,
      water_glasses,
      sleep_hours,
      exercise_minutes,
      steps,
      mood,
      symptoms
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      water_glasses = VALUES(water_glasses),
      sleep_hours = VALUES(sleep_hours),
      exercise_minutes = VALUES(exercise_minutes),
      steps = VALUES(steps),
      mood = VALUES(mood),
      symptoms = VALUES(symptoms)
  `;

  db.query(
    sql,
    [
      userId,
      today,
      water_glasses ?? 0,
      sleep_hours ?? 0,
      exercise_minutes ?? 0,
      steps ?? 0,
      mood || null,
      symptoms || null
    ],
    (err) => {
      if (err) {
        console.error("Tracker save error:", err);
        return res.status(500).json({
          message: "Unable to save health tracker data."
        });
      }

      res.json({
        message: "Daily health data saved successfully!"
      });
    }
  );
});
router.get("/test", (req, res) => {
  res.json({
    message: "Tracker route is working!"
  });
});
router.get("/", auth, (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT * FROM daily_health_logs
     WHERE user_id = ?
     ORDER BY log_date DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Tracker fetch error:", err);
        return res.status(500).json({
          message: "Unable to fetch health tracker data."
        });
      }

      res.json(results);
    }
  );
});

module.exports = router;
