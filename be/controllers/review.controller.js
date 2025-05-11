const {
  Token,
  Riview,
  Account,
  Products,
  Order,
  OrderDetail,
  ProductDetails,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const createRiview = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { sart, content, productCode } = req.body;
    if (!sart || !content || !productCode) {
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

    await Riview.create({
      customerCode: account.customerCode,
      productCode,
      sart,
      content,
      status: 1,
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
    const { productCode } = req.body;
    const listRiviewByProduct = await Riview.findAll({
      where: { productCode },
    });

    if (listRiviewByProduct.length === 0) {
      return res.json({
        status: 400,
        message: "Sản phẩm không có bài đánh giá nào !",
      });
    }
  } catch (e) {
    console.log("Lỗi lấy danh sách đánh giá sản phẩm : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const checkRiview = async (req, res) => {
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
      where: { customElements: account.customElements },
    });

    if (orders.length === 0) {
      return res.json({
        status: 400,
        message: "Người dùng không có đơn hàng nào!",
      });
    }

    const orderCodes = orders.map((order) => order.orderCode);

    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: orderCodes },
    });

    if (orderDetails.length === 0) {
      return res.json({
        status: 400,
        message: "Người dùng không có bài đánh giá sản phẩm nào!",
      });
    }

    const productDetailCodes = orderDetails.map((od) => od.productDetailCode);

    const productDetails = await ProductDetails.findAll({
      where: { productDetailCode: productDetailCodes },
    });

    const idProducts = productDetails.map((pd) => pd.idProduct);

    const products = await Products.findAll({
      where: { id: idProducts },
    });

    const productCodes = products.map((p) => p.productCode);

    return res.json({
      status: 200,
      message: "Thành công",
      data: productCodes,
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
