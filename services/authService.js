const bcrypt = require("bcrypt");
const userRepo = require("../repositories/userRepository");

class AuthService {
    async register({ email, fullName, password }) {
        const existing = await userRepo.findByEmail(email);
        if (existing) {
            throw new Error("Email already registered.");
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await userRepo.create({ email, fullName, passwordHash });
        return user;
    }

    async login({ email, password }) {
        const user = await userRepo.findByEmail(email);
        if (!user) throw new Error("Invalid email or password.");
        //take user password and compared with hash 
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error("Invalid email or password.");

        return user;
    }
}

module.exports = new AuthService();
