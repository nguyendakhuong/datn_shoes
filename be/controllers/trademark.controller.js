const { Trademark, Account } = require("../models");
const { Op, where } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config;

const generateUniqueCode = async (model, columnName) => {
  let code;
  let exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await model.findOne({ where: { [columnName]: code } });
  } while (exists);
  return code;
};

const getTrademark = async (req, res) => {
  try {
    const listTrademark = await Trademark.findAll({
      attributes: ["name", "brandCode"],
      where: {
        status: 1,
      },
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listTrademark,
    });
  } catch (error) {
    console.log("Lỗi get Trademark: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createTrademark = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { name } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!name) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu tên thương hiệu",
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
    const checkTrademark = await Trademark.findOne({ where: { name } });
    let brandCode;
    if (!account.name) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại !",
      });
    }
    brandCode = await generateUniqueCode(Trademark, "brandCode");
    if (checkTrademark) {
      return res.json({
        status: 400,
        message: "Thương hiệu đã tồn tại",
      });
    }
    await Trademark.create({
      brandCode,
      name,
      status: 1,
      creator: account.name,
      updater: "",
    });
    res.json({
      status: 200,
      message: "Thêm mới thành công!",
    });
  } catch (error) {
    console.log("Lỗi tạo mới trademark: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getTrademark,
  createTrademark,
};
