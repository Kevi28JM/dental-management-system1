const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Import user routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Import patient routes
const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

// Import appointment routes
const dentistRoutes = require('./routes/dentistRoutes');
app.use('/api/dentist', dentistRoutes);


const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
