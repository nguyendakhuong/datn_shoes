const { Token, Client, Account } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const getUser = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token!",
      });
    }
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const user = await Client.findOne({
      where: { customerCode: account.customerCode },
    });
    if (!user) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản!",
      });
    }
    const data = {
      id: user.customerCode,
      username: account.username,
      name: user.name,
      sex: user.sex,
      phoneNumber: user.phoneNumber,
      email: user.email,
      dob: user.dob,
    };
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (error) {
    console.log("Lỗi lấy dữ liệu user: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id, email, name, phoneNumber, sex, dob } = req.body;
    if (!id || !email || !name || !phoneNumber || !sex || !dob) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
      });
    }
    const user = await Client.findOne({ where: { customerCode: id } });
    if (!user) {
      return res.json({
        status: 400,
        message: "Không tìm thấy người dùng! ",
      });
    }
    user.name = name;
    user.sex = sex;
    user.phoneNumber = phoneNumber;
    user.email = email;
    user.dob = dob;
    user.updateUser = name;
    await user.save();
    return res.json({
      status: 200,
      message: "Cập nhật thành công!",
    });
  } catch (e) {
    console.log("Lỗi cập nhật người dùng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const changPassword = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { password, newPassword } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token!",
      });
    }
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.json({
        status: 400,
        message: "Mật khẩu hiện tại không chính xác",
      });
    }
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Account.update(
      { password: hashedPassword },
      { where: { id: account.id } }
    );
    return res.json({
      status: 200,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (e) {
    console.log("Lỗi thay đổi mật khẩu: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getUser,
  updateUser,
  changPassword,
};
