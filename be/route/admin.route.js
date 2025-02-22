const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.post("/register", admin.register);
router.post("/login", admin.login);

router.get("/verify/:id/:token", admin.verifyEmail);
router.get("/account/admin/:token", admin.getAdminId);
router.get("/logout", authMiddleWare.apiAuth, admin.logout);
// router.get("/deleteAdmin/:id", admin.deleteAccount);
// router.get("/getAccounts", admin.getAccountsAdmin);

module.exports = router;
