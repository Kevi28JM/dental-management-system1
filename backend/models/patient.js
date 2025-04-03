const db= require('./db');//import the database connection

const createPatient = async (firstName,lastName, dob, gender, phone, email, address) =>{
    try{
        //insert new patient into the database (patient id id auto generated)
        const result = await db.queryDB(
            "INSERT INTO patients (firstName, lastName, dob, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [firstName, lastName, dob, gender, phone || null, email || null, address]
        );
        if (!result.insertId) {
            throw new Error("Failed to insert patient");
        }
        return { message: "Patient registered successfully", patientId: result.insertId };
        }catch (error) {
            console.error("Error creating patient:", error);
            throw { message: "Database error", error };
        }
    };


//Fetch all patients
const getAllPatients = async () => {
   try {
       const result = await db.queryDB("SELECT * FROM patients");
       return result;
   }catch (error) {
       console.error("Error fetching patients:", error);
       throw { message: "Database error", error };
   }
};

//Function to search for patients by name
const searchPatientsByName = async (searchQuery) => {
    try {
        const result = await db.queryDB("SELECT * FROM patients WHERE first_name LIKE ? OR last_name LIKE ?", [`%${searchQuery}%`, `%${searchQuery}%`]);
        return result;
    } catch (error) {
        console.error("Error searching patients:", error);
        throw { message: "Database error", error };
    }
};

const updatePatient = async (id, firstName, lastName, dob, gender, phone, email, address) => {
    try {
        const result = await db.queryDB(
            "UPDATE patients SET firstName=?, lastName=?, dob=?, gender=?, phone=?, email=?, address=? WHERE id=?",
            [firstName, lastName, dob, gender, phone || null, email || null, address, id]
        );
        if (result.affectedRows === 0) {
            throw new Error("No patient found with the given ID");
        }
        return { message: "Patient updated successfully" };
    } catch (error) {
        console.error("Error updating patient:", error);
        throw { message: "Database error", error };
    }
};

module.exports = {createPatient, getAllPatients, searchPatientsByName, updatePatient};