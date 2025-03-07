const express = require("express");
const router = express.Router();
const user = require("../controllers/user.controller");

router.get("/", user.getUser);
router.put("/updateUser", user.updateUser);
router.put("/changPassword", user.changPassword);

module.exports = router;
