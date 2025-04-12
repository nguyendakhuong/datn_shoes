const express = require("express");
const order = require("../controllers/order.controller");
const router = express.Router();
const uploadCloud = require("../config/cloudinary.config");

router.post("/createOrder", order.createOrder);
router.post("/orderCartAdmin", order.orderCartAdmin);
router.get("/getAllOrders", order.getAllOrders);
router.get("/verifyOrder/:orderCode", order.verifyOrder);
router.get("/getAllOrderByUser", order.getAllOrderByUser);
router.get("/getOrderNote/:orderCode", order.getOrderNote);
router.get("/createOrderAdmin", order.createOrderAdmin);
router.get("/getOrderAdmin", order.getOrderAdmin);
router.get("/deleteOrderAdminByCode/:orderCode", order.deleteOrderAdminByCode);
router.get("/deleteOrderDetail/:orderDetailCode", order.deleteOrderDetail);
router.get("/getOrderAdminByCode/:orderCode", order.getOrderAdminByCode);

router.post("/addProductToOrderAdmin/:orderCode", order.addProductToOrderAdmin);
router.post("/payOrderAdmin/:orderCode", order.payOrderAdmin);
router.post(
  "/updateQuantityOrderDetail/:orderDetailCode",
  order.updateQuantityOrderDetail
);

router.post("/searchOrderByPhoneNumber", order.searchOrderByPhoneNumber);
router.post("/cancelOrderUser", order.cancelOrderUser);
router.post("/deliveryOrder", order.deliveryOrder);
router.post("/cancelOrderAdmin", order.cancelOrderAdmin);

router.post(
  "/confirmOrderByAdmin",
  uploadCloud.single("image"),
  order.confirmOrderAdmin
);

module.exports = router;
