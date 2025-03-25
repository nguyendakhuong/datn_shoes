const express = require("express");
const payment = require("../controllers/payment.controller");
const router = express.Router();

router.post("/createOrderPayment", payment.createOrderPayment);
router.post("/createPayment", payment.createPayment);
router.get("/configPayment", payment.configPayment);
module.exports = router;
