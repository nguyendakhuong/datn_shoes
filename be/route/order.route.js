const express = require("express");
const order = require("../controllers/order.controller");
const router = express.Router();

router.post("/createOrder", order.createOrder);
router.get("/getAllOrders", order.getAllOrders);
router.get("/verifyOrder/:orderCode", order.verifyOrder);
router.get("/getAllOrderByUser", order.getAllOrderByUser);

router.post("/searchOrderByPhoneNumber", order.searchOrderByPhoneNumber);
module.exports = router;
