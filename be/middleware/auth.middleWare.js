const { Account } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const apiAuth = async (req, res, next) => {
  let header_token = req.header("Authorization");
  const signature = process.env.SIGN_PRIVATE;
  if (!header_token) {
    return res
      .status(403)
      .json({ status: 403, message: "mã thông báo không xác định" });
  }
  const token = header_token.replace("Bearer ", "");
  try {
    const data = jwt.verify(token, signature);
    const user = await Account.findOne({
      where: {
        id: data?.id,
      },
    });
    // if (!user) {
    //   throw new Error("unknown user");
    // }
    // Gắn thông tin người dùng và token vào yêu cầu
    req.user = user;
    req.data = data;
    next();
  } catch (error) {
    return res.status(401).json({ status: 402, message: error.message });
  }
};

const loggedin = (req, res, next) => {
  if (req.session.loggedin) {
    res.locals.user = req.session.user;
    next();
  } else {
    res.redirect("/");
  }
};
const isAuth = (req, res, next) => {
  if (req.session.loggedin) {
    res.locals.user = req.session.user;
    res.redirect("/home");
  } else {
    next();
  }
};

module.exports = {
  apiAuth,
  loggedin,
  isAuth,
};
