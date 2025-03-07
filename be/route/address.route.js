const express = require("express");
const router = express.Router();
const address = require("../controllers/address.controller");

router.get("/", address.getAddressForUser);
router.post("/createAddress", address.createAddress);
router.get("/deleteAddress/:id", address.deleteAddress);
router.put("/updateAddress/:id", address.updateAddress);

module.exports = router;
