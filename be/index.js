const express = require("express");
const app = express();
require("dotenv").config();
const moment = require("moment");
const cors = require("cors");
const path = require("path");
const db = require("./models");
const adminAccount = require("./route/admin.route");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("views"));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const PORT = process.env.POST || 3001;

app.get("/", (req, res) => {
  res.render("ejs/example");
});

app.use("/", adminAccount);

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log("server start localhost: " + PORT);
  });
});
