const db = require('./db'); // Assuming you have a db connection module

const reportModel = {
    /**
     * Get Appointment Summary Report
     */
    getAppointmentSummary: async (startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    a.appointmentId,
                    CONCAT(p.firstName, ' ', p.lastName) AS patientName,
                    u.name AS dentistName,
                    a.date AS appointmentDate,
                    COUNT(t.treatmentId) AS numberOfTreatments,
                    SUM(t.payment) AS totalPayment
                FROM 
                    appointment a
                JOIN 
                    patients p ON a.patientId = p.id
                JOIN 
                    dentists d ON a.dentistId = d.dentist_id
                JOIN 
                    users u ON d.user_id = u.id
                LEFT JOIN 
                    treatments t ON a.appointmentId = t.appointmentId
                WHERE 
                    a.date BETWEEN ? AND ?
                GROUP BY 
                    a.appointmentId, patientName, dentistName, appointmentDate
                ORDER BY 
                    a.date DESC`;
            
            const results = await db.queryDB(query, [startDate, endDate]);
            return results;
        } catch (error) {
            console.error("Error fetching appointment summary:", error);
            throw { message: "Database error", error };
        }
    },

    /**
     * Get Patient Treatment History
     */
    getPatientTreatmentHistory: async (patientId) => {
        try {
            const query = `
                SELECT 
                    p.id AS patientId,
                    CONCAT(p.firstName, ' ', p.lastName) AS patientName,
                    t.treatmentType,
                    t.treatmentDate,
                    t.payment,
                    u.name AS dentistName
                FROM 
                    patients p
                JOIN 
                    appointment a ON p.id = a.patientId
                JOIN 
                    treatments t ON a.appointmentId = t.appointmentId
                JOIN 
                    dentists d ON a.dentistId = d.dentist_id
                JOIN 
                    users u ON d.user_id = u.id
                WHERE 
                    p.id = ?
                ORDER BY 
                    t.treatmentDate DESC`;
            
            const results = await db.queryDB(query, [patientId]);
            return results;
        } catch (error) {
            console.error("Error fetching patient treatment history:", error);
            throw { message: "Database error", error };
        }
    },

    /**
     * Get Dentist Performance Report
     */
    getDentistPerformance: async (startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    u.name AS dentistName,
                    d.specialization,
                    COUNT(DISTINCT a.appointmentId) AS totalAppointments,
                    COUNT(t.treatmentId) AS totalTreatments,
                    SUM(t.payment) AS totalRevenue,
                    AVG(t.payment) AS averagePaymentPerTreatment
                FROM 
                    dentists d
                JOIN 
                    users u ON d.user_id = u.id
                LEFT JOIN 
                    appointment a ON d.dentist_id = a.dentistId
                LEFT JOIN 
                    treatments t ON a.appointmentId = t.appointmentId
                WHERE 
                    a.date BETWEEN ? AND ?
                GROUP BY 
                    dentistName, d.specialization
                ORDER BY 
                    totalRevenue DESC`;
            
            const results = await db.queryDB(query, [startDate, endDate]);
            return results;
        } catch (error) {
            console.error("Error fetching dentist performance:", error);
            throw { message: "Database error", error };
        }
    },

    /**
     * Get Financial Summary Report
     */
    getFinancialSummary: async (startDate, endDate) => {
        try {
            const query = `
                SELECT 
                    DATE_FORMAT(t.treatmentDate, '%Y-%m') AS month,
                    COUNT(t.treatmentId) AS numberOfTreatments,
                    SUM(t.payment) AS totalRevenue,
                    AVG(t.payment) AS averagePayment
                FROM 
                    treatments t
                WHERE 
                    t.treatmentDate BETWEEN ? AND ?
                GROUP BY 
                    DATE_FORMAT(t.treatmentDate, '%Y-%m')
                ORDER BY 
                    month`;
            
            const results = await db.queryDB(query, [startDate, endDate]);
            return results;
        } catch (error) {
            console.error("Error fetching financial summary:", error);
            throw { message: "Database error", error };
        }
    },

    /**
     * Get Patient Demographics Report
     */
    getPatientDemographics: async () => {
        try {
            const query = `
                SELECT 
                    p.gender,
                    COUNT(DISTINCT p.id) AS patientCount,
                    FLOOR(DATEDIFF(CURRENT_DATE, p.dob)/365) AS age,
                    COUNT(DISTINCT a.appointmentId) AS appointmentCount
                FROM 
                    patients p
                LEFT JOIN 
                    appointment a ON p.id = a.patientId
                GROUP BY 
                    p.gender, FLOOR(DATEDIFF(CURRENT_DATE, p.dob)/365)
                ORDER BY 
                    p.gender, age`;
            
            const results = await db.queryDB(query);
            return results;
        } catch (error) {
            console.error("Error fetching patient demographics:", error);
            throw { message: "Database error", error };
        }
    }
};

module.exports = reportModel;