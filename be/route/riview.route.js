const express = require("express");
const router = express.Router();
const riview = require("../controllers/review.controller");

router.get("/", riview.getListRiviewByProduct);
router.post("/createRiview", riview.createRiview);
router.get("/checkRiview", riview.checkRiview);

module.exports = router;
