const db = require('./db');

// Save normal treatment
const saveTreatment = async (patientId, date, time_slot, treatment_notes, prescription) => {
  try {
    console.log(`[saveTreatment] Saving normal treatment for patientId=${patientId} on ${date} at ${time_slot}`);
    const result = await db.queryDB(
      "INSERT INTO treatments (patientId, date, time_slot, treatments, prescription) VALUES (?, ?, ?, ?, ?)",
      [patientId, date, time_slot, treatment_notes, prescription]
    );
    console.log(`[saveTreatment] Insert result:`, result)

    if (!result.insertId) {
      throw new Error('Failed to save treatment');
    }

    console.log(`[saveTreatment] Treatment saved successfully with treatmentId=${result.insertId}`);
    return { message: "Treatment saved successfully", treatmentId: result.insertId };
  } catch (error) {
    console.error("Error saving treatment:", error);
    throw { message: "Database error", error };
  }
};


// Save multi-session treatment + sessions
const saveMultiSessionTreatment = async (patientId, mainTreatmentNotes, prescription, sessions, totalCost) => {
  try {
    console.log(`[saveMultiSessionTreatment] Saving multi-session treatment for patientId=${patientId} with ${sessions.length} sessions and totalCost=${totalCost}`);

    const [mainResult] = await db.queryDB(
      "INSERT INTO treatments (patientId, date, time_slot, treatments, prescription, total_cost, is_multisession) VALUES (?, CURDATE(), 'Multiple', ?, ?, ?, 1)",
      [patientId, mainTreatmentNotes, prescription, totalCost]
    );

    console.log(`[saveMultiSessionTreatment] Main treatment insert result:`, mainResult);

    const mainTreatmentId = mainResult.insertId;
    console.log(`[saveMultiSessionTreatment] Main treatment saved with mainTreatmentId=${mainTreatmentId}`);

    // 2️⃣ Insert each session
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      console.log(`[saveMultiSessionTreatment] Saving session ${i + 1}:`, session);
      await db.queryDB(
        "INSERT INTO treatment_sessions (patientId, mainTreatmentId, date, time_slot, notes) VALUES (?, ?, ?, ?, ?)",
        [patientId, mainTreatmentId, session.date, session.time_slot, session.notes]
      );
    }


    console.log(`[saveMultiSessionTreatment] All sessions saved successfully for mainTreatmentId=${mainTreatmentId}`);
    return { message: "Multi-session treatment created successfully", mainTreatmentId };
  } catch (error) {
    console.error("Error saving multi-session treatment:", error);
    throw { message: "Database error", error };
  }
};



// Get treatment history
const getTreatmentHistory = async (patientId) => {
  try {
    console.log(`[getTreatmentHistory] Fetching treatment history for patientId=${patientId}`);
    const result = await db.queryDB(
      "SELECT * FROM treatments WHERE patientId = ? ORDER BY date DESC",
      [patientId]
    );
    console.log(`[getTreatmentHistory] Fetched ${result.length} treatments for patientId=${patientId}`);
    return result;
  } catch (error) {
    console.error("Error fetching treatment history:", error);
    throw { message: "Database error", error };
  }
};



// Get sessions for a multi-session treatment
const getTreatmentSessions = async (mainTreatmentId) => {
  try {
    console.log(`[getTreatmentSessions] Fetching sessions for mainTreatmentId=${mainTreatmentId}`);
    const result = await db.queryDB(
      "SELECT * FROM treatment_sessions WHERE mainTreatmentId = ? ORDER BY date",
      [mainTreatmentId]
    );
    console.log(`[getTreatmentSessions] Fetched ${result.length} sessions for mainTreatmentId=${mainTreatmentId}`);
    return result;
  } catch (error) {
    console.error("Error fetching treatment sessions:", error);
    throw { message: "Database error", error };
  }
};


// Get full patient details + treatments (with sessions if needed)
const getPatientFullDetails = async (patientId) => {
    try {
      console.log(`Fetching patient details + treatment history for patientId=${patientId}`);
  
      // 1️⃣ Get patient details (from patients table)
      const patientResult = await db.queryDB(
        "SELECT * FROM patients WHERE id = ?",
        [patientId]
      );
  
      if (patientResult.length === 0) {
        throw new Error('Patient not found');
      }
      const patientDetails = patientResult[0];
  
      // 2️⃣ Get all treatments
      const treatments = await db.queryDB(
        "SELECT * FROM treatments WHERE patientId = ? ORDER BY date DESC",
        [patientId]
      );
  
      // 3️⃣ For each treatment, if it’s multisession, get its sessions
      const treatmentHistory = [];
      for (const treatment of treatments) {
        let sessions = [];
        let type = 'Normal';
  
        if (treatment.is_multisession === 1) {
          type = 'Multi-session';
          const sessionResults = await db.queryDB(
            "SELECT * FROM treatment_sessions WHERE mainTreatmentId = ? ORDER BY date",
            [treatment.treatmentId]
          );
          sessions = sessionResults;
        }
  
        treatmentHistory.push({
          treatmentId: treatment.treatmentId,
          date: treatment.date,
          time_slot: treatment.time_slot,
          notes: treatment.treatments,
          prescription: treatment.prescription,
          totalCost: treatment.total_cost || null,
          type,
          sessions
        });
      }
    console.log(treatmentHistory);
      return { patientDetails, treatmentHistory };
    } catch (error) {
      console.error("Error in getPatientFullDetails:", error);
      throw { message: "Database error", error };
    }
  };
  
  // Create dentist profile
  const createDentist = async (user_id, name, specialization, phone, email) => {
    try {

      console.log("Starting dentist profile save process...");
      console.log("Input values:", { user_id, name, specialization, phone, email });

      // Insert or update dentist profile
      const sql = `
            INSERT INTO dentists (user_id, name, specialization, phone, email)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name=?, specialization=?, phone=?, email=?
        `;
        const values = [user_id, name, specialization, phone, email, name, specialization, phone, email];

        console.log("Executing SQL query:", sql);
        console.log("SQL values:", values);

        const result = await db.queryDB(sql, values);

        console.log("Query result:", result);
  
      // Check if insert/update was successful
      if (!result.insertId && result.affectedRows === 0) {
        console.error("No rows inserted or updated.");
        throw new Error("Failed to insert/update dentist");
      }
  
      const dentistId = result.insertId || null; // insertId only if new insert (update gives no insertId)

        console.log("Dentist profile saved successfully");
        console.log("Dentist ID (if new insert):", dentistId);

      return {
        message: "Dentist profile saved successfully",
        dentistId: result.insertId || null // insertId only if new insert (update gives no insertId)
      };
  
    } catch (error) {
      console.error("Error creating dentist:", error);
      throw { message: "Database error", error };
    }
  };
  



module.exports = {
  saveTreatment,
  saveMultiSessionTreatment,
  getTreatmentHistory,
  getTreatmentSessions,
  createDentist 
};
