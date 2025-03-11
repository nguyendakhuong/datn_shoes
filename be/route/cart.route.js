const express = require("express");
const router = express.Router();
const cart = require("../controllers/cart.controler");

router.get("/getCartByUser", cart.getCartByUser);
router.get("/productToCart/:id", cart.productToCart);
router.post("/deleteItemCart", cart.deleteItemCart);

module.exports = router;
