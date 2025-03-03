const express = require("express");
const router = express.Router();
const discount = require("../controllers/discount.controller");
const authMiddleWare = require("../middleware/auth.middleWare");

router.get("/getDiscounts", discount.getDiscounts);
router.get("/deleteDiscount/:id", discount.deleteDiscount);
router.post("/createDiscount", discount.createDiscount);
router.put("/updateCreate", discount.updateCreate);

module.exports = router;
