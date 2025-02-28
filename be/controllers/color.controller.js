const { Color, Account } = require("../models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config;

const getColors = async (req, res) => {
  try {
    const listColors = await Color.findAll({
      attributes: ["colorCode", "name"],
      where: {
        status: 1,
      },
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listColors,
    });
  } catch (error) {
    console.log("Lỗi get color: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createColor = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { color } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!color) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu tên màu",
      });
    }
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token",
      });
    }

    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    const checkColor = await Color.findOne({ where: { name: color } });

    if (!account.name) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại !",
      });
    }
    if (checkColor) {
      return res.json({
        status: 400,
        message: "Màu đã tồn tại",
      });
    }
    await Color.create({
      colorCode: "",
      name: color,
      status: 1,
      creator: account.name,
      updater: "",
    });
    res.json({
      status: 200,
      message: "Thêm mới thành công!",
    });
  } catch (error) {
    console.log("Lỗi get color: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getColors,
  createColor,
};
