const path = require("path");

let db;
let type;

if (process.env.DATABASE_URL) {
    // === PRODUCTION (PostgreSQL) ===
    type = 'postgres';
    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    db = {
        query: async (sql, params = []) => {
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);
            const result = await pool.query(pgSql, params);
            return { rows: result.rows, lastID: null };
        }
    };

    // --- CHANGE: All columns are now lowercase ---
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          fullname VARCHAR(255) NOT NULL,
          passwordhash TEXT NOT NULL,
          createdat VARCHAR(255) NOT NULL
        );`;
    pool.query(createTableQuery).catch(err => console.error(err));

} else {
    // === DEVELOPMENT (SQLite) ===
    type = 'sqlite';
    const sqlite3 = require("sqlite3").verbose();
    const dbPath = path.join(__dirname, "..", "db.sqlite");
    const sqliteDb = new sqlite3.Database(dbPath);

    db = {
        query: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                if (sql.trim().toUpperCase().startsWith("SELECT")) {
                    sqliteDb.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows: rows, lastID: null });
                    });
                } else {
                    sqliteDb.run(sql, params, function (err) {
                        if (err) reject(err);
                        else resolve({ rows: [], lastID: this.lastID });
                    });
                }
            });
        }
    };

    // --- CHANGE: All columns are now lowercase here too ---
    sqliteDb.serialize(() => {
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS Users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              fullname TEXT NOT NULL,
              passwordhash TEXT NOT NULL,
              createdat TEXT NOT NULL
            )
        `);
    });
}

module.exports = { db, type };