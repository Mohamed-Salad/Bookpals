// test-connection.js
const db = require("./db"); // or import db from './db' for ES modules

async function testConnection() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("Connection successful:", result.rows[0]);
    db.end(); // Close the connection
  } catch (error) {
    console.error("Connection error:", error);
  }
}

testConnection();
