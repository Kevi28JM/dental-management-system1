const express = require("express");
const cors = require("cors");
const db = require("./models/db");
const patientModel = require("./models/patient");
const router = express.Router();

//route to create a new patient
router.post("/add", async (req, res) => {  //route to add new patient data.
   const { patientId, firstName, lastName, dob, gender, phone, email, address } = req.body;
   
   if (!patientId || !firstName || !lastName || !dob || !gender || !phone || !address) { //checks if all required fields are provided
    return res.status(400).json({ message: "All patient fields are required" });
  }

  try{
    const patient = await patientModel.createPatient(  //then calls the createPatient function from the patientModel
        patientId, firstName, lastName, dob, gender, phone, email, address
    );
    console.log("Patient created:", patient);
    res.status(201).json({ success: true, message: "Patient created successfully", patient });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ success: false, message: "Error creating patient", error });
  }
}
);

// Route to search for patients by name
router.get("/search", async (req, res) => {  // route that allows searching patients by their first or last name using query parameters 
    const { searchQuery } = req.query;

  
    if (!searchQuery) {
      return res.status(400).json({ message: "Search term is required" });
    }
  
    try {
      const patients = await patientModel.searchPatients(searchQuery);//calls the searchPatients function from the model, which searches the database.
      console.log("Found patients:", patients);
      res.status(200).json({ success: true, patients });
    } catch (error) {
      console.error("Error searching patients:", error);
      res.status(500).json({ message: "Error searching patients", error: error.message });
    }
  });

  // Route to get all patients (optional)
router.get("/", async (req, res) => {  //route to fetch all patients from the database.
    try {
      const patients = await patientModel.getAllPatients();
      res.status(200).json({ success: true, patients });
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Error fetching patients", error: error.message });
    }
  });
  
  module.exports = router;