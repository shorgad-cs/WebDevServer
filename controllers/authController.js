const authService = require("../services/authService");

class AuthController {
    showRegister(req, res) {
        res.render("register", { error: null });
    }

    async register(req, res) {
        try {
            const { email, fullName, password } = req.body;
            const user = await authService.register({ email, fullName, password });

            // store minimal user in session
            req.session.user = { id: user.id, email: user.email, fullName: user.fullName };

            res.redirect("/");
        } catch (err) {
            res.status(400).render("register", { error: err.message });
        }
    }

    showLogin(req, res) {
        res.render("login", { error: null });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await authService.login({ email, password });

            req.session.user = { id: user.id, email: user.email, fullName: user.fullName };

            res.redirect("/");
        } catch (err) {
            res.status(400).render("login", { error: err.message });
        }
    }

    logout(req, res) {
        req.session.destroy(() => {
            res.redirect("/login");
        });
    }
}

module.exports = new AuthController();
