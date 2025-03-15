const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");// Import user model
const db = require("../models/db");

//use express validator to sanitize the input
const router = express.Router();
const { body, validationResult } = require("express-validator");
/*
// Fetch all users
router.get("/", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new user
router.post("/", (req, res) => {
    const { name, email } = req.body;
    db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User added successfully", id: result.insertId });
    });
});
*/
// Signup Route
router.post(
    "/signup",
    [
      // Validate email format
      body("email").isEmail().withMessage("Invalid email format"),
  
      // Validate password (optional for temporary patients)
      body("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
  
      // Role selection is required
      body("role").notEmpty().withMessage("Role is required"),
    ],
    async (req, res) => {
      // Prevent caching for security
      res.set("Cache-Control", "no-store, must-revalidate");
  
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        // Extract data from request body
        const { name, phone, email, password, role } = req.body;
  
        // Check if the phone number is already registered
        const existingUser = await userModel.findUserByPhone(phone);
        if (existingUser) {
          return res.status(400).json({ message: "Phone number already registered" });
        }
  
        // If the role is 'temporary_patient', create a temporary account
        if (role === "temporary_patient") {
          // Temporary patients do not require a password
          await userModel.createTemporaryPatient(name, phone, email || null,(err, result) => {
            if (err) {
              return res.status(500).json({ message: "Error creating temporary account", error: err.message });
            }
            return res.status(201).json({ message: "Temporary account created successfully" });
          });
        } else {
          // Hash the password for security (only for regular users)
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // Store user details in the database
          await userModel.createUser(name, phone, email || null, hashedPassword, role);
          return res.status(201).json({ message: "User registered successfully" });
        }
      } catch (err) {
        // Handle server errors
        return res.status(500).json({ message: "Error signing up", error: err.message });
      }
    }
  );

// Login Route
router.post("/login", (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password required" });
    }

    userModel.findUserByPhone(phone, (err, user) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });
        if (!user) return res.status(404).json({ message: "User not found" });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: "Error comparing passwords" });
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({ message: "Login successful", token });
        });
    });
});

module.exports = router;
