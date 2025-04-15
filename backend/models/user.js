const db = require('./db');


// Sign up a new user (Create a new user in the database)
const createUser = async (name, phone, email, passwordHash, role, patient_id = null) => {
  try {
    // Check if user already exists before inserting
    const existingUsers = await db.queryDB('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      throw { message: 'Phone number already registered' };
    }

    // Insert new user
    const result = await db.queryDB(
      'INSERT INTO users (name, phone, email, password, role, patient_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone, email, passwordHash, role, patient_id]
    );
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
const findPatientById = (patientId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM patients WHERE patient_id = ?", [patientId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// ✅ Check if a user already exists for a patient_id
const findUserByPatientId = (patientId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE patient_id = ?", [patientId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// Find user by phone number (For login)
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

// Find user by email  
const findUserByEmail = async (email,role) => {
  try {
    const result = await db.queryDB('SELECT * FROM users WHERE email = ?', [email,role]);
    console.log("Database Query Result:", result);
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
  findUserByPhone,  // Updated to search by phone
  findUserByEmail,  // Email search still available as optional
  findPatientById,
  findUserByPatientId
};
