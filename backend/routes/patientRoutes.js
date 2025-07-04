const express = require("express");
const cors = require("cors");
const db = require("../models/db");
const patientModel = require("../models/patient");
const router = express.Router();

//route to create a new patient
router.post("/add", async (req, res) => {  //route to add new patient data.
   const { firstName, lastName, dob, gender, phone, email, address } = req.body;
   
   if (!firstName || !lastName || !dob || !gender || !phone || !address) { //checks if all required fields are provided
    return res.status(400).json({ message: "All patient fields are required" });
  }

  try{
    const patient = await patientModel.createPatient(  //then calls the createPatient function from the patientModel
         firstName, lastName, dob, gender, phone, email, address
    );
    console.log("Patient created:", patient);
    res.status(201).json({ 
      success: true, 
      message: "Patient created successfully", 
      patientId: patient.patientId,
      tempPassword: patient.tempPassword // Return raw temp password for assistant to give}) // Send back temp password here
    });
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
      const patients = await patientModel.searchPatientsByName(searchQuery);//calls the searchPatients function from the model, which searches the database.
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

// Route to update patient details
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  let { firstName, lastName, dob, gender, phone, email, address } = req.body;

  if (!firstName || !lastName || !dob || !gender || !phone || !address) {
      return res.status(400).json({ message: "All patient fields are required" });
  }

   // 💡 Format dob to 'YYYY-MM-DD' if it's an ISO string
   if (dob.includes("T")) {
    dob = dob.split("T")[0];
  }

  try {
      const result = await patientModel.updatePatient(id, firstName, lastName, dob, gender, phone, email, address);
      res.status(200).json({ success: true, message: "Patient updated successfully", result });
  } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ success: false, message: "Error updating patient", error });
  }
});  


// Route to get a single patient by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await patientModel.getPatientById(id);

    if (result.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(result[0]); // Send only the first (and should be only) patient object
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    res.status(500).json({ message: "Error fetching patient", error: error.message });
  }
});

  
  module.exports = router;