const express = require("express");
const router = express.Router();
const Material = require("../controllers/material.controllers");

router.get("/getMaterial", Material.getMaterial);
router.post("/createMaterial", Material.createMaterial);

module.exports = router;
