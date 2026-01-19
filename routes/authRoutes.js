const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/register", (req, res) => authController.showRegister(req, res));
router.post("/register", (req, res) => authController.register(req, res));

router.get("/login", (req, res) => authController.showLogin(req, res));
router.post("/login", (req, res) => authController.login(req, res));

router.post("/logout", (req, res) => authController.logout(req, res));

module.exports = router;
