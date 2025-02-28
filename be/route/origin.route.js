const express = require("express");
const router = express.Router();
const Origin = require("../controllers/origin.controller");

router.get("/getOrigin", Origin.getOrigin);
router.post("/createOrigin", Origin.createOrigin);

module.exports = router;
