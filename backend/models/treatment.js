// models/treatment.js
const db = require('./db');

// Get treatment-related data using appointmentId
const getTreatmentDataByAppointmentId = async (appointmentId) => {
  try {
    console.log(`🔍 Fetching treatment data for appointmentId: ${appointmentId}`);
    // Get patientId from appointment
    const appointmentSql = "SELECT patientId FROM appointment WHERE appointmentId = ?";
    const appointmentResult = await db.queryDB(appointmentSql, [appointmentId]);
    console.log("📄 Appointment Result:", appointmentResult);

    // Check if appointment exists
    if (appointmentResult.length === 0) {
        console.warn(`⚠️ No appointment found for appointmentId: ${appointmentId}`);
      return { notFound: true };
    }

    const patientId = appointmentResult[0].patientId;
    console.log(`👤 Found patientId: ${patientId}`);

    // Get patient details
    const patientSql = 'SELECT * FROM patients WHERE id = ?';
    const patientDetails = await db.queryDB(patientSql, [patientId]);
    console.log("🧾 Patient Details:", patientDetails);

    // Get all treatments linked to that patient (through appointments)
    const treatmentSql = `
      SELECT 
        t.treatmentType, t.sessionId, t.treatmentDate, t.treatmentNotes, t.payment
      FROM treatments t
      JOIN appointment a ON a.appointmentId = t.appointmentId
      WHERE a.patientId = ?
      ORDER BY t.treatmentDate DESC
    `;
    const treatments = await db.queryDB(treatmentSql, [patientId]);
    console.log("💊 Treatments Found:", treatments);

    return {
      patient: patientDetails[0],
      treatments
    };
  } catch (error) {
    console.error("❌ Error fetching treatment data:", error);
    throw { message: "Database error", error };
  }
};


// Insert treatment and handle self-linking for multi-session
const insertTreatment = async ({
          appointmentId,
          sessionId,
          description,
          notes,
          payment  }) => {
    try {
          const insertSql = `
            INSERT INTO treatments (appointmentId, sessionId, treatmentType, treatmentDate, treatmentNotes, payment)
            VALUES (?, ?, ?, NOW(), ?, ?)
          `;

    const insertValues = [
      appointmentId,
      sessionId,
      description,
      notes || '',
      payment || 0
    ];

    console.log('📦 Executing INSERT:', insertSql, insertValues);
    const result = await db.queryDB(insertSql, insertValues);
    //const insertedId = result.insertId;
    //console.log('🆕 Treatment inserted with ID:', insertedId);

   {/* // Self-link if this is a new multi-session treatment
    if (isMultiSessionFirst) {
      const updateSql = `
        UPDATE treatments
        SET parentTreatmentId = ?
        WHERE treatmentId = ?
      `;
      await db.queryDB(updateSql, [insertedId, insertedId]);
      console.log(`🔁 Updated treatment ${insertedId} to be its own parent`);
    }
*/}
    return result;
  } catch (error) {
    console.error('❌ DB error in insertTreatment:', error);
    throw error;
  }
};


{/*}
// Get all treatments where parentTreatmentId = treatmentId (multi-session roots)
const getMultiSessionRootTreatments = async () => {
  const sql = `
    SELECT t.treatmentId, t.treatmentType, t.sessionId, t.treatmentDate, CONCAT(p.firstName, ' ', p.lastName) AS patientName
    FROM treatments t
    JOIN appointment a ON a.appointmentId = t.appointmentId
    JOIN patients p ON a.patientId = p.id
    WHERE t.parentTreatmentId = t.treatmentId
    ORDER BY t.treatmentDate DESC
  `;
  return await db.queryDB(sql);
};
*/}
 


module.exports = {
  getTreatmentDataByAppointmentId,
  insertTreatment,
  //getMultiSessionRootTreatments,
};
