const db= require('./db');//import the database connection
const bcrypt = require("bcryptjs");//import bcrypt for password hashing

const generateTempPassword = (length =8) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    };

const createPatient = async (firstName,lastName, dob, gender, phone, email, address) =>{
    try{
        const tempPassword = generateTempPassword(); //generate a temporary password for the patient
        const hashedPassword = await bcrypt.hash(tempPassword, 10); //hash the temporary password

        //insert new patient into the database (patient id id auto generated)
        const result = await db.queryDB(
            "INSERT INTO patients (firstName, lastName, dob, gender, phone, email, address, temp_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [firstName, lastName, dob, gender, phone || null, email || null, address, hashedPassword]
        );
        //check if the insert was successful
        //if not, throw an error
        if (!result.insertId) {
            throw new Error("Failed to insert patient");
        }
        return { 
            message: "Patient registered successfully", 
            patientId: result.insertId,
            tempPassword // Return raw temp password for assistant to give
        };
            
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