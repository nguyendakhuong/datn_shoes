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
    if (checkDiscount && checkDiscount.status === 1) {
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
      conditionsOfApplication: data.conditionsOfApplication, // Số tiền tối thiệu
      maximumPromotion: data.maximumPromotion || 0, // mức khuyến mãi tối đa
      quantity: data.quantity,
      describe: data.describe,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 1,
    });
    res.json({
      status: 200,
      message: "Thêm mới thành công!",
    });
  } catch (error) {
    console.log("Lỗi thêm mã giảm giá: ", error);
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
    discount.maximumPromotion = data.maximumPromotion || 0;
    discount.quantity = data.quantity;
    discount.startDate = data.startDate;
    discount.describe = data.describe;
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

    const currentDate = moment(); // Thời điểm hiện tại
    const startDate = moment(getDiscount.startDate).startOf("day"); // 00:00 của ngày bắt đầu
    const endDate = moment(getDiscount.endDate).endOf("day"); // 23:59:59 của ngày kết thúc

    if (
      currentDate.isBefore(startDate) || // Chưa đến ngày bắt đầu
      currentDate.isAfter(endDate) || // Đã qua ngày kết thúc
      startDate.isAfter(endDate) // Ngày bắt đầu > ngày kết thúc => sai logic
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

    if (getDiscount.promotionType === 1) {
      if (total < getDiscount.conditionsOfApplication) {
        return res.json({
          status: 401,
          message: "Mã không áp dụng cho đơn hàng này!",
          data: getDiscount,
        });
      }
      const newTotal =
        total - getDiscount.promotionLevel > 0
          ? total - getDiscount.promotionLevel
          : 0;
      return res.json({
        status: 200,
        message: " Thành công",
        data: newTotal,
        discount: getDiscount,
        totalPromotion: getDiscount.promotionLevel,
      });
    }
    if (getDiscount.promotionType === 2) {
      if (total < getDiscount.conditionsOfApplication) {
        return res.json({
          status: 401,
          message: "Mã không áp dụng cho đơn hàng này!",
          data: getDiscount,
        });
      }
      const maxPromotion = Number(getDiscount.maximumPromotion);
      const discountAmount = (total * getDiscount.promotionLevel) / 100;
      if (discountAmount > maxPromotion) {
        const newTotal = total - maxPromotion;
        return res.json({
          status: 200,
          message: " Thành công",
          data: newTotal,
          discount: getDiscount,
          totalPromotion: maxPromotion,
        });
      }
      if (discountAmount < maxPromotion) {
        const newTotal = total - discountAmount;
        return res.json({
          status: 200,
          message: " Thành công",
          data: newTotal,
          discount: getDiscount,
          totalPromotion: discountAmount,
        });
      }
    }
  } catch (e) {
    console.log("Lỗi sử dụng phiếu khuyến mại: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const useDiscountAdmin = async (req, res) => {
  const { discount, total, phoneNumber } = req.body;
  try {
    if (!discount || !total || !phoneNumber) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
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

    const currentDate = moment(); // Thời điểm hiện tại
    const startDate = moment(getDiscount.startDate).startOf("day"); // 00:00 của ngày bắt đầu
    const endDate = moment(getDiscount.endDate).endOf("day"); // 23:59:59 của ngày kết thúc

    if (
      currentDate.isBefore(startDate) || // Chưa đến ngày bắt đầu
      currentDate.isAfter(endDate) || // Đã qua ngày kết thúc
      startDate.isAfter(endDate) // Ngày bắt đầu > ngày kết thúc => sai logic
    ) {
      return res.json({
        status: 400,
        message: "Mã không còn hoạt động",
      });
    }

    const phoneNumberInt = parseInt(phoneNumber, 10);
    const checkOrderDiscount = await Order.findOne({
      where: {
        phoneNumber: phoneNumberInt,
        discountCode: getDiscount.promotionCode,
      },
    });
    if (checkOrderDiscount) {
      return res.json({
        status: 400,
        message: "Bạn đã sử dụng mã giảm giá này rồi",
      });
    }
    if (getDiscount.promotionType === 1) {
      if (total < getDiscount.conditionsOfApplication) {
        return res.json({
          status: 401,
          message: "Mã không áp dụng cho đơn hàng này!",
          data: getDiscount,
        });
      }
      const newTotal =
        total - getDiscount.promotionLevel > 0
          ? total - getDiscount.promotionLevel
          : 0;
      return res.json({
        status: 200,
        message: " Thành công",
        data: newTotal,
        discount: getDiscount,
        totalPromotion: getDiscount.promotionLevel,
      });
    }

    if (getDiscount.promotionType === 2) {
      if (total < getDiscount.conditionsOfApplication) {
        return res.json({
          status: 401,
          message: "Mã không áp dụng cho đơn hàng này!",
          data: getDiscount,
        });
      }
      const maxPromotion = Number(getDiscount.maximumPromotion);
      const discountAmount = (total * getDiscount.promotionLevel) / 100;
      if (discountAmount > maxPromotion) {
        const newTotal = total - maxPromotion;
        return res.json({
          status: 200,
          message: " Thành công",
          data: newTotal,
          discount: getDiscount,
          totalPromotion: maxPromotion,
        });
      }
      if (discountAmount < maxPromotion) {
        const newTotal = total - discountAmount;
        return res.json({
          status: 200,
          message: " Thành công",
          data: newTotal,
          discount: getDiscount,
          totalPromotion: discountAmount,
        });
      }
    }
  } catch (e) {
    console.log("Lỗi sử dụng mã khuyến mại tại quầy: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getDiscountsByUser = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token",
      });
    }
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account || account.status !== 1) {
      return res.json({
        status: 400,
        message: "Tài khoan không hợp lệ hoặc đã bị khóa",
      });
    }
    const usedDiscounts = await Order.findAll({
      where: {
        customerCode: account.customerCode,
        discountCode: { [Op.ne]: null },
      },
      attributes: ["discountCode"],
      raw: true,
    });

    const usedCodes = usedDiscounts.map((d) => d.discountCode);
    const unusedDiscounts = await Promotion.findAll({
      where: {
        promotionCode: {
          [Op.notIn]: usedCodes.length > 0 ? usedCodes : [''], 
        },
        status: 1,
      },
      raw: true,
    });
    return res.json({
      status: 200,
      data: unusedDiscounts,
    });
  } catch (e) {
    console.log("Lỗi lấy mã giảm giá theo user: ", e);
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
  useDiscountAdmin,
  getDiscountsByUser
};
