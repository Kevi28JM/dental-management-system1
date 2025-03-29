const db = require('./db');


// Sign up a new user (Create a new user in the database)
const createUser = async (name, phone, email, passwordHash, role) => {
  try {
    // Check if user already exists before inserting
    const existingUsers = await db.queryDB('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      throw { message: 'Phone number already registered' };
    }

    // Insert new user
    const result = await db.queryDB(
      'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email || null, passwordHash, role]
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

// Find user by email (Optional, For login if email is provided)
const findUserByEmail = async (email) => {
  try {
    const result = await db.queryDB('SELECT * FROM users WHERE email = ?', [email]);
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
};
