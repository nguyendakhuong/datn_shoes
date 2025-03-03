const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.get("/:token", admin.getAdmin);
router.get("/getAdminId/:id", admin.getAdminId);
router.put("/updateAdmin/:id", admin.updateAdmin);
router.get("/updateStatus/:id", admin.updateStatus);
// router.get("/deleteAdmin/:id", admin.deleteAccount);
router.get("/getAccountsAdmin/:token", admin.getAccountsAdmin);

module.exports = router;
