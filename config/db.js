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

    // Wrapper to standardize usage
    db = {
        query: async (sql, params = []) => {
            // Convert SQLite "?" placeholders to Postgres "$1, $2"
            let i = 1;
            const pgSql = sql.replace(/\?/g, () => `$${i++}`);
            const result = await pool.query(pgSql, params);
            return { rows: result.rows, lastID: null }; // PG returns rows directly
        }
    };

    // Initialize Postgres Table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          fullName VARCHAR(255) NOT NULL,
          passwordHash TEXT NOT NULL,
          createdAt VARCHAR(255) NOT NULL
        );`;
    pool.query(createTableQuery).catch(err => console.error(err));

} else {
    // === DEVELOPMENT (SQLite) ===
    type = 'sqlite';
    const sqlite3 = require("sqlite3").verbose();
    const dbPath = path.join(__dirname, "..", "db.sqlite");
    const sqliteDb = new sqlite3.Database(dbPath);

    // Promisify SQLite methods to match async/await style
    db = {
        query: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                // If it's a SELECT, use db.all, otherwise db.run
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

    // Initialize SQLite Table
    sqliteDb.serialize(() => {
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS Users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              fullName TEXT NOT NULL,
              passwordHash TEXT NOT NULL,
              createdAt TEXT NOT NULL
            )
        `);
    });
}

// Export the generic DB object and the type
module.exports = { db, type };