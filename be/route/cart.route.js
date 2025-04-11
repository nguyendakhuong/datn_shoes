const express = require("express");
const router = express.Router();
const cart = require("../controllers/cart.controler");

router.get("/getCartByUser", cart.getCartByUser);
router.get("/getCartByAdmin", cart.getCartByAdmin);
router.get("/productToCart/:id", cart.productToCart);
router.get("/productToCartAdmin/:id", cart.productToCartAdmin);
router.post("/productsToCartAdmin", cart.productsToCartAdmin);
router.post("/deleteItemCart", cart.deleteItemCart);

module.exports = router;
