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
      res.set("Cache-Control", "no-store, must-revalidate"); // Prevent caching
  
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.warn("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Extract data from request body
        const { name, phone, email, password, role, patientId, tempPassword } = req.body;
        console.log("Signup request received:", { name, phone, email, password, role, patientId ,tempPassword});

       try { 
        if (role === "patient") {
          console.log("Role is patient. Verifying temporary credentials...");

          if (!patientId || !tempPassword) {
            console.warn("Missing patient ID or temporary password");
            return res.status(400).json({ message: "Patient ID and temporary password are required" });
          }
  
          const patient = await userModel.findPatientById(patientId, role);
          if (!patient) {
            console.warn("Patient not found with ID:", patientId);
            return res.status(400).json({ message: "Invalid Patient ID" });
          }
  
          const isTempPasswordValid = await bcrypt.compare(tempPassword, patient.temp_password);
          console.log("Temporary password comparison result:", isTempPasswordValid);

          if (!isTempPasswordValid) {
            console.warn("Invalid temporary password entered");
            return res.status(401).json({ message: "Invalid temporary password" });
          }
  
          const existingUser = await userModel.findUserByPatientId(patientId);
          if (existingUser) {
            console.warn("User already registered for Patient ID:", patientId);
            return res.status(400).json({ message: "User already registered for this Patient ID" });
          }
  
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log("Password hashed successfully");

          await userModel.createUser(name, phone, email, hashedPassword, role, patientId, tempPassword);
          console.log("User created successfully for patient ID:", patientId);
          console.log("User created successfully for patient");
  
          return res.status(201).json({ message: "Signup successful" });
  
       }else if (role === "assistant" || role === "dentist"){
       console.log(`Role is ${role}. Checking for existing user by email: ${email}`);

          // Check for existing assistant or dentist by phone 
          const existingUser = await userModel.findUserByEmail(email, role);
          if (existingUser) {
            console.warn(`${role} with email already exists:`, email);
            return res.status(400).json({ message: "Email already registered" });
          }
        

          // Hash the password for security (only for regular users)
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log("Password hashed successfully");
  
          // Store user details in the database
          await userModel.createUser(name, phone, email, hashedPassword, role);
          console.log(`${role} user created successfully`);
          return res.status(201).json({ message: "User registered successfully" });
        
        } else {
          console.warn("Invalid role provided:", role);
          return res.status(400).json({ message: "Invalid role" });
        }
        
      } catch (err) {
        console.error("Error during signup:", err);
        // Handle server errors
        return res.status(500).json({ message: "Error signing up", error: err.message });
      }
    }
  );


  // In userRoutes.js

router.post("/verify-temp", async (req, res) => {
  const { patientId, tempPassword } = req.body;
  console.log("Incoming request to /verify-temp");
  console.log("Received patientId:", patientId);
  console.log("Received tempPassword:", tempPassword);

  try {
    const patient = await userModel.findPatientById(patientId);
    console.log("Searching for patient in DB...");

    if (!patient) {
      console.warn("Patient not found for ID:", patientId);
      return res.status(404).json({ message: "Patient not found" });
    }

    console.log("Patient record:", patient); // Add this
    console.log("Comparing:", tempPassword, "with", patient.temp_password); // Add this

    if (!patient.temp_password) {
      console.warn("No temporary password set for this patient."); 
      return res.status(400).json({ message: "Temporary password not set for this patient" });
    }
    
    console.log("Comparing entered password with stored hash...");
    console.log("Entered:", tempPassword);
    console.log("Stored (hashed):", patient.temp_password);
    
    // Compare the provided temporary password with the hashed one in the database
    const isMatch = await bcrypt.compare(tempPassword, patient.temp_password);

    if (!isMatch) {
      console.warn("Temporary password does not match.");
      return res.status(401).json({ message: "Invalid temporary password" });
    }
    
    console.log("Temporary password matched.");
    return res.status(200).json({ message: "Temporary password is valid", patient });
  } catch (error) {
    console.error("Error during temporary password verification:", error);
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { patientId,email, password} = req.body;
  let role = req.body.role?.toLowerCase(); // ✅ Normalize role to lowercase

  if (!password || !role) {
    return res.status(400).json({ message: "Password and role are required" });
  }

  try {
    let user;

    if (role === "patient") {
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required for patient login" });
      }
    user = await userModel.findUserByPatientId(patientId,role);
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
    
     
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,            //  keep token too — you already generate it
      user_id: user.id,
      patient_id: user.patient_id,
      });
    
    
  } catch (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

module.exports = router;
