const db = require('./db');


// Sign up a new user (Create a new user in the database)
const createUser = async (name, phone, email, passwordHash, role, patientId = null, tempPassword = null) => {
  try {
    console.log("Attempting to create user with the following data:");
    console.log({ name, phone, email, role, patientId });

    // Insert new user
    const result = await db.queryDB(
      'INSERT INTO users (name, phone, email, password, role, patient_id, temp_password) VALUES (?, ?, ?, ?, ?, ?, ?)',  // check this
      [name, phone, email, passwordHash, role, patientId, tempPassword]  // check this
    );

    console.log("User inserted successfully. Inserted ID:", result.insertId);
    
    return { message: 'User created successfully', userId: result.insertId };
  } catch (error) {
    console.error('Error creating user:', error);
    throw { message: 'Database error', error };
  }
};
/*
const createTemporaryPatient = (name, phone, email) => {
  return new Promise((resolve, reject) => {
    
    const query = 'INSERT INTO temporary_patients (name, phone, email) VALUES (?, ?, ?)';
    db.query(query, [name, phone, email], (err, result) => {
      if (err) {
        console.error('Error creating temporary patient:', err);
        return reject(err);  // Reject the promise on error
      }
      resolve(result);  // Resolve the promise with the result
    });
  });
};
*/

// ✅ Find patient by patient_id (from `patients` table)
const findPatientById = async (patientId, role) => {
  try {
    console.log("Checking patient by ID:", patientId); // Debug input
    const result = await db.queryDB("SELECT * FROM patients WHERE id = ?", [patientId, role]);
    console.log("Database Query Result:", result);

    if (result.length === 0) {
      console.warn("No patient found with ID:", patientId);
      return null;
    }

    console.log("Patient found:", result[0]);
    return result[0];

  } catch (error) {
    console.error("Error while fetching patient:", error);
    throw { message: "Database error while finding patient", error };
  }
};


// ✅ Find user by patient_id (from `users` table)
const findUserByPatientId = async (patientId) => {
  try {
    console.log("Checking user linked to patient ID:", patientId); // Debug input
    const result = await db.queryDB("SELECT * FROM users WHERE patient_id = ?", [patientId]);
    console.log("Database Query Result:", result);

    if (result.length === 0) {
      console.warn("No user found linked to patient ID:", patientId);
      return null;
    }

    console.log("User found linked to patient ID:", result[0]);
    return result[0];

  } catch (error) {
    console.error("Error while fetching user by patient ID:", error);
    throw { message: "Database error while finding user by patient ID", error };
  }
};


{/*// Find user by phone number (For login)
const findUserByPhone = async (phone,role) => {
  try {
    const result = await db.queryDB('SELECT * FROM users WHERE phone = ? AND role = ?', [phone,role ]);
    console.log("Database Query Result:", result);
    return result.length > 0 ? result[0] : null; // Return user if found, otherwise null
  } catch (error) {
    console.error('Error finding user by phone:', error);
    throw { message: 'Database error', error };
  }
};
*/}

// Find user by email  
const findUserByEmail = async (email,role) => {
  try {
    const result = await db.queryDB('SELECT * FROM users WHERE email = ? ', [email,role]);
    console.log("Database Query Result:", result);
    
    if (result.length > 0) {
      console.log("User ID:", result[0].id);   // This will print 3
      return result[0];  // Return the user object
    } else {
      console.log("No user found");
      return null;
    }  // Return the user object
    // Check if user exists with the provided email
    return result.length > 0 ? result[0] : null; // Return user if found, otherwise null
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw { message: 'Database error', error };
  }
};

module.exports = {
  createUser,
  /*createTemporaryPatient,*/
  //findUserByPhone,  // Updated to search by phone
  findUserByEmail,  // Email search still available as optional
  findPatientById,
  findUserByPatientId
};
