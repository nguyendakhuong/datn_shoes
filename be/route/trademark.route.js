const express = require("express");
const router = express.Router();
const Trademark = require("../controllers/trademark.controller");

router.get("/getTrademark", Trademark.getTrademark);
router.post("/createTrademark", Trademark.createTrademark);

module.exports = router;
