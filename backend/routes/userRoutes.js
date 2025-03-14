const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");// Import user model
const db = require("../models/db");

const router = express.Router();

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

// Sign Up Route
router.post("/signup", (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    userModel.findUserByPhone(phone, (err, existingUser) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: "Error hashing password" });

            userModel.createUser(name, phone, email || null, hashedPassword, (err) => {
                if (err) return res.status(500).json({ message: "Error saving user" });
                res.status(201).json({ message: "User created successfully" });
            });
        });
    });
});

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
