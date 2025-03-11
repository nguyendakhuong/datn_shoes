const {
  Account,
  Cart,
  ProductDetails,
  Products,
  Origin,
  Trademark,
  Size,
  Color,
} = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

const getCartByUser = async (req, res) => {
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
    const cartItems = await Cart.findAll({
      where: { idCustomer: account.customerCode },
    });
    const filteredCartItems = cartItems.filter(
      (item) => item.idProductDetail !== 0
    );
    if (filteredCartItems.length === 0) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm nào",
      });
    }
    const productDetailIds = filteredCartItems.map(
      (item) => item.idProductDetail
    );

    const productDetails = await ProductDetails.findAll({
      where: { productDetailCode: productDetailIds },
    });

    const productIds = productDetails.map((item) => item.idProduct);

    const products = await Products.findAll({
      where: { productCode: productIds },
    });

    const result = await Promise.all(
      filteredCartItems.map(async (cartItem) => {
        const productDetail = productDetails.find(
          (pd) => pd.productDetailCode === cartItem.idProductDetail
        );
        if (!productDetail) return null;
        const product = products.find(
          (p) => p.productCode === productDetail.idProduct
        );
        const origin = product?.idOrigin
          ? await Origin.findOne({ where: { originCode: product.idOrigin } })
          : null;

        const trademark = product?.idTrademark
          ? await Trademark.findOne({
              where: { brandCode: product.idTrademark },
            })
          : null;
        const size = productDetail.idSize
          ? await Size.findOne({
              where: { SizeCode: productDetail.idSize },
            })
          : null;
        const color = productDetail.idColor
          ? await Color.findOne({
              where: { colorCode: productDetail.idColor },
            })
          : null;
        return {
          idProductDetail: cartItem.idProductDetail,
          quantity: productDetail.quantity,
          price: productDetail.price,
          color: color.colorCode,
          colorName: color.name,
          size: size.name,
          image: productDetail.idImage,
          productDetailCode: productDetail.productDetailCode,
          productName: product?.name || null,
          trademark: trademark?.name || null,
          origin: origin?.name || null,
        };
      })
    );

    return res.json({
      status: 200,
      message: "Thành công",
      data: result,
    });
  } catch (e) {
    console.log("Lỗi lấy giỏ hàng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

const productToCart = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id sản phẩm",
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
    if (!account.customerCode) {
      return res.json({
        status: 400,
        message: "Tài khoản của bạn không được mua hàng!",
      });
    }
    const cartItems = await Cart.findAll({
      where: { idCustomer: account.customerCode },
    });
    const idParseInt = parseInt(id, 10);
    const isProductInCart = cartItems.some(
      (item) => item.idProductDetail === idParseInt
    );

    if (isProductInCart) {
      return res
        .status(400)
        .json({ message: "Sản phẩm đã có trong giỏ hàng!" });
    }
    let cartCode;
    cartCode = await generateUniqueCode(Cart, "cartCode");

    await Cart.create({
      cartCode,
      idCustomer: account.customerCode,
      idProductDetail: idParseInt,
    });
    return res.json({
      status: 200,
      message: "Thêm vào giỏ hàng thành công",
    });
  } catch (e) {
    console.log("Lỗi thêm vào giỏ hàng: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const deleteItemCart = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const id = req.body;
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id sản phẩm",
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
    for (const productDetailsCode of id) {
      const cartItem = await Cart.findOne({
        where: {
          idCustomer: account.customerCode,
          idProductDetail: productDetailsCode,
        },
      });
      if (cartItem) {
        await cartItem.destroy();
      }
    }
    return res.json({
      status: 200,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
    });
  } catch (e) {
    console.log("Lỗi xóa item cart: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  productToCart,
  getCartByUser,
  deleteItemCart,
};
