const { Material, Account } = require("../models");
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

const getMaterial = async (req, res) => {
  try {
    const listMaterial = await Material.findAll({
      attributes: ["name", "materialCode"],
      where: {
        status: 1,
      },
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listMaterial,
    });
  } catch (error) {
    console.log("Lỗi get Material: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createMaterial = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { name } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!name) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu tên chất liệu",
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
    const checkMaterial = await Material.findOne({ where: { name } });
    let materialCode;
    if (!account.name) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại !",
      });
    }
    materialCode = await generateUniqueCode(Material, "materialCode");
    if (checkMaterial) {
      return res.json({
        status: 400,
        message: "Chất liệu đã tồn tại",
      });
    }
    await Material.create({
      materialCode,
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
    console.log("Lỗi tạo mới material: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getMaterial,
  createMaterial,
};
