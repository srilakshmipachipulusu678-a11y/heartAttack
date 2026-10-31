
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  const token = header.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Server authentication is not configured."
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again."
    });
  }
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all fields."
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must contain at least 8 characters."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              message: "Email already registered."
            });
          }

          return res.status(500).json({
            message: "Registration failed."
          });
        }

        res.status(201).json({
          message: "Registration successful!",
          userId: result.insertId
        });
      }
    );
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong."
    });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Enter email and password."
    });
  }

  db.query(
    "SELECT id, name, email, password, role FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Login failed."
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password."
        });
      }

      const user = results[0];

      try {
        const validPassword = await bcrypt.compare(
          password,
          user.password
        );

        if (!validPassword) {
          return res.status(401).json({
            message: "Invalid email or password."
          });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
          return res.status(500).json({
            message: "Server authentication is not configured."
          });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          secret,
          { expiresIn: "1h" }
        );

        res.json({
          message: "Login successful!",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } catch (error) {
        res.status(500).json({
          message: "Login failed."
        });
      }
    }
  );
});

module.exports = router;
module.exports.auth = auth;
