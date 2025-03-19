const { Token, Admin, Account, Client } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const getAdmin = async (req, res) => {
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
      attributes: ["employeeCode", "username", "status"],
    });

    const listAdminWithUsername = listAdmin.map((admin) => {
      const account = accounts.find(
        (acc) => acc.employeeCode === admin.employeeCode
      );
      return {
        ...admin.toJSON(),
        username: account ? account.username : null,
        status: account ? account.status : null,
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
const getAdminId = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Người dùng không tồn tại",
      });
    }
    const admin = await Admin.findOne({ where: { id }, raw: true });
    const getAccount = await Account.findOne({
      where: { employeeCode: admin.employeeCode },
      raw: true,
    });
    const data = {
      username: getAccount.username,
      accountType: getAccount.accountType,
      status: getAccount.status,
      id: admin.id,
      employeeCode: admin.employeeCode,
      name: admin.name,
      sex: admin.sex,
      address: admin.address,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      position: admin.position,
      dob: admin.dob,
      creator: admin.creator,
      updater: admin.updater,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
    res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy admin theo id: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server.",
    });
  }
};
const updateAdmin = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { id } = req.params;
    const data = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản!",
      });
    }
    const admin = await Admin.findOne({ where: { id } });
    if (account.employeeCode !== admin.employeeCode) {
      return res.json({
        status: 400,
        message: "Chỉ có tài khoản chính chủ mới được cập nhật thông tin",
      });
    }
    await account.update({ name: data.name });
    await admin.update({
      name: data.name,
      sex: data.sex,
      address: data.address,
      phoneNumber: data.phoneNumber,
      email: data.email,
      position: data.position,
      dob: data.dob,
      creator: account.name,
      updater: account.name,
    });
    return res.json({
      status: 200,
      message: "Cập nhật thành công",
    });
  } catch (e) {
    console.log("Lỗi cập nhật admin: ", e);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findOne({ where: { id } });
    if (!admin) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản admin",
      });
    }
    const account = await Account.findOne({
      where: { employeeCode: admin.employeeCode },
    });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản đăng nhập của admin",
      });
    }
    if (account.status === 1) {
      account.status = 2;
      await account.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
    if (account.status === 2) {
      account.status = 1;
      await account.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
  } catch (e) {
    console.log("Lỗi cập nhật trạng thái admin", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateStatusUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Client.findOne({ where: { id } });
    if (!user) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản user",
      });
    }
    const account = await Account.findOne({
      where: { customerCode: user.customerCode },
    });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản đăng nhập của user",
      });
    }
    if (account.status === 1) {
      account.status = 2;
      await account.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
    if (account.status === 2) {
      account.status = 1;
      await account.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
  } catch (e) {
    console.log("Lỗi cập nhật trạng thái admin", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getClients = async (req, res) => {
  try {
    const listClients = await Client.findAll();
    if (!listClients || listClients.length === 0) {
      return res.json({ status: 400, message: "Chưa có người dùng nào" });
    }
    const customerCode = listClients.map((users) => users.customerCode);

    const accounts = await Account.findAll({
      where: { customerCode: customerCode },
      attributes: ["customerCode", "username", "status"],
    });

    const listClientWithUsername = listClients.map((user) => {
      const account = accounts.find(
        (acc) => acc.customerCode === user.customerCode
      );
      return {
        ...user.toJSON(),
        username: account ? account.username : null,
        status: account ? account.status : null,
      };
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listClientWithUsername,
    });
  } catch (e) {
    console.log("Lỗi lấy danh sách người dùng: ", e);
    return res.json({
      status: 501,
      message: "Lỗi server a",
    });
  }
};

module.exports = {
  getAdmin,
  getAccountsAdmin,
  getAdminId,
  updateAdmin,
  updateStatus,
  getClients,
  updateStatusUser,
};
