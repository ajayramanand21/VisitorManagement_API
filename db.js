// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Create and export DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
  } else {
    console.log('MySQL connected successfully.');
  }
});

module.exports = db;
