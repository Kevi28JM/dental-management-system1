const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");// Import user model
const db = require("../models/db");

//use express validator to sanitize the input

const { body, validationResult } = require("express-validator");
const router = express.Router();
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
       
  
      // Validate password  
      body("password")
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
  
      // Extract data from request body
        const { name, phone, email, password, role, patient_id, temp_password } = req.body;

       try { 
        if (role === "patient") {
          if (!patient_id || !temp_password) {
            return res.status(400).json({ message: "Patient ID and temporary password are required" });
          }
  
          const patient = await userModel.findPatientById(patient_id);
          if (!patient) {
            return res.status(400).json({ message: "Invalid Patient ID" });
          }
  
          const isTempPasswordValid = await bcrypt.compare(temp_password, patient.temp_password);
          if (!isTempPasswordValid) {
            return res.status(401).json({ message: "Invalid temporary password" });
          }
  
          const existingUser = await userModel.findUserByPatientId(patient_id);
          if (existingUser) {
            return res.status(400).json({ message: "User already registered for this Patient ID" });
          }
  
          const hashedPassword = await bcrypt.hash(password, 10);
          await userModel.createUser(name, phone, email, hashedPassword, role, patient_id);
  
          return res.status(201).json({ message: "Signup successful" });
  
       }else  (role === "assistant" || role === "dentist")
          // Check for existing assistant or dentist by phone 
          const existingUser = await userModel.findUserByEmail(email, role);
          if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
          }
        

          // Hash the password for security (only for regular users)
          const hashedPassword = await bcrypt.hash(password, 10);
  
          // Store user details in the database
          await userModel.createUser(name, phone, email, hashedPassword, role);
          return res.status(201).json({ message: "User registered successfully" });
        
      } catch (err) {
        // Handle server errors
        return res.status(500).json({ message: "Error signing up", error: err.message });
      }
    }
  );


  // In userRoutes.js

router.post("/verify-temp", async (req, res) => {
  const { patientId, tempPassword } = req.body;

  try {
    const patient = await userModel.findPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const isMatch = await bcrypt.compare(tempPassword, patient.temp_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid temporary password" });
    }

    return res.status(200).json({ message: "Temporary password is valid", patient });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { phone,email, password} = req.body;
  let role = req.body.role?.toLowerCase(); // ✅ Normalize role to lowercase

  if (!password || !role) {
    return res.status(400).json({ message: "Password and role are required" });
  }

  try {
    let user;

    if (role === "patient") {
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required for patient login" });
      }
    user = await userModel.findUserByPhone(phone,role);
    console.log("User fetched from DB:", user);
    } else if (role === "assistant" || role === "dentist") {
      if (!email) {
        return res.status(400).json({ message: "Email is required for assistant/dentist login" });
      }
      user = await userModel.findUserByEmail(email);
      console.log("User fetched from DB:", user);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (!user) {
        console.log("User not found in database.");
        return res.status(404).json({ message: "User not found" });
    }
    
    // Ensure password exists before comparing
     console.log("Stored hashed password:", user.password);
     console.log("Password provided:", password);
    if (!user.password) {
        console.log("User found, but password is missing.");
        return res.status(500).json({ message: "User password not found" });
    }
    
   
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    
    if (!isMatch) {
        console.log("Password does not match.");
        return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("Login successful.");
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.status(200).json({ success: true, message: "Login successful", token });
    
  } catch (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

module.exports = router;
