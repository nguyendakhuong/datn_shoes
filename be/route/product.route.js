const express = require("express");
const router = express.Router();
const Product = require("../controllers/product.controller");
const uploadCloud = require("../config/cloudinary.config");

router.get("/getProducts", Product.getProducts);
router.post("/createProduct", Product.product);
router.put("/updateProduct", Product.updateProduct);
router.put(
  "/updateProductDetail",
  uploadCloud.single("image"),
  Product.updateProductDetail //
);
router.get("/statusProduct/:id", Product.statusProduct);
router.get("/statusProductDetail/:code", Product.statusProductDetail); //
router.post(
  "/createProductDetail/:id",
  uploadCloud.single("image"),
  Product.createProductDetail
);
router.get("/delete/:id", Product.deleteProduct);
router.get("/getProduct/:id", Product.getProduct);
router.get("/getTenProductUser", Product.getTenProductUser);
router.get("/getAllProduct", Product.getAllProduct);
router.get("/getProductById/:id", Product.getProductById);
router.get("/getProductByIdForUser/:id", Product.getProductByIdForUser);
router.post("/getProductByTrademark", Product.getProductByTrademark);
router.get("/productActive", Product.productActive);

module.exports = router;
