const { Origin, Account } = require("../models");
const { Op } = require("sequelize");
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

const getOrigin = async (req, res) => {
  try {
    const listOrigin = await Origin.findAll({
      attributes: ["name", "originCode"],
      where: {
        status: 1,
      },
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listOrigin,
    });
  } catch (error) {
    console.log("Lỗi get Origin: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createOrigin = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { name } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!name) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu nơi sản xuất",
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
    const checkOrigin = await Origin.findOne({ where: { name } });
    let originCode;
    if (!account.name) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại !",
      });
    }
    originCode = await generateUniqueCode(Origin, "originCode");
    if (checkOrigin) {
      return res.json({
        status: 400,
        message: "Nơi xuất xứ đã tồn tại",
      });
    }
    await Origin.create({
      originCode,
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
    console.log("Lỗi tạo mới origin: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getOrigin,
  createOrigin,
};
