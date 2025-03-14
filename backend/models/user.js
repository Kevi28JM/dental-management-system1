const db = require('./db');

// Sign up a new user (Create a new user in the database)
// Here, phone number is compulsory and email is optional
const createUser = (name, phone, email, passwordHash, callback) => {
  const query = 'INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)';
  db.query(query, [name, phone, email, passwordHash], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return callback(err);
    }
    callback(null, result);
  });
};

// Find user by phone number (For login)
const findUserByPhone = (phone, callback) => {
  const query = 'SELECT * FROM users WHERE phone = ?';
  db.query(query, [phone], (err, result) => {
    if (err) {
      console.error('Error finding user by phone:', err);
      return callback(err);
    }
    callback(null, result[0]);
  });
};

// Find user by email (Optional, For login if email is provided)
const findUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error finding user by email:', err);
      return callback(err);
    }
    callback(null, result[0]);
  });
};

module.exports = {
  createUser,
  findUserByPhone,  // Updated to search by phone
  findUserByEmail,  // Email search still available as optional
};
