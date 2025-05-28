const {
  Token,
  Riviews,
  Account,
  Products,
  Order,
  OrderDetail,
  ProductDetails,
  Client,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const createRiview = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { sart, content, productDetailCode, orderCode } = req.body;
    if (!sart || !content || !productDetailCode || !orderCode) {
      return res.json({
        status: 400,
        message: "Nhập đủ dữ liệu trước khi đánh giá",
      });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại",
      });
    }
    if (!account.customerCode) {
      return res.json({
        status: 400,
        message: "Tài khoản không được phép đánh giá",
      });
    }

    await Riviews.create({
      customerCode: account.customerCode,
      productDetailCode,
      sart,
      content,
      status: 1,
      orderCode,
    });
    return res.json({
      status: 200,
      message: "Đánh giá thành công !",
    });
  } catch (e) {
    console.log("Lỗi tạo mới bài đánh giá: ", e);
    res.json({
      status: 500,
      message: "Lỗi server ",
    });
  }
};
const getListRiviewByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productDetails = await ProductDetails.findAll({
      where: { idProduct: id },
      attributes: ["productDetailCode"],
    });

    const productDetailIds = productDetails.map((pd) => pd.productDetailCode);
    const listRiview = await Riviews.findAll({
      where: {
        productDetailCode: productDetailIds,
      },
    });

    if (listRiview.length === 0) {
      return res.json({
        status: 400,
        message: "Không có bài đánh giá nào cho sản phẩm này",
      });
    }
    const customerCode = [...new Set(listRiview.map((r) => r.customerCode))];
    const clients = await Client.findAll({
      where: { customerCode },
      attributes: ["customerCode", "name"],
    });
    const clientMap = {};
    clients.forEach((client) => {
      clientMap[client.customerCode] = client.name;
    });

    const enrichedRiviews = listRiview.map((r) => ({
      ...r.toJSON(),
      customerName: clientMap[r.customerCode] || null,
    }));

    return res.json({
      status: 200,
      message: "Thành công",
      data: enrichedRiviews,
    });
  } catch (e) {
    console.error("Lỗi lấy danh sách đánh giá sản phẩm: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

const checkRiview = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);

    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại",
      });
    }
    const orders = await Order.findAll({
      where: { customerCode: account.customerCode, status: "5" },
    });
    if (orders.length === 0) {
      return res.json({
        status: 400,
        message: "Người dùng không có đơn hàng nào!",
      });
    }

    const orderCodeList = orders.map((order) => order.orderCode);

    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: orderCodeList },
    });

    const productDetailCodeList = orderDetails.map(
      (detail) => detail.productDetailCode
    );
    console.log(orderCodeList);
    console.log(productDetailCodeList);
    const listRiview = await Riviews.findAll({
      where: { customerCode: account.customerCode },
    });

    const matchedRiviews = listRiview.filter(
      (review) =>
        orderCodeList.includes(review.orderCode) &&
        productDetailCodeList.includes(review.productDetailCode)
    );
    return res.json({
      status: 200,
      message: "Thành công",
      data: matchedRiviews,
    });
  } catch (e) {
    console.log("Lỗi kiểm tra xem đã đánh giá chưa: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  createRiview,
  getListRiviewByProduct,
  checkRiview,
};
