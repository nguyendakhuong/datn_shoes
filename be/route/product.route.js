const express = require("express");
const router = express.Router();
const Product = require("../controllers/product.controller");
const uploadCloud = require("../config/cloudinary.config");

router.get("/getProducts", Product.getProducts);
router.post("/createProduct", uploadCloud.array("image"), Product.product);
router.put(
  "/updateProduct",
  uploadCloud.single("image"),
  Product.updateProduct
);
router.get("/statusProduct/:id", Product.statusProduct);
router.get("/getProduct/:id", Product.getProduct);
router.get("/delete/:id", Product.deleteProduct);

router.get("/getTenProductUser", Product.getTenProductUser);
router.get("/getAllProduct", Product.getAllProduct);
router.get("/getProductById/:id", Product.getProductById);
router.post("/getProductByTrademark", Product.getProductByTrademark);

module.exports = router;
