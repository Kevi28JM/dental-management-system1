const db = require('./db');


// Add new appointment to SQL
const addAppointment = async (appointmentId, patientId, dentistId, date) => {
  try {
    const sql = `
      INSERT INTO appointment (appointmentId, patientId, dentistId, date)
      VALUES (?, ?, ?, ?)
    `;
    const params = [appointmentId, patientId, dentistId, date];
    const result = await db.queryDB(sql, params);
    return result;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw { message: "Database error", error };
  }
};

module.exports = {addAppointment,
    
};