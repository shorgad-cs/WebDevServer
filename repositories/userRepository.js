const { db } = require("../config/db"); // Import our smart wrapper
const User = require("../models/user");

class UserRepository {
  async findByEmail(email) {
    // We use "?" syntax. db.js converts it to "$1" if we are on Postgres.
    const result = await db.query('SELECT * FROM Users WHERE email = ?',[email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await db.query('SELECT * FROM Users WHERE id = ?', [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  async create({ email, fullName, passwordHash }) {
    const createdAt = new Date().toISOString();

    // 1. Insert the user
    const result = await db.query(
      `INSERT INTO Users (email, fullName, passwordHash, createdAt) VALUES (?, ?, ?, ?)`,
      [email, fullName, passwordHash, createdAt]
    );

    // 2. Fetch the newly created user
    // (This works for both DBs: SQLite uses lastID, Postgres we just query by email to be safe and simple)
    if (result.lastID) {
      // SQLite: We have the ID
      return this.findById(result.lastID);
    } else {
      // Postgres: Query by the unique email to get the full object including ID
      return this.findByEmail(email);
    }
  }
}

module.exports = new UserRepository();