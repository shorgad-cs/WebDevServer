const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");

module.exports = session({
    store: new SQLiteStore({
        db: "sessions.sqlite",
        dir: path.join(__dirname, ".."),
    }),
    secret: "replace_this_with_env_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
    },
});
