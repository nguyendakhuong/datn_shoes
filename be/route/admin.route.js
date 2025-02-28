const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.get("/:token", admin.getAdminId);
// router.get("/deleteAdmin/:id", admin.deleteAccount);
router.get("/getAccountsAdmin/:token", admin.getAccountsAdmin);

module.exports = router;
