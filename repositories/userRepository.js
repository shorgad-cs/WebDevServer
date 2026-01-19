const db = require("../config/db");
const User = require("../models/user");

class UserRepository {
  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM Users WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? new User(row) : null);
        }
      );
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM Users WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row ? new User(row) : null);
      });
    });
  }

  async create({ email, fullName, passwordHash }) {
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Users (email, fullName, passwordHash, createdAt) VALUES (?, ?, ?, ?)`,
        [email, fullName, passwordHash, createdAt],
        function (err) {
          if (err) return reject(err);
          resolve(
            new User({
              id: this.lastID,
              email,
              fullName,
              passwordHash,
              createdAt,
            })
          );
        }
      );
    });
  }
}

module.exports = new UserRepository();
