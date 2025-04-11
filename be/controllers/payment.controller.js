const moment = require("moment");
const {
  OrderDetail,
  ProductDetails,
  Order,
  Account,
  Promotion,
  Client,
  Cart,
} = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateUniqueCode = async (model, columnName) => {
  let code;
  let exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await model.findOne({ where: { [columnName]: code } });
  } while (exists);
  return code;
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createOrderPayment = async (req, res) => {
  signPrivate = process.env.SIGN_PRIVATE;
  try {
    const {
      discount,
      product,
      address,
      totalPayment,
      totalDefault,
      totalPromotion,
    } = req.body;
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        status: 400,
        message: "Thiếu token thông qua headers",
      });
    }
    const pathToken = token.split(" ")[1];
    const decoded = jwt.verify(pathToken, signPrivate);
    const accountUser = await Account.findOne({ where: { id: decoded.id } });
    const infoUser = await Client.findOne({
      where: { customerCode: accountUser.customerCode },
    });
    if (!accountUser) {
      return res.json({ status: 400, message: "Người dùng không tồn tại" });
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
      userName: infoUser.name,
      phoneNumber: infoUser.phoneNumber,
      address,
      totalDefault, // giá ban đầu
      totalPromotion, // số tiền giảm
      totalPayment, // tiền thanh toán
      discountCode: discountCode?.promotionCode || "", // tên giảm giá
      paymentMethod: "Thanh toán online",
      customerCode: infoUser.customerCode,
      employeeCode: "",
      creator: infoUser.name,
      status: 0, // đặt hàng nhưng chưa thanh toán
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
          idCustomer: infoUser.customerCode,
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
      data: order,
    });
  } catch (e) {
    return res.json({
      status: 500,
      message: "Lỗi server: " + e,
    });
  }
};
const createPayment = async (req, res) => {
  // truyền 3 tham số orderId, amount, bankCode
  process.env.TZ = "Asia/Ha_Noi";
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = process.env.VNP_TMNCODE;
  let secretKey = process.env.VNP_HASHSECERT;
  let vnpUrl = process.env.VNP_URL;
  let returnUrl = process.env.VNP_RETURNURL; // http://localhost:3001/thanks
  let orderId = +req.body.orderId;
  let amount = req.body.amount;
  let bankCode = req.body.bankCode; // truyền bankCode rỗng
  const order = await Order.findOne({ where: { orderCode: orderId } });

  if (!order) {
    return res.json({
      status: 400,
      message: "Đơn hàng không tồn tại",
    });
  }
  if (order.paymentMethod != "Thanh toán online") {
    return res.json({
      status: 400,
      message: "Đơn hàng không trong trạng thái thanh toán online",
    });
  }

  let locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};

  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toán cho mã GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }
  vnp_Params = sortObject(vnp_Params);
  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  return res.status(200).json({ status: 200, data: vnpUrl });
};

const configPayment = async (req, res) => {
  try {
    let vnp_Params = req.query; // truyền theo query (http://localhost:3001/payment/configPayment/?query)
    let secureHash = vnp_Params["vnp_SecureHash"];
    let secretKey = process.env.VNP_HASHSECERT;
    delete vnp_Params["vnp_SecureHash"];
    vnp_Params = sortObject(vnp_Params);
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      const order = await Order.findOne({ where: { orderCode: orderId } });
      if (rspCode === "00") {
        order.status = 1; // đặt hàng thành công
        await order.save();
        return res.json({
          status: 200,
          message: "Success",
          redirectUrl: "http://localhost:3000/Home",
        });
      } else {
        order.status = 8; // đơn hàng bị lỗi
        await order.save();
        return res.json({
          status: 400,
          message: "Thất bại",
          redirectUrl: "http://localhost:3000/Home",
        });
      }
    } else {
      res.json({
        status: 400,
        Message: "Lỗi",
      });
    }
  } catch (e) {
    return res.json({
      status: 500,
      message: "Lỗi server: " + e,
    });
  }
};
module.exports = {
  createOrderPayment,
  createPayment,
  configPayment,
};
