const { Client, Account, Address } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config;

const getAddressForUser = async (req, res) => {
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
    const addresses = await Address.findAll({
      where: { idCustom: user.customerCode, status: 1 },
    });
    const data = addresses.map((address) => ({
      id: address.id,
      address: address.address,
      commune: address.commune,
      description: address.description,
      district: address.district,
      province: address.province,
    }));
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy địa chỉ theo user: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createAddress = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { address, commune, description, district, province } = req.body;
    if (!address || !commune || !description || !district || !province) {
      return res.json({
        status: 500,
        message: "Thiếu dữ liệu",
      });
    }
    if (!req.headers.authorization) {
      return res.json({
        status: 400,
        message: "Thiếu token!",
      });
    }
    const token = req.headers.authorization.split(" ")[1];

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
    const checkAddress = await Address.findAll({ where: { status: 1 } });
    if (checkAddress.length >= 3) {
      return res.json({
        status: 400,
        message: "Bạn chỉ được tạo tối đa 3 địa chỉ",
      });
    }
    await Address.create({
      address,
      province,
      district,
      commune,
      description,
      idCustom: user.customerCode,
      creator: user.name,
      updater: "",
      status: 1,
    });
    return res.json({
      status: 200,
      message: "Thêm mới thành công",
    });
  } catch (e) {
    console.log("Lỗi thêm mới địa chỉ: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id",
      });
    }
    const address = await Address.findOne({ where: { id } });
    if (!address) {
      return res.json({
        status: 400,
        message: "Không tìm thấy địa chỉ",
      });
    }
    address.status = 2;

    await address.save();
    return res.json({
      status: 200,
      message: "Xóa thành công",
    });
  } catch (e) {
    console.log("Lỗi xóa địa chỉ: ", e);

    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateAddress = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { address, commune, description, district, province } = req.body;
    const { id } = req.params;
    if (!address || !commune || !description || !district || !province) {
      return res.json({
        status: 500,
        message: "Thiếu dữ liệu",
      });
    }
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id",
      });
    }
    if (!req.headers.authorization) {
      return res.json({
        status: 400,
        message: "Thiếu token!",
      });
    }
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const addresses = await Address.findOne({ where: { id } });
    if (!addresses) {
      return res.json({
        status: 400,
        message: "Không tìm thấy địa chỉ cần cập nhật",
      });
    }

    addresses.address = address;
    addresses.province = province;
    addresses.district = district;
    addresses.commune = commune;
    addresses.description = description;
    addresses.updater = account.name;

    await addresses.save();
    return res.json({
      status: 200,
      message: "Cập nhật thành công !",
    });
  } catch (e) {
    console.log("Lỗi cập nhật địa chỉ: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getAddressForUser,
  createAddress,
  deleteAddress,
  updateAddress,
};
