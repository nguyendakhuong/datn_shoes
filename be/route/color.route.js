const express = require("express");
const router = express.Router();
const color = require("../controllers/color.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.get("/getColor", color.getColors);
router.post("/createColor", color.createColor);

module.exports = router;
