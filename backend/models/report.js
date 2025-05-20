const db = require('./db');

const getAppointmentReport = async () => {
  try {
    const appointments = await db.queryDB(
      `SELECT a.appointmentId, a.date, t.payment
       FROM appointment a
       LEFT JOIN treatments t ON a.appointmentId = t.appointmentId`
    );

    let totalRevenue = 0;
    const reportData = appointments.map((row) => {
      const payment = parseFloat(row.payment || 0);
      totalRevenue += payment;
      return {
        appointmentId: row.appointmentId,
        date: row.date,
        payment
      };
    });

    return {
      totalAppointments: reportData.length,
      totalRevenue,
      report: reportData
    };
  } catch (error) {
    console.error("Error fetching appointment report:", error);
    throw error;
  }
};

module.exports = {
  getAppointmentReport
};