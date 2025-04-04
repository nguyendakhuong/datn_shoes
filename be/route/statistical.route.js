const express = require("express");
const router = express.Router();
const Statistical = require("../controllers/statisical.controller");

router.get("/getInfoStatistical", Statistical.getInfoStatistical);
router.get("/ordersByPaymentMethod", Statistical.ordersByPaymentMethod);
router.get("/productSales", Statistical.productSales);
router.post("/productSalesByDate", Statistical.productSalesByDate);

module.exports = router;
