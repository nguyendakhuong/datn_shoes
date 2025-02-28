const { Token, Admin, Account } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const getAdminId = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });

    if (!account) {
      return res.json({
        status: 404,
        message: "Người dùng không tồn tại",
      });
    }
    return res.json({
      status: 200,
      data: account,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Lỗi server" });
  }
};
const getAccountsAdmin = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Truyền token thông qua authorization",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const getAccount = await Account.findOne({ where: { id: decoded.id } });
    if (getAccount.accountType != "admin") {
      return res.json({
        status: 400,
        message: "Không đúng tài khoản admin",
      });
    }
    const listAdmin = await Admin.findAll();

    if (!listAdmin || listAdmin.length === 0) {
      return res.json({ status: 400, message: "Chưa có nhân viên nào" });
    }
    const employeeCodes = listAdmin.map((admin) => admin.employeeCode);

    const accounts = await Account.findAll({
      where: { employeeCode: employeeCodes },
      attributes: ["employeeCode", "username"],
    });

    const listAdminWithUsername = listAdmin.map((admin) => {
      const account = accounts.find(
        (acc) => acc.employeeCode === admin.employeeCode
      );
      return {
        ...admin.toJSON(),
        username: account ? account.username : null,
      };
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listAdminWithUsername,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách admin: ", error);
    return res.json({ status: 500, message: "Lỗi server" });
  }
};

module.exports = {
  getAdminId,
  getAccountsAdmin,
};
