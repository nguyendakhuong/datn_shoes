const { Promotion, Account } = require("../models");
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

const getDiscounts = async (req, res) => {
  try {
    const listDiscount = await Promotion.findAll({
      where: {
        status: 1,
      },
    });
    return res.json({
      status: 200,
      message: "Thành công",
      data: listDiscount,
    });
  } catch (error) {
    console.log("Lỗi get color: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createDiscount = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const data = req.body;
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token",
      });
    }
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    const checkDiscount = await Promotion.findOne({
      where: { name: data.name },
    });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản!",
      });
    }
    if (checkDiscount) {
      return res.json({
        status: 400,
        message: "Mã đã tồn tại",
      });
    }
    let promotionCode = await generateUniqueCode(Promotion, "promotionCode");
    await Promotion.create({
      promotionCode,
      name: data.name,
      promotionLevel: data.promotionLevel, //mức khuyển mại
      promotionType: data.promotionType, // Hình thức khuyến mãi
      conditionsOfApplication: data.conditionsOfApplication, // Điều kiện áp dụng (1 là giảm tiền || 2 là giảm theo %)
      maximumPromotion: data.maximumPromotion, // mức khuyến mãi tối đa
      quantity: data.quantity,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 1,
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
const updateCreate = async (req, res) => {
  try {
    const data = req.body;

    const discount = await Promotion.findOne({ where: { id: data.id } });
    if (!discount) {
      return res.json({
        status: 400,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    discount.promotionLevel = data.promotionLevel;
    discount.promotionType = data.promotionType;
    discount.conditionsOfApplication = data.conditionsOfApplication;
    discount.maximumPromotion = data.maximumPromotion;
    discount.quantity = data.quantity;
    discount.startDate = data.startDate;
    discount.endDate = data.endDate;
    await discount.save();
    return res.json({
      status: 200,
      message: "Cập nhật thành công",
    });
  } catch (e) {
    console.log("Lỗi cập nhật discount: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({
      status: 400,
      message: "Thiếu id",
    });
  }
  const discount = await Promotion.findOne({ where: { id } });
  if (!discount) {
    return res.json({
      status: 400,
      message: "Mã không tồn tại",
    });
  }
  discount.status = 2;
  await discount.save();

  return res.json({
    status: 200,
    message: "Xóa thành công!",
  });
};
module.exports = {
  getDiscounts,
  createDiscount,
  deleteDiscount,
  updateCreate,
};
