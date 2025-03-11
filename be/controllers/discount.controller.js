const { Promotion, Account, Order } = require("../models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const moment = require("moment");
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

const useDiscount = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { discount, total } = req.body;
    if (!discount || !total) {
      return res.json({
        status: 400,
        message: "Thiếu mã giảm giá hoặc tổng tiền",
      });
    }
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
    const getDiscount = await Promotion.findOne({ where: { name: discount } });
    if (!getDiscount) {
      return res.json({
        status: 400,
        message: "Mã không tồn tại",
      });
    }
    if (getDiscount.quantity === 0) {
      return res.json({
        status: 400,
        message: "Đã hết số lượng sử dụng mã giảm giá",
      });
    }

    const currentDate = moment();
    const startDate = moment(getDiscount.startDate);
    const endDate = moment(getDiscount.endDate);
    if (
      startDate.isAfter(currentDate) ||
      endDate.isBefore(currentDate) ||
      startDate.isAfter(endDate)
    ) {
      return res.json({
        status: 400,
        message: "Mã không còn hoạt động",
      });
    }
    const checkOrderDiscount = await Order.findOne({
      where: {
        customerCode: account.customerCode,
        discountCode: getDiscount.promotionCode,
      },
    });
    if (checkOrderDiscount) {
      return res.json({
        status: 400,
        message: "Bạn đã sử dụng mã giảm giá này rồi",
      });
    }
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    const maxPromotion = Number(getDiscount.maximumPromotion);
    if (total < maxPromotion) {
      return res.json({
        status: 400,
        message: `Mãi khuyến mại này chỉ áp dụng với các hóa đơn có giá trị từ ${formatter.format(
          getDiscount.promotionLevel
        )} trở lên`,
      });
    }
    if (getDiscount.promotionType === 1) {
      const newTotal = total - getDiscount.promotionLevel;
      const finalTotal = newTotal >= 0 ? newTotal : 0;
      return res.json({
        status: 200,
        message: " Thành công",
        data: finalTotal,
        discount: getDiscount,
        totalPromotion: getDiscount.promotionLevel,
      });
    }
    if (getDiscount.promotionType === 2) {
      const discountAmount = (total * getDiscount.promotionLevel) / 100;
      const newTotal = total - discountAmount;
      return res.json({
        status: 200,
        message: " Thành công",
        data: newTotal,
        discount: getDiscount,
        totalPromotion: discountAmount,
      });
    }
  } catch (e) {
    console.log("Lỗi sử dụng phiếu khuyến mại: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  getDiscounts,
  createDiscount,
  deleteDiscount,
  updateCreate,
  useDiscount,
};
