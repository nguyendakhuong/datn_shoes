const {
  Client,
  Admin,
  Products,
  ProductDetails,
  Order,
  OrderDetail,
  sequelize,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;
const { Op } = require("sequelize");

const getInfoStatistical = async (req, res) => {
  try {
    const totalUsers = await Client.count();
    const activeProducts = await Products.count({
      where: { status: 1 },
    });
    const totalRevenue = await Order.sum("totalPayment", {
      where: { status: [4, 5] },
    });
    const completedOrderIds = await Order.findAll({
      attributes: ["orderCode"],
      where: { status: { [Op.in]: [4, 5] } },
      raw: true,
    });
    const orderIds = completedOrderIds.map((order) => order.orderCode);
    let totalProductsSold = 0;
    if (orderIds.length > 0) {
      totalProductsSold = await OrderDetail.sum("quantity", {
        where: { orderCode: { [Op.in]: orderIds } },
      });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.sum("totalPayment", {
      where: {
        status: [4, 5],
        createdAt: {
          [Op.between]: [
            new Date(`${currentYear}-${currentMonth}-01`),
            new Date(`${currentYear}-${currentMonth + 1}-01`),
          ],
        },
      },
    });
    return res.json({
      status: 200,
      data: {
        totalUsers,
        activeProducts,
        totalRevenue: totalRevenue || 0,
        totalProductsSold: totalProductsSold || 0,
        monthlyRevenue: monthlyRevenue || 0,
      },
    });
  } catch (e) {
    console.log("Lỗi lấy thông tin thống kê : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const ordersByPaymentMethod = async (req, res) => {
  try {
    const ordersByPaymentMethod = await Order.findAll({
      attributes: [
        ["paymentMethod", "name"],
        [sequelize.fn("COUNT", sequelize.col("orderCode")), "value"], // Sử dụng alias đúng
      ],
      where: { status: { [Op.in]: [4, 5] } },
      group: ["paymentMethod"],
      raw: true,
    });
    return res.json({
      status: 200,
      data: {
        ordersByPaymentMethod,
      },
    });
  } catch (e) {
    console.log("Lỗi lấy hình thức thanh toán: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const productSales = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ["orderCode"],
      where: { status: [4, 5] },
      raw: true,
    });
    if (orders.length === 0) {
      return res.json({ status: 200, data: [] });
    }
    const orderCodes = orders.map((o) => o.orderCode);
    const productSalesData = await OrderDetail.findAll({
      attributes: [
        "productDetailCode",
        [sequelize.fn("SUM", sequelize.col("quantity")), "sales"],
      ],
      where: { orderCode: { [Op.in]: orderCodes } },
      group: ["productDetailCode"],
      order: [[sequelize.literal("sales"), "DESC"]],
      limit: 10,
      raw: true,
    });
    if (productSalesData.length === 0) {
      return res.json({ status: 200, data: [] });
    }
    const productDetailCodes = productSalesData.map(
      (item) => item.productDetailCode
    );
    const productDetails = await ProductDetails.findAll({
      attributes: ["productDetailCode", "idProduct"],
      where: { productDetailCode: { [Op.in]: productDetailCodes } },
      raw: true,
    });
    if (productDetails.length === 0) {
      return res.json({ status: 200, data: [] });
    }
    const productDetailMap = {};
    productDetails.forEach((item) => {
      productDetailMap[item.productDetailCode] = item.idProduct;
    });
    const productCodes = productDetails.map((item) => item.idProduct);
    const products = await Products.findAll({
      attributes: ["productCode", "name"],
      where: { productCode: { [Op.in]: productCodes } },
      raw: true,
    });
    if (products.length === 0) {
      return res.json({ status: 200, data: [] });
    }
    const productMap = {};
    products.forEach((p) => {
      productMap[p.productCode] = p.name;
    });
    const tempProducts = productSalesData.map((item) => {
      const productId = productDetailMap[item.productDetailCode];
      const productName = productMap[productId];
      return {
        name: productName || "Không xác định",
        sales: Number(item.sales),
      };
    });
    const groupedProducts = tempProducts.reduce((acc, item) => {
      if (acc[item.name]) {
        acc[item.name].sales += item.sales;
      } else {
        acc[item.name] = { name: item.name, sales: item.sales };
      }
      return acc;
    }, {});
    const bestSellingProducts = Object.values(groupedProducts).sort(
      (a, b) => b.sales - a.sales
    );
    return res.json({
      status: 200,
      data: bestSellingProducts,
    });
  } catch (e) {
    console.log("Lỗi lấy sản phẩm bán chạy nhất: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const productSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body; // Nhận ngày từ request
    if (!startDate || !endDate) {
      return res.json({
        status: 400,
        message: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc",
      });
    }

    // Lấy danh sách orderCode của các đơn hoàn thành trong khoảng thời gian
    const orders = await Order.findAll({
      attributes: ["orderCode"],
      where: {
        status: [4, 5],
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)], // Lọc theo khoảng thời gian
        },
      },
      raw: true,
    });

    if (orders.length === 0) {
      return res.json({ status: 200, data: [] });
    }

    const orderCodes = orders.map((o) => o.orderCode);

    // Bước 1: Lấy tổng số lượng bán của từng sản phẩm từ OrderDetail
    const productSalesData = await OrderDetail.findAll({
      attributes: [
        "productDetailCode",
        [sequelize.fn("SUM", sequelize.col("quantity")), "sales"],
      ],
      where: { orderCode: { [Op.in]: orderCodes } },
      group: ["productDetailCode"],
      order: [[sequelize.literal("sales"), "DESC"]],
      limit: 10,
      raw: true,
    });

    if (productSalesData.length === 0) {
      return res.json({ status: 200, data: [] });
    }

    const productDetailCodes = productSalesData.map(
      (item) => item.productDetailCode
    );

    // Bước 2: Lấy idProduct từ bảng ProductDetails
    const productDetails = await ProductDetails.findAll({
      attributes: ["productDetailCode", "idProduct"],
      where: { productDetailCode: { [Op.in]: productDetailCodes } },
      raw: true,
    });

    if (productDetails.length === 0) {
      return res.json({ status: 200, data: [] });
    }

    // Tạo ánh xạ từ productDetailCode -> idProduct
    const productDetailMap = {};
    productDetails.forEach((item) => {
      productDetailMap[item.productDetailCode] = item.idProduct;
    });

    const productCodes = productDetails.map((item) => item.idProduct);

    // Bước 3: Lấy tên sản phẩm từ bảng Products
    const products = await Products.findAll({
      attributes: ["productCode", "name"],
      where: { productCode: { [Op.in]: productCodes } },
      raw: true,
    });

    if (products.length === 0) {
      return res.json({ status: 200, data: [] });
    }

    // Tạo ánh xạ từ productCode -> name
    const productMap = {};
    products.forEach((p) => {
      productMap[p.productCode] = p.name;
    });

    // Bước 4: Ghép dữ liệu từ OrderDetail với Products
    const bestSellingProducts = productSalesData.map((item) => {
      const productId = productDetailMap[item.productDetailCode]; // Lấy idProduct từ productDetailCode
      const productName = productMap[productId]; // Lấy tên sản phẩm từ productCode

      return {
        name: productName || "Không xác định",
        sales: item.sales,
      };
    });

    return res.json({
      status: 200,
      data: bestSellingProducts,
    });
  } catch (e) {
    console.log("Lỗi lấy sản phẩm bán chạy theo ngày: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getInfoStatistical,
  ordersByPaymentMethod,
  productSales,
  productSalesByDate,
};
