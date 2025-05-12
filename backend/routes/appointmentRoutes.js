const express = require("express");
const router = express.Router();
const db = require("../models/db");
const appointmentModel = require("../models/appointment");


// POST add new appointment
router.post('/add', async (req, res) => {
     
      const { appointmentId, patientId, dentistId, date } = req.body;
  
      // Basic validation
      if (!appointmentId || !patientId || !dentistId || !date) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
  
      try {
    const result = await appointmentModel.addAppointment(appointmentId, patientId, dentistId, date);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Appointment added successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add appointment' });
    }

  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ success: false, message: 'Database error', error });
  }
});

   

// GET appointments by date
router.get('/byDate/:date', async (req, res) => {
    const { date } = req.params;
  
    try {
      const sql = `
        SELECT a.appointmentId, a.date, a.status, d.name AS dentistName
        FROM appointment a
        JOIN dentists d ON a.dentistId = d.dentist_id
        WHERE a.date = ?
      `;
      const result = await db.queryDB(sql, [date]);
  
      res.json({ success: true, appointments: result });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ success: false, message: 'Database error', error });
    }
  });
  

module.exports = router;
