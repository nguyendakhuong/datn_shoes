const express = require("express");
const router = express.Router();
const account = require("../controllers/account.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.post("/register", account.register);
router.post("/login", account.login);
router.get("/logout", authMiddleWare.apiAuth, account.logout);

module.exports = router;
