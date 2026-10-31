
const express = require("express");
const db = require("./db");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
  const {
    age, gender, height_cm, weight_kg, resting_heart_rate,
    systolic_bp, diastolic_bp, cholesterol,
    family_history, previous_heart_disease, previous_stroke,
    diabetes, smoking, alcohol, exercise
  } = req.body;

  const parsedAge = Number(age);

  if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
    return res.status(400).json({ message: "Enter a valid age." });
  }

  const optionalNumber = value =>
    value === "" || value === null || value === undefined
      ? null : Number(value);

  const height = optionalNumber(height_cm);
  const weight = optionalNumber(weight_kg);
  const heartRate = optionalNumber(resting_heart_rate);
  const systolic = optionalNumber(systolic_bp);
  const diastolic = optionalNumber(diastolic_bp);
  const chol = optionalNumber(cholesterol);

  if (
    (height !== null && (!Number.isFinite(height) || height < 50 || height > 250)) ||
    (weight !== null && (!Number.isFinite(weight) || weight < 10 || weight > 300)) ||
    (heartRate !== null && (!Number.isInteger(heartRate) || heartRate < 30 || heartRate > 220)) ||
    (systolic !== null && (!Number.isInteger(systolic) || systolic < 50 || systolic > 300)) ||
    (diastolic !== null && (!Number.isInteger(diastolic) || diastolic < 30 || diastolic > 200)) ||
    (chol !== null && (!Number.isInteger(chol) || chol < 50 || chol > 700))
  ) {
    return res.status(400).json({ message: "Check your health measurement values." });
  }

  const sql = `
    INSERT INTO health_assessments
    (user_id, age, gender, height_cm, weight_kg, resting_heart_rate,
     systolic_bp, diastolic_bp, cholesterol, family_history,
     previous_heart_disease, previous_stroke, diabetes, smoking,
     alcohol, exercise, assessment_result)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.user.id, parsedAge, gender || null, height, weight, heartRate,
    systolic, diastolic, chol,
    family_history || "Unknown",
    previous_heart_disease || "Unknown",
    previous_stroke || "Unknown",
    diabetes || "Unknown", smoking || "Unknown",
    alcohol || "Unknown", exercise || null,
    "Health information recorded"
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Assessment save error:", err.message);
      return res.status(500).json({ message: "Could not save assessment." });
    }

    res.status(201).json({
      message: "Health assessment saved successfully!",
      assessmentId: result.insertId
    });
  });
});

router.get("/history", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, age, gender, height_cm, weight_kg, resting_heart_rate,
    systolic_bp, diastolic_bp, cholesterol, family_history,
    previous_heart_disease, previous_stroke, diabetes, smoking,
    alcohol, exercise, assessment_result, created_at
    FROM health_assessments
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("Assessment history error:", err.message);
      return res.status(500).json({ message: "Could not load history." });
    }
    res.json({ assessments: results });
  });
});

router.get("/report/latest", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, age, gender, height_cm, weight_kg, resting_heart_rate,
    systolic_bp, diastolic_bp, cholesterol, family_history,
    previous_heart_disease, previous_stroke, diabetes, smoking,
    alcohol, exercise, created_at
    FROM health_assessments
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;

  db.query(sql, [req.user.id], (err, rows) => {
    if (err) {
      console.error("Health report error:", err.message);
      return res.status(500).json({ message: "Could not generate report." });
    }

    if (!rows.length) {
      return res.status(404).json({
        message: "Complete a health assessment first."
      });
    }

    const a = rows[0];
    const observations = [];
    const precautions = [];
    const exerciseRecommendations = [];
    const recommendations = [];

    let bmi = null;
    let bpStatus = "Not provided";
    let cholesterolStatus = "Not provided";

    // BMI observation
    if (a.height_cm && a.weight_kg) {
      const heightM = Number(a.height_cm) / 100;
      bmi = Number((Number(a.weight_kg) / (heightM * heightM)).toFixed(1));

      let bmiStatus = "Within usual adult reference range";
      if (bmi < 18.5) bmiStatus = "Below usual adult range";
      else if (bmi >= 25 && bmi < 30) bmiStatus = "Above usual adult range";
      else if (bmi >= 30) bmiStatus = "High BMI range";

      observations.push({
        level: bmi >= 30 || bmi < 18.5 ? "watch" : "info",
        title: "Body Mass Index (BMI)",
        detail: `Your calculated BMI is ${bmi}. ${bmiStatus}. BMI is a screening measure, not a diagnosis.`
      });
    }

    // Blood pressure observations
    if (a.systolic_bp !== null && a.diastolic_bp !== null) {
      const sys = Number(a.systolic_bp);
      const dia = Number(a.diastolic_bp);

      if (sys >= 180 || dia >= 120) {
        bpStatus = "Very high reading";
        observations.push({
          level: "urgent",
          title: "Very high blood pressure reading",
          detail: "Repeat the measurement after at least one minute and seek immediate medical care. If you have chest pain, breathlessness, weakness, vision changes or difficulty speaking, contact emergency services."
        });
        precautions.push("Do not begin strenuous exercise with this reading. Seek urgent medical assessment.");
      } else if (sys >= 130 || dia >= 80) {
        bpStatus = "Higher than usual range";
        observations.push({
          level: "attention",
          title: "Blood pressure needs attention",
          detail: "This reading is above the usual adult reference range. A single reading cannot diagnose hypertension."
        });
        precautions.push("Repeat blood pressure measurements and discuss persistent high readings with a healthcare professional.");
      } else if (sys >= 120 && dia < 80) {
        bpStatus = "Elevated systolic reading";
        observations.push({
          level: "watch",
          title: "Systolic pressure is elevated",
          detail: "Monitor your readings over time and discuss persistent elevation with a healthcare professional."
        });
      } else {
        bpStatus = "Within usual adult reference range";
        observations.push({
          level: "good",
          title: "Blood pressure reading",
          detail: "This single reading is within the usual adult reference range."
        });
      }
    }

    // Cholesterol observations
    if (a.cholesterol !== null) {
      const chol = Number(a.cholesterol);

      if (chol < 200) {
        cholesterolStatus = "Desirable total cholesterol range";
      } else if (chol < 240) {
        cholesterolStatus = "Borderline-high total cholesterol";
      } else {
        cholesterolStatus = "High total cholesterol";
      }

      observations.push({
        level: chol >= 240 ? "attention" : chol >= 200 ? "watch" : "info",
        title: "Total cholesterol",
        detail: `${chol} mg/dL — ${cholesterolStatus}. A full lipid profile is needed for a complete interpretation.`
      });
    }

    // Resting heart rate observation
    if (a.resting_heart_rate !== null) {
      const pulse = Number(a.resting_heart_rate);
      observations.push({
        level: pulse < 60 || pulse > 100 ? "watch" : "info",
        title: "Resting heart rate",
        detail: `${pulse} BPM recorded. Typical adult resting heart rate is often 60–100 BPM, but fitness, medicines and health conditions can affect it.`
      });

      if (pulse > 100 || pulse < 50) {
        precautions.push("Discuss an unusually high or low resting heart rate with a healthcare professional, especially if you experience dizziness, fainting or palpitations.");
      }
    }

    // Family and previous medical history
    if (a.family_history === "Yes") {
      observations.push({
        level: "watch",
        title: "Family history",
        detail: "You reported a family history of heart disease. Share this information with your healthcare professional."
      });
      precautions.push("Discuss your family history and appropriate screening schedule with your healthcare professional.");
    }

    const previousCondition =
      a.previous_heart_disease === "Yes" || a.previous_stroke === "Yes";

    if (a.previous_heart_disease === "Yes") {
      precautions.push("Because you reported previous heart disease, follow your clinician's exercise and treatment plan before starting a new workout.");
    }

    if (a.previous_stroke === "Yes") {
      precautions.push("Because you reported a previous stroke, consult your healthcare professional or rehabilitation specialist before changing your exercise routine.");
    }

    // Diabetes and lifestyle precautions
    if (a.diabetes === "Yes") {
      precautions.push("Follow your diabetes care plan. Ask your clinician about safe exercise, glucose monitoring and foot care.");
      recommendations.push("Continue recommended blood glucose checks and regular diabetes follow-ups.");
    }

    if (a.smoking === "Yes") {
      precautions.push("Avoid tobacco and seek professional support to quit smoking.");
      recommendations.push("Consider a tobacco-cessation support service.");
    }

    if (a.alcohol === "Yes") {
      precautions.push("Discuss alcohol consumption with a healthcare professional, particularly if you have blood pressure or other health concerns.");
    }

    // Exercise suggestions
    if (previousCondition) {
      exerciseRecommendations.push(
        "Follow an individually approved activity plan from your doctor or rehabilitation specialist."
      );
      exerciseRecommendations.push(
        "Do not start vigorous workouts or heavy weight training without medical clearance."
      );
    } else if (a.exercise === "Never" || a.exercise === "Rarely") {
      exerciseRecommendations.push(
        "Start with gentle walking for 5–10 minutes, if comfortable and medically suitable. Increase gradually."
      );
      exerciseRecommendations.push(
        "Try gentle stretching and mobility exercises without forcing painful movements."
      );
    } else if (a.exercise === "Sometimes") {
      exerciseRecommendations.push(
        "Build a consistent walking routine, gradually working towards regular moderate activity as tolerated."
      );
      exerciseRecommendations.push(
        "Try gentle cycling or low-impact activities if comfortable and suitable for your health."
      );
    } else {
      exerciseRecommendations.push(
        "Continue suitable moderate activities such as brisk walking or cycling, with appropriate rest and recovery."
      );
      exerciseRecommendations.push(
        "Add light strength and flexibility exercises if suitable for your health."
      );
    }

    exerciseRecommendations.push(
      "Stop exercising and seek medical advice if you develop chest discomfort, unusual breathlessness, dizziness or faintness."
    );

    recommendations.push(
      "Choose balanced meals with vegetables, fruits, whole grains and suitable protein sources."
    );
    recommendations.push(
      "Maintain a consistent sleep routine and monitor your health measurements periodically."
    );

    if (precautions.length === 0) {
      precautions.push(
        "Continue routine health check-ups and discuss any new or persistent symptoms with a healthcare professional."
      );
    }

    res.json({
      report: {
        assessmentId: a.id,
        createdAt: a.created_at,
        summary: "Your report contains observations and general wellness suggestions based on your latest submitted information. It is not a diagnosis or a validated heart disease or stroke risk prediction.",
        metrics: {
          bmi: bmi !== null ? bmi : "Not provided",
          bloodPressure: a.systolic_bp !== null && a.diastolic_bp !== null
            ? `${a.systolic_bp}/${a.diastolic_bp} mmHg`
            : "Not provided",
          bloodPressureStatus: bpStatus,
          cholesterol: a.cholesterol !== null
            ? `${a.cholesterol} mg/dL` : "Not provided",
          cholesterolStatus,
          heartRate: a.resting_heart_rate !== null
            ? `${a.resting_heart_rate} BPM` : "Not provided",
          exercise: a.exercise || "Not provided",
          diabetes: a.diabetes || "Not provided",
          familyHistory: a.family_history || "Unknown"
        },
        observations,
        precautions,
        exerciseRecommendations,
        recommendations
      }
    });
  });
});

module.exports = router;
