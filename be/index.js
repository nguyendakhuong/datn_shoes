const express = require("express");
const app = express();
require("dotenv").config();
const moment = require("moment");
const cors = require("cors");
const path = require("path");
const db = require("./models");

const admin = require("./route/admin.route");
const accounts = require("./route/account.route");
const color = require("./route/color.route");
const trademark = require("./route/trademark.route");
const origin = require("./route/origin.route");
const material = require("./route/material.route");
const product = require("./route/product.route");
const discount = require("./route/discount.route");

const bodyParser = require("body-parser");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const PORT = process.env.POST || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("views"));

app.get("/", (req, res) => {
  res.render("ejs/example");
});

app.use("/", accounts);
app.use("/admin", admin);
app.use("/color", color);
app.use("/trademark", trademark);
app.use("/origin", origin);
app.use("/material", material);
app.use("/product", product);
app.use("/discount", discount);

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log("server start localhost: " + PORT);
  });
});
