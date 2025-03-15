const db = require('./db');

// Sign up a new user (Create a new user in the database)
// Create a regular user (Dentist, Assistant, or Permanent Patient)
const createUser = (name, phone, email, passwordHash, role) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, phone, email, passwordHash, role], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return reject(err);  // Reject the promise on error
      }
      resolve(result);  // Resolve the promise with the result
    });
  });
};

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


// Find user by phone number (For login)
const findUserByPhone = (phone) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE phone = ?';
    db.query(query, [phone], (err, result) => {
      if (err) {
        console.error('Error finding user by phone:', err);
        return reject(err);  // Reject the promise on error
      }
      resolve(result[0]);  // Resolve with the first result (or null if not found)
    });
  });
};

// Find user by email (Optional, For login if email is provided)
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
      if (err) {
        console.error('Error finding user by email:', err);
        return reject(err);  // Reject the promise on error
      }
      resolve(result[0]);  // Resolve with the first result (or null if not found)
    });
  });
};

module.exports = {
  createUser,
  createTemporaryPatient,
  findUserByPhone,  // Updated to search by phone
  findUserByEmail,  // Email search still available as optional
};
