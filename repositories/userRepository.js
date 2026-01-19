const { db } = require("../config/db");
const User = require("../models/user");

class UserRepository {
  // Helper to map DB Lowercase -> App CamelCase
  // We don't need to check "||" anymore because the DB is consistent!
  _mapToModel(row) {
    if (!row) return null;
    return new User({
      id: row.id,
      email: row.email,
      fullName: row.fullname,       // DB gives 'fullname', we map to 'fullName'
      passwordHash: row.passwordhash, // DB gives 'passwordhash', we map to 'passwordHash'
      createdAt: row.createdat
    });
  }

  async findByEmail(email) {
    const result = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    return this._mapToModel(result.rows[0]);
  }

  async findById(id) {
    const result = await db.query('SELECT * FROM Users WHERE id = ?', [id]);
    return this._mapToModel(result.rows[0]);
  }

  async create({ email, fullName, passwordHash }) {
    const createdAt = new Date().toISOString();

    // --- CHANGE: Insert into lowercase column names ---
    const result = await db.query(
      `INSERT INTO Users (email, fullname, passwordhash, createdat) VALUES (?, ?, ?, ?)`,
      [email, fullName, passwordHash, createdAt]
    );

    if (result.lastID) {
      return this.findById(result.lastID);
    } else {
      return this.findByEmail(email);
    }
  }
}

module.exports = new UserRepository();