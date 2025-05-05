const express = require('express');
const router = express.Router();
const db = require('../models/db'); // MySQL db connection
const { getDocs, collection, query, where } = require("firebase/firestore");
const firebaseDB = require("../firebase"); // Import firebase.js
const dentistModel = require("../models/dentist");

// Save a normal treatment
router.post('/appointments/treatments', async (req, res) => {
  const { patientId, date, time_slot, treatment_notes, prescription } = req.body;
  console.log(`[POST /appointments/treatments] Request received to save normal treatment`);
  console.log(`[POST /appointments/treatments] Data = patientId=${patientId}, date=${date}, time_slot=${time_slot}`);

  try {
    const result = await dentistModel.saveTreatment(patientId, date, time_slot, treatment_notes, prescription);
    console.log(`[POST /appointments/treatments] Treatment saved successfully. Result=`, result);
    res.json(result);
  } catch (err) {
    console.error(`[POST /appointments/treatments] Error saving treatment:`, err);
    res.status(500).json({ message: err.message || "Error saving treatment." });
  }
});


// Save a multi-session treatment and its sessions
router.post('/appointments/multisession-treatments', async (req, res) => {
  const { patientId, mainTreatmentNotes, prescription, sessions, totalCost } = req.body;
  console.log(`[POST /appointments/multisession-treatments] Request received to save multi-session treatment`);
  console.log(`[POST /appointments/multisession-treatments] Data = patientId=${patientId}, totalCost=${totalCost}, sessions count=${sessions.length}`);

  try {
    const result = await dentistModel.saveMultiSessionTreatment(patientId, mainTreatmentNotes, prescription, sessions, totalCost);
    console.log(`[POST /appointments/multisession-treatments] Multi-session treatment saved successfully. Result=`, result);
    res.json(result);
  } catch (err) {
    console.error(`[POST /appointments/multisession-treatments] Error saving multi-session treatment:`, err);
    res.status(500).json({ message: err.message || "Error saving multi-session treatment." });
  }
});


// Get treatment history of a patient
router.get('/appointments/treatments/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  console.log(`[GET /appointments/treatments/${patientId}] Request received to fetch treatment history`);

  try {
    const history = await dentistModel.getTreatmentHistory(patientId);
    console.log(`[GET /appointments/treatments/${patientId}] Fetched treatment history. Records count=${history.length}`);
    res.json(history);
  } catch (err) {
    console.error(`[GET /appointments/treatments/${patientId}] Error fetching treatment history:`, err);
    res.status(500).json({ message: err.message || "Error fetching treatment history." });
  }
});


// Get sessions for a multi-session treatment
router.get('/appointments/treatmentsessions/:mainTreatmentId', async (req, res) => {
  const mainTreatmentId = req.params.mainTreatmentId;
  console.log(`[GET /appointments/treatmentsessions/${mainTreatmentId}] Request received to fetch treatment sessions`);

  try {
    const sessions = await dentistModel.getTreatmentSessions(mainTreatmentId);
    console.log(`[GET /appointments/treatmentsessions/${mainTreatmentId}] Fetched treatment sessions. Sessions count=${sessions.length}`);
    res.json(sessions);
  } catch (err) {
    console.error(`[GET /appointments/treatmentsessions/${mainTreatmentId}] Error fetching treatment sessions:`, err);
    res.status(500).json({ message: err.message || "Error fetching treatment sessions." });
  }
});


 

// New route — Get patient details + treatments + sessions
router.get('/patient-full-details/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  console.log(`[GET /patient-full-details/${patientId}] Request received to fetch patient details + full treatment history`);

  try {
    const result = await dentistModel.getPatientFullDetails(patientId);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(`[GET /patient-full-details/${patientId}] Error:`, err);
    res.status(500).json({ message: err.message || "Error fetching patient full details." });
  }
});


router.post("/add", async (req, res) => {
  console.log("🔹 Received POST /add request for dentist profile");

  const { user_id, name, specialization, phone, email } = req.body;
  console.log("➡️ Request body:", { user_id, name, specialization, phone, email });

  // Validation
  if (!user_id || !name || !specialization || !phone || !email) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ message: "All dentist fields are required" });
  }

  try {
    console.log("📞 Calling createDentist() from dentistModel...");
    const dentist = await dentistModel.createDentist(user_id, name, specialization, phone, email);

    console.log("Dentist created:", dentist);
    res.status(201).json({
      success: true,
      message: dentist.message,
      dentistId: dentist.dentistId
    });

  } catch (error) {
    console.error("Error creating dentist:", error);
    res.status(500).json({ success: false, message: "Error creating dentist", error: error.error.message });
  }
});

// dentistRoutes.js
router.get('/profile/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const sql = 'SELECT * FROM dentists WHERE user_id = ?';
    const values = [user_id];
    const result = await db.queryDB(sql, values);

    if (result.length > 0) {
      res.json({ success: true, profile: result[0] });
    } else {
      res.json({ success: false, message: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Database error', error });
  }
});


module.exports = router;