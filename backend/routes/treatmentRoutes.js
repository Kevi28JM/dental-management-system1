// routes/treatmentRoutes.js
const express = require('express');
const router = express.Router();
const db = require("../models/db");
const treatmentModel = require("../models/treatment");



// POST: Add treatment for a specific appointment
router.post('/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const {
    description,
    sessionId,
    notes,
    payment,
  } = req.body;

  console.log(`📥 POST /treatments/${appointmentId}`);
  console.log(`📝 Received body:`, req.body);

  if (!sessionId) {
    console.warn('⚠️ sessionId is missing in request body');
    return res.status(400).json({ message: 'sessionId is required' });
  }

  try {
    const insertedId = await treatmentModel.insertTreatment({
      appointmentId,
      sessionId,
      description,
      notes,
      payment
    });

    const responseData = {
      appointmentId,
      sessionId,
      treatmentType: description,
      treatmentDate: new Date().toISOString(),
      treatmentNotes: notes || '',
      payment: payment || 0
    };

    console.log('✅ Treatment added successfully:', responseData);
    res.status(201).json({ insertedId, ...responseData });
  } catch (err) {
    console.error('❌ Error adding treatment:', err);
    res.status(500).json({ message: 'Failed to add treatment' });
  }
});




// GET treatment data by appointmentId
router.get('/treatment-data/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  console.log(`📤 GET /treatment-data/${appointmentId}`);

  try {
    const result = await treatmentModel.getTreatmentDataByAppointmentId(appointmentId);

    if (!appointmentId || appointmentId === 'undefined') {
    console.warn("⚠️ Invalid appointmentId received in route");
    return res.status(400).json({ message: 'Invalid appointmentId' });
  }
    if (result.notFound) {
      console.warn(`⚠️ No appointment found for ID: ${appointmentId}`);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    console.log('📋 Returning treatment data:', {
      patient: result.patient,
      treatments: result.treatments
    });

    res.status(200).json({
      success: true,
      patient: result.patient,
      treatments: result.treatments
    });
  } catch (error) {
    console.error('❌ Error in /treatment-data route:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});


// GET all past treatments by patientId
router.get('/by-patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  console.log(`📤 GET /treatments/by-patient/${patientId}`);

  if (!patientId || patientId === 'undefined') {
    return res.status(400).json({ message: 'Invalid patientId' });
  }

  try {
    const result = await treatmentModel.getTreatmentsByPatientId(patientId);

    if (result.notFound) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      patient: result.patient,
      treatments: result.treatments
    });
  } catch (error) {
    console.error('❌ Error in /by-patient route:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});


{/*// GET: All treatments where parentTreatmentId = treatmentId
router.get('/multi-session/roots', async (req, res) => {
  try {
    const results = await treatmentModel.getMultiSessionRootTreatments();
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error fetching multi-session roots:', err);
    res.status(500).json({ message: 'Failed to fetch multi-session treatments' });
  }
});

 */}

module.exports = router;
