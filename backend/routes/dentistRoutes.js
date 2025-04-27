const express = require('express');
const router = express.Router();
const db = require('../models/db'); // your MySQL db connection
const { getDocs, collection, query, where } = require("firebase/firestore");
const firestore = require("../firebase"); // import firebase.js

// GET all appointments for a given date
router.get('/appointments/:date', async (req, res) => {
  const date = req.params.date;
  console.log(`Fetching appointments for date: ${date}`);

  try {

    // Fetch appointments from Firebase
    const q = query(collection(firebaseDB, "appointments"), where("date", "==", date));
    const snapshot = await getDocs(q);

    const appointments = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log(`Appointment found:`, data);


      // Fetch full patient details from MySQL
      const [rows] = await db.promise().query(
        "SELECT first_name, last_name FROM patients WHERE id = ?",
        [data.patientId]
      );

      const fullName = rows.length > 0 ? `${rows[0].first_name} ${rows[0].last_name}` : null;
      console.log(`Full name for patientId ${data.patientId}: ${fullName}`);

      appointments.push({
        ...data,
        fullName,
        firebaseId: docSnap.id
      });
    }

    console.log(`Returning ${appointments.length} appointments.`);
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Error fetching appointments." });
  }
});



// POST treatment record for a patient
router.post('/appointments/treatments', async (req, res) => {
  const { patientId, date, time_slot, treatment_notes, prescription } = req.body;
  console.log(`Saving treatment for ${patientId} on ${date} at ${time_slot}`);

  try {
    //stores the treatment info in the treatments table
    const [result] = await db.promise().query(
      "INSERT INTO treatments (patientId, date, time_slot, treatments, prescription) VALUES (?, ?, ?, ?, ?)",
      [patientId, date, time_slot, treatments, prescription]
    );

    console.log("Treatment saved successfully:", result);
    res.json({ message: "Treatment saved successfully" });
  } catch (err) {
    console.error("Error saving treatment:", err);
    res.status(500).json({ message: "Error saving treatment." });
  }
});

// GET treatment history for a patient
router.get('/treatments/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  console.log(`Fetching treatment history for patient: ${patientId}`);

  try {
    //A list of that patient’s treatment history,newest first.
    const [rows] = await db.promise().query(
      "SELECT * FROM treatments WHERE patientId = ? ORDER BY date DESC",
      [patientId]
    );

    console.log(`Found ${rows.length} records.`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching treatment history:", err);
    res.status(500).json({ message: "Error fetching treatment history." });
  }
});

module.exports = router;
