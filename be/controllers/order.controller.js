const {
  Order,
  OrderDetail,
  Cart,
  Account,
  ProductDetails,
  Promotion,
  Admin,
  OrderNote,
  Size,
  Color,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;
const { Op } = require("sequelize");

const generateUniqueCode = async (model, columnName) => {
  let code;
  let exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await model.findOne({ where: { [columnName]: code } });
  } while (exists);
  return code;
};

const createOrder = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const {
      discount,
      totalPayment,
      product,
      address,
      userName,
      phoneNumber,
      totalDefault,
      totalPromotion,
    } = req.body;
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
    let discountCode = null;
    if (discount) {
      discountCode = await Promotion.findOne({
        where: { name: discount },
      });
    }
    let orderCode = await generateUniqueCode(Order, "orderCode");
    const order = await Order.create({
      orderCode,
      userName: userName,
      phoneNumber,
      address,
      totalDefault, // giá ban đầu
      totalPromotion, // số tiền giảm
      totalPayment, // tiền thanh toán
      discountCode: discountCode?.promotionCode || "", // tên giảm giá
      paymentMethod: "COD",
      customerCode: account.customerCode,
      employeeCode: "",
      creator: userName,
      status: 1, // Đặt trạng thái ban đầu của đơn hàng
    });
    for (const item of product) {
      const existingProduct = await ProductDetails.findOne({
        where: { productDetailCode: item.productDetailCode },
      });
      if (!existingProduct || existingProduct.status === 2) {
        await order.destroy();
        return res.json({
          status: 400,
          message: "Sản phẩm không tồn tại hoặc đã dừng hoạt động",
        });
      }
      let orderDetailCode = await generateUniqueCode(
        OrderDetail,
        "orderDetailCode"
      );
      await OrderDetail.create({
        orderDetailCode,
        orderCode,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        size: item.size,
        nameProduct: item.name,
        color: item.colorName,
        productDetailCode: item.productDetailCode,
      });
      const cart = await Cart.findOne({
        where: {
          idProductDetail: item.productDetailCode,
          idCustomer: account.customerCode,
        },
      });
      await cart.destroy();
    }
    if (discount) {
      discountCode.quantity -= 1;
      await discountCode.save();
    }

    return res.json({
      status: 200,
      message: "Thành công",
    });
  } catch (e) {
    console.log("Lỗi tạo đơn hàng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const orderCartAdmin = async (req, res) => {
  try {
    const {
      discount,
      totalPayment,
      product,
      userName,
      phoneNumber,
      totalDefault,
      totalPromotion,
    } = req.body;
    if (!userName || !phoneNumber || product.length === 0) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
      });
    }
    let discountCode = null;
    if (discount) {
      discountCode = await Promotion.findOne({
        where: { name: discount },
      });
    }
    let orderCode = await generateUniqueCode(Order, "orderCode");
    const order = await Order.create({
      orderCode,
      userName: userName,
      phoneNumber,
      address: "Cửa hàng",
      totalDefault, // giá ban đầu
      totalPromotion, // số tiền giảm
      totalPayment, // tiền thanh toán
      discountCode: discountCode?.promotionCode || "", // tên giảm giá
      paymentMethod: "Trực tiếp",
      customerCode: "",
      employeeCode: "",
      creator: userName,
      status: 4, // Đã thanh toán
    });
    for (const item of product) {
      const existingProduct = await ProductDetails.findOne({
        where: { productDetailCode: item.productDetailCode },
      });
      if (!existingProduct || existingProduct.status === 2) {
        await order.destroy();
        return res.json({
          status: 400,
          message: "Sản phẩm không tồn tại hoặc đã dừng hoạt động",
        });
      }
      if (existingProduct.quantity < item.quantity) {
        await order.destroy();
        return res.json({
          status: 400,
          message: `Số lượng của sản phẩm không đủ`,
        });
      }
      existingProduct.quantity -= item.quantity;
      await existingProduct.save();

      let orderDetailCode = await generateUniqueCode(
        OrderDetail,
        "orderDetailCode"
      );
      await OrderDetail.create({
        orderDetailCode,
        orderCode,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        size: item.size,
        nameProduct: item.name,
        color: item.colorName,
        productDetailCode: item.productDetailCode,
      });
      const cart = await Cart.findOne({
        where: { idProductDetail: item.productDetailCode, idCustomer: 0 },
      });
      await cart.destroy();
    }
    if (discount) {
      discountCode.quantity -= 1;
      await discountCode.save();
    }

    return res.json({
      status: 200,
      message: "Thành công",
    });
  } catch (e) {
    console.log("Lỗi thanh toán đơn hàng tại quầy : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: { [Op.in]: [1, 2, 3] },
      },
    });
    if (orders.length === 0) {
      return res.json({
        status: 400,
        message: "Chưa có đơn hàng nào",
      });
    }
    const orderCodes = orders.map((order) => order.orderCode);

    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: { [Op.in]: orderCodes } },
    });

    const orderDetailMap = {};
    orderDetails.forEach((detail) => {
      if (!orderDetailMap[detail.orderCode]) {
        orderDetailMap[detail.orderCode] = [];
      }
      orderDetailMap[detail.orderCode].push(detail);
    });

    const data = orders.map((order) => ({
      ...order.toJSON(),
      orderDetails: orderDetailMap[order.orderCode] || [],
    }));

    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (error) {
    console.log("Lỗi lấy thông tin đơn hàng : ", error);
    return res.json({
      status: 500,
      message: "Lỗi server: ",
    });
  }
};
const verifyOrder = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { orderCode } = req.params;
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountAdmin = await Account.findOne({
      where: { id: decoded.id },
    });

    if (!accountAdmin) {
      return res.json({ status: 400, message: "Tài khoản không tồn tại" });
    }
    const admin = await Admin.findOne({
      where: { employeeCode: accountAdmin.employeeCode },
    });
    if (!admin) {
      return res.json({ status: 400, message: "Tài khoản không tồn tại" });
    }

    const order = await Order.findOne({ where: { orderCode } });
    if (!order) {
      return res.json({ status: 400, message: "Đơn hàng không tồn tại" });
    }
    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: order.orderCode },
    });

    for (const orderDetail of orderDetails) {
      try {
        const productDetail = await ProductDetails.findOne({
          where: {
            productDetailCode: orderDetail.productDetailCode,
            status: 1,
          },
        });

        if (!productDetail) {
          return res.json({ status: 400, message: "Sản phẩm không hoạt động" });
        }
        if (productDetail.quantity < orderDetail.quantity) {
          return res.json({
            status: 400,
            message: `Số lượng của sản phẩm không đủ`,
          });
        }

        productDetail.quantity -= orderDetail.quantity;
        await productDetail.save();
      } catch (error) {
        console.error("Lỗi khi xử lý sản phẩm trong đơn hàng:", error);
        return res.json({ status: 500, message: "Lỗi server nội bộ" });
      }
    }
    if (order.status === "1") {
      order.status = "2";
      order.updater = admin.name;
      await order.save();
      return res.json({
        status: 200,
        message: "Xác nhận đơn hàng thành công",
      });
    }
  } catch (e) {
    console.log("Lỗi xác nhận đơn hàng", e);
    return res.json({
      status: 500,
      message: "Lỗi hệ thống : " + e,
    });
  }
};
const deliveryOrder = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { orderCode } = req.body;
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountAdmin = await Account.findOne({
      where: { id: decoded.id },
    });
    if (!accountAdmin) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const admin = await Admin.findOne({
      where: { employeeCode: accountAdmin.employeeCode },
    });
    const order = await Order.findOne({
      where: { orderCode },
    });
    if (!order) {
      return res.json({
        status: 400,
        message: "Không tim thấy đơn hàng !",
      });
    }
    if (order.status === "2") {
      order.status = "3";
      order.updater = admin.name;
      await order.save();
      return res.json({
        status: 200,
        message: "Thành công",
      });
    } else {
      return res.json({
        status: 400,
        message: "Chỉ có đơn được xác nhận mới được vận chuyển",
      });
    }
  } catch (e) {
    console.log("Lỗi hủy hàng bên người dùng : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getAllOrderByUser = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountClient = await Account.findOne({
      where: { id: decoded.id },
    });
    if (!accountClient) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const orders = await Order.findAll({
      where: { customerCode: accountClient.customerCode },
    });
    const orderCodes = orders.map((order) => order.orderCode);
    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: { [Op.in]: orderCodes } },
    });

    const orderDetailMap = {};
    orderDetails.forEach((detail) => {
      if (!orderDetailMap[detail.orderCode]) {
        orderDetailMap[detail.orderCode] = [];
      }
      orderDetailMap[detail.orderCode].push(detail);
    });

    const data = orders.map((order) => ({
      ...order.toJSON(),
      orderDetails: orderDetailMap[order.orderCode] || [],
    }));
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy thông tin đơn hàng cho người dùng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server:",
    });
  }
};
const searchOrderByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const orders = await Order.findAll({
      where: {
        phoneNumber,
      },
    });
    if (orders.length === 0) {
      return res.json({
        status: 400,
        message: "Không tìm thấy đơn hàng",
      });
    }
    const orderCodes = orders.map((order) => order.orderCode);

    const orderDetails = await OrderDetail.findAll({
      where: { orderCode: { [Op.in]: orderCodes } },
    });

    const orderDetailMap = {};
    orderDetails.forEach((detail) => {
      if (!orderDetailMap[detail.orderCode]) {
        orderDetailMap[detail.orderCode] = [];
      }
      orderDetailMap[detail.orderCode].push(detail);
    });

    const data = orders.map((order) => ({
      ...order.toJSON(),
      orderDetails: orderDetailMap[order.orderCode] || [],
    }));
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi tìm kiếm đơn hàng theo số điện thoại: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const cancelOrderUser = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { orderCode } = req.body;
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountClient = await Account.findOne({
      where: { id: decoded.id },
    });
    if (!accountClient) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const order = await Order.findOne({
      where: { orderCode, customerCode: accountClient.customerCode },
    });
    if (!order) {
      return res.json({
        status: 400,
        message: "Không tim thấy đơn hàng !",
      });
    }
    if (order.status === "1") {
      order.status = "7";
      await order.save();
      return res.json({
        status: 200,
        message: "Thành công",
      });
    }
    if (order.status === "2") {
      order.status = "7";
      await order.save();
      const orderDetail = await OrderDetail.findAll({ where: { orderCode } });
      for (const detail of orderDetail) {
        const size = await Size.findOne({ where: { name: detail.size } });
        const color = await Color.findOne({ where: { name: detail.color } });
        const productDetail = await ProductDetails.findOne({
          where: {
            productId: detail.productDetailCode,
            idSize: size.sizeCode,
            idColor: color.colorCode,
          },
        });

        if (productDetail) {
          productDetail.quantity += detail.quantity;
          await productDetail.save();
        }
      }
      return res.json({
        status: 200,
        message: "Hủy đơn hàng thành công",
      });
    }
  } catch (e) {
    console.log("Lỗi hủy hàng bên người dùng : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const cancelOrderAdmin = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { orderCode, title, content } = req.body;
    if (!orderCode || !title || !content) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
      });
    }
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountAdmin = await Account.findOne({
      where: { id: decoded.id },
    });
    if (!accountAdmin) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const admin = await Admin.findOne({
      where: { employeeCode: accountAdmin.employeeCode },
    });

    const order = await Order.findOne({
      where: { orderCode },
    });
    if (!order) {
      return res.json({
        status: 400,
        message: "Không tim thấy đơn hàng !",
      });
    }
    if (order.status === "1") {
      order.status = "6";
      await order.save();
      await OrderNote.create({
        orderCode: orderCode,
        title: title,
        content: content,
        image: "",
        status: 1,
        creator: admin.name,
      });
      return res.json({
        status: 200,
        message: "Thành công",
      });
    }
    if (order.status === "2") {
      order.status = "6";
      await order.save();
      await OrderNote.create({
        orderCode: orderCode,
        title: title,
        content: content,
        image: "",
        status: 1,
        creator: admin.name,
      });
      const orderDetail = await OrderDetail.findAll({ where: { orderCode } });
      for (const detail of orderDetail) {
        const size = await Size.findOne({ where: { name: detail.size } });
        const color = await Color.findOne({ where: { name: detail.color } });
        const productDetail = await ProductDetails.findOne({
          where: {
            productId: detail.productDetailCode,
            idSize: size.sizeCode,
            idColor: color.colorCode,
          },
        });

        if (productDetail) {
          productDetail.quantity += detail.quantity;
          await productDetail.save();
        }
      }
      return res.json({
        status: 200,
        message: "Hủy đơn hàng thành công",
      });
    }
  } catch (e) {
    console.log("Lỗi hủy hàng bên người admin : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const confirmOrderAdmin = async (req, res) => {
  console.log("confirmOrderAdmin");
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    let imagePath;
    if (req.file) imagePath = req.file.path;
    const { orderCode, title, content } = req.body;
    if (!orderCode || !title || !content) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
      });
    }
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountAdmin = await Account.findOne({
      where: { id: decoded.id },
    });
    if (!accountAdmin) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const admin = await Admin.findOne({
      where: { employeeCode: accountAdmin.employeeCode },
    });

    const order = await Order.findOne({
      where: { orderCode },
    });
    if (!order) {
      return res.json({
        status: 400,
        message: "Không tim thấy đơn hàng !",
      });
    }
    if (order.status === "3") {
      // trạng thái vận chuyển

      (order.status = "5"), await order.save(); // trạng thái nhận hàng
      await OrderNote.create({
        orderCode: orderCode,
        title: title,
        content: content,
        image: imagePath,
        status: 1,
        creator: admin.name,
      });
      return res.json({
        status: 200,
        message: "Xác nhận thành công!",
      });
    }
  } catch (e) {
    console.log("Lỗi xác nhận đơn hàng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getOrderNote = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const orderNote = await OrderNote.findOne({ where: { orderCode } });
    return res.json({
      status: 200,
      message: "Thành công !",
      data: orderNote,
    });
  } catch (e) {
    console.log("Lỗi lấy ghi chú đơn hàng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  verifyOrder,
  getAllOrderByUser,
  searchOrderByPhoneNumber,
  orderCartAdmin,
  cancelOrderUser,
  deliveryOrder,
  cancelOrderAdmin,
  confirmOrderAdmin,
  getOrderNote,
};
