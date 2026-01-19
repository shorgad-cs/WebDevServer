class User {
    constructor({ id, email, fullName, passwordHash, createdAt }) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }
}

module.exports = User;
