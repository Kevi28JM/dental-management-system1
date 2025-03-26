require('dotenv').config();  // Load .env variables
const mysql = require("mysql2");

// Create a MySQL connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promise wrapper for executing queries using `db.cool`
const cool = (query, params = []) => {
    return pool.promise().query(query, params).then(([rows]) => rows);
};

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL Database!");
        connection.release(); // Release connection back to pool
    }
});

module.exports = { cool };
