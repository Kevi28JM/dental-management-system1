const db= require('./db');//import the database connection

const createPatient = async (firstName,lastName, dob, gender, findUserByPhone, findUserByEmail, address) =>{
    try{
        //insert new patient into the database (patient id id auto generated)
        const result = await db.queryDB(
            "INSERT INTO patients (first_name, last_name, dob, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [firstName, lastName, dob, gender, phone || null, email || null, address]
        );
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


module.exports = {createPatient, getAllPatients, searchPatientsByName};