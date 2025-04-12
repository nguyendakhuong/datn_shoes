const {
  Account,
  Products,
  ProductDetails,
  Color,
  Size,
  Material,
  Trademark,
  Origin,
} = require("../models");
const { Op, where, ValidationErrorItemOrigin } = require("sequelize");
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
const product = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { name, description, trademark, origin, material } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại",
      });
    }
    const checkNameProduct = await Products.findOne({ where: { name } });
    if (
      checkNameProduct &&
      (checkNameProduct.status === 1 || checkNameProduct.status === 2)
    ) {
      return res.json({ status: 400, message: "Sản phẩm đã tồn tại" });
    }

    let productCode = await generateUniqueCode(Products, "productCode");
    await Products.create({
      productCode,
      name,
      description,
      status: 2,
      creator: account.name,
      updater: "",
      idMaterial: material.value,
      idTrademark: trademark.value,
      idOrigin: origin.value,
    });

    res.json({
      status: 200,
      message: "Thêm sản phẩm thành công !",
    });
  } catch (error) {
    console.log("Lỗi thêm sản phẩm: ", error);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getProducts = async (req, res) => {
  try {
    const listProducts = await Products.findAll({
      where: {
        status: { [Op.not]: 3 },
      },
    });

    const originIds = [...new Set(listProducts.map((item) => item.idOrigin))];
    const trademarkIds = [
      ...new Set(listProducts.map((item) => item.idTrademark)),
    ];
    const materialIs = [
      ...new Set(listProducts.map((item) => item.idMaterial)),
    ];

    const originList = await Origin.findAll({
      where: { originCode: originIds },
      attributes: ["originCode", "name"],
      raw: true,
    });
    const trademarkList = await Trademark.findAll({
      where: { brandCode: trademarkIds },
      attributes: ["brandCode", "name"],
      raw: true,
    });
    const materialList = await Material.findAll({
      where: { materialCode: materialIs },
      attributes: ["materialCode", "name"],
      raw: true,
    });
    const originMap = originList.reduce((acc, item) => {
      acc[item.originCode] = item.name;
      return acc;
    }, {});

    const trademarkMap = trademarkList.reduce((acc, item) => {
      acc[item.brandCode] = item.name;
      return acc;
    }, {});

    const materialMap = materialList.reduce((acc, item) => {
      acc[item.materialCode] = item.name;
      return acc;
    }, {});

    const data = listProducts.map((product) => ({
      ...product,
      origin: originMap[product.idOrigin] || null,
      trademark: trademarkMap[product.idTrademark] || null,
      material: materialMap[product.idMaterial] || null,
    }));

    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (error) {
    console.log("Lỗi getProducts: ", error);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const statusProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findOne({ where: { id } });
    if (!product) {
      return res.json({
        status: 400,
        message: "Sản phẩm không tồn tại",
      });
    }
    if (product.status === 1) {
      product.status = 2;
      await product.save();

      return res.json({
        status: 200,
        message: "Khóa sản phẩm thành công",
      });
    }
    if (product.status === 2) {
      product.status = 1;
      await product.save();

      return res.json({
        status: 200,
        message: "Mở khóa sản phẩm thành công",
      });
    }
  } catch (e) {
    console.log("Lỗi thay đổi trạng thái sản phẩm: ", e);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findOne({ where: { id } });
    if (!product) {
      return res.json({
        status: 400,
        message: "Sản phẩm không tồn tại",
      });
    }
    product.status = 3;
    await product.save();

    return res.json({
      status: 200,
      message: "Xóa sản phẩm thành công",
    });
  } catch (e) {
    console.log("Lỗi xóa sản phẩm: ", e);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const createProductDetail = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const { color, colorCode, price, quantity, size } = req.body;
    let imagePath;
    if (req.file) imagePath = req.file.path;
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại",
      });
    }

    const product = await Products.findOne({
      where: { productCode: id },
      raw: true,
    });

    if (!product) {
      return res.json({ status: 404, message: "Không tìm thấy sản phẩm" });
    }
    const checkSize = await Size.findOne({ where: { name: size } });
    if (!checkSize) {
      let sizeCode;
      sizeCode = await generateUniqueCode(Size, "sizeCode");
      await Size.create({
        sizeCode,
        name: size,
        status: 1,
        creator: account.name,
        updater: "",
      });
    } else {
      sizeCode = checkSize.sizeCode;
    }
    const checkProductDetail = await ProductDetails.findOne({
      where: { idColor: colorCode, idSize: sizeCode, idProduct: id },
    });
    if (checkProductDetail && price === checkProductDetail.price) {
      checkProductDetail.quantity =
        parseInt(checkProductDetail.quantity) + parseInt(quantity);
      checkProductDetail.idImage = imagePath;
      await checkProductDetail.save();
      return res.json({
        status: 200,
        message:
          "Thêm số lượng vào sản phẩm mã " +
          checkProductDetail.productDetailCode +
          " thành công !",
      });
    }

    if (checkProductDetail) {
      return res.json({
        status: 400,
        message: "Sản phẩm đã tồn tại (Cùng màu và size)",
      });
    } else {
      const checkColor = await Color.findOne({ where: { name: color } });
      if (checkColor && checkColor.colorCode !== colorCode) {
        checkColor.colorCode = colorCode;
        await checkColor.save();
      }

      await ProductDetails.update(
        { idImage: imagePath },
        {
          where: { idColor: colorCode, idProduct: id },
        }
      );

      let productDetailCode;
      productDetailCode = await generateUniqueCode(
        ProductDetails,
        "productDetailCode"
      );
      await ProductDetails.create({
        productDetailCode,
        quantity,
        price,
        status: 1,
        idProduct: id,
        idColor: colorCode,
        idSize: sizeCode,
        idImage: imagePath,
      });
    }
    return res.json({
      status: 200,
      message: "thành công",
    });
  } catch (e) {
    console.log("Lỗi lấy sản phẩm chi tiết: ", e);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findOne({
      where: { id },
      attributes: [
        "productCode",
        "name",
        "description",
        "creator",
        "idMaterial",
        "idTrademark",
        "idOrigin",
      ],
      raw: true,
    });

    const material = await Material.findOne({
      where: { materialCode: product.idMaterial },
      attributes: ["name"],
      raw: true,
    });
    const trademark = await Trademark.findOne({
      where: { brandCode: product.idTrademark },
      attributes: ["name"],
      raw: true,
    });

    const origin = await Origin.findOne({
      where: { originCode: product.idOrigin },
      attributes: ["name"],
      raw: true,
    });

    const data = {
      code: product.productCode,
      id: product.id,
      productName: product.name,
      description: product.description,
      creator: product.creator,
      updater: product.updater,
      materialName: material ? material.name : null,
      trademarkName: trademark ? trademark.name : null,
      originName: origin ? origin.name : null,
    };

    res.json({
      status: 200,
      message: "thành công",
      data: data,
    });
  } catch (e) {
    console.log("Lỗi lấy sản phẩm chi tiết: ", e);
    res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateProduct = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { code, productName, trademark, origin, material, description } =
      req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const product = await Products.findOne({
      where: { productCode: code },
    });
    if (!product) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm",
      });
    }
    product.idMaterial = material.value;
    product.idTrademark = trademark.value;
    product.idOrigin = origin.value;
    product.updater = account.name;
    product.description = description;
    product.name = productName;
    await product.save();

    return res.json({
      status: 200,
      message: "Cập nhật thành công!",
    });
  } catch (e) {
    console.log("Lỗi cập nhật sản phẩm: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const updateProductDetail = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const {
      productCode,
      code,
      quantity,
      size,
      color,
      colorCode,
      price,
      imageUrl,
    } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      return res.json({
        status: 400,
        message: "Tài khoản không tồn tại",
      });
    }
    let imagePath = imageUrl;
    if (req.file) imagePath = req.file.path;

    if (!code || !quantity || !size || !colorCode || !price) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu",
      });
    }
    if (!imagePath) {
      return res.json({
        status: 400,
        message: "Thiếu ảnh",
      });
    }
    let sizeCode;
    const getSize = await Size.findOne({ where: { name: size } });
    if (!getSize) {
      sizeCode = await generateUniqueCode(Size, "sizeCode");
      await Size.create({
        sizeCode,
        name: size,
        status: 1,
        creator: account.name,
        updater: "",
      });
    } else {
      sizeCode = getSize.sizeCode;
    }
    const getColor = await Color.findOne({ where: { name: color } });
    if (getColor) {
      getColor.colorCode = colorCode;
      await getColor.save();
    }
    const productDetailBySizeAndColor = await ProductDetails.findOne({
      where: {
        idProduct: productCode,
        idColor: colorCode,
        idSize: sizeCode,
        productDetailCode: { [Op.ne]: code },
      },
    });
    if (productDetailBySizeAndColor) {
      return res.json({
        status: 400,
        message: "Sản phẩm đã tồn tại( Cùng màu và size )",
      });
    }
    const productDetail = await ProductDetails.findOne({
      where: { productDetailCode: code },
    });
    if (!productDetail) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm chi tiết",
      });
    }
    await ProductDetails.update(
      { idImage: imagePath },
      {
        where: { idColor: colorCode, idProduct: productCode },
      }
    );
    productDetail.quantity = quantity;
    productDetail.price = price;
    productDetail.idColor = colorCode;
    productDetail.idSize = sizeCode;
    await productDetail.save();
    return res.json({
      status: 200,
      message: "Thành công",
    });
  } catch (e) {
    console.log("Lỗi cập nhật sản phẩm chi tiết : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server: ",
    });
  }
};
const statusProductDetail = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.json({
        status: 400,
        message: "Thiếu mã sản phẩm chi tiét",
      });
    }
    const productDetail = await ProductDetails.findOne({
      where: { productDetailCode: code },
    });
    if (!productDetail) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm",
      });
    }
    if (productDetail.status === 1) {
      productDetail.status = 2;
      await productDetail.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
    if (productDetail.status === 2) {
      productDetail.status = 1;
      await productDetail.save();
      return res.json({
        status: 200,
        message: "Cập nhật thành công!",
      });
    }
  } catch (e) {
    console.log("Lỗi cập nhật trạng thái sản phẩm chi tiết: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server:",
    });
  }
};
const getTenProductUser = async (req, res) => {
  try {
    const products = await Products.findAll({
      attributes: ["productCode", "name", "idTrademark"],
      order: [["createdAt", "DESC"]],
      limit: 10,
      where: { status: 1 },
    });

    if (products.length === 0) {
      return res.json({
        status: 400,
        message: "Không có sản phẩm hoạt động",
      });
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const productDetails = await ProductDetails.findAll({
          where: { idProduct: product.productCode, status: 1 },
          attributes: ["idImage", "price", "idColor", "idProduct"],
        });

        if (productDetails.length === 0) return null;

        const trademark = await Trademark.findOne({
          where: { brandCode: product.idTrademark },
        });

        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set(productDetails.map((detail) => detail.idColor));

        return {
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark: trademark ? trademark.name : null,
          idImage,
          price,
          color: Array.from(allColors),
        };
      })
    );
    const filteredData = data.filter((item) => item !== null);

    if (filteredData.length === 0) {
      return res.json({
        status: 400,
        message: "Không có sản phẩm hoạt động",
      });
    }

    return res.json({
      status: 200,
      message: "Lấy sản phẩm thành công",
      data: filteredData,
    });
  } catch (error) {
    console.log("Lỗi lấy sản phẩm người dùng: ", error);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id",
      });
    }
    const product = await Products.findOne({ where: { productCode: id } });
    if (!product) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm! ",
      });
    }
    const material = await Material.findOne({
      where: { materialCode: product.idMaterial },
    });
    const trademark = await Trademark.findOne({
      where: { brandCode: product.idTrademark },
    });
    const origin = await Origin.findOne({
      where: { originCode: product.idOrigin },
    });
    const productDetails = await ProductDetails.findAll({
      where: { idProduct: product.productCode },
      utes: [
        "id",
        "productDetailCode",
        "idImage",
        "price",
        "quantity",
        "color",
        "idSize",
        "status",
      ],
    });

    const sizeIds = [...new Set(productDetails.map((detail) => detail.idSize))];
    const colorIds = [
      ...new Set(productDetails.map((detail) => detail.idColor)),
    ];

    const sizes = await Size.findAll({
      where: { sizeCode: sizeIds },
      attributes: ["sizeCode", "name"],
    });
    const colors = await Color.findAll({
      where: { colorCode: colorIds },
      attributes: ["colorCode", "name"],
    });

    const sizeMap = sizes.reduce((acc, size) => {
      acc[size.sizeCode] = size.name;
      return acc;
    }, {});
    const colorMap = colors.reduce((acc, color) => {
      acc[color.colorCode] = color.name;
      return acc;
    }, {});
    const productDetail = productDetails.map((detail) => {
      return {
        id: detail.id,
        productDetailCode: detail.productDetailCode,
        idImage: detail.idImage,
        price: detail.price,
        quantity: detail.quantity,
        color: detail.idColor,
        status: detail.status,
        size: sizeMap[detail.idSize] || null,
        colorName: colorMap[detail.idColor] || null,
      };
    });

    const data = {
      code: product.productCode,
      name: product.name,
      description: product.description,
      material: material.name,
      trademark: trademark.name,
      origin: origin.name,
      status: product.status,
      productDetail: productDetail,
    };
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy thông tin sản phẩm theo id: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server ",
    });
  }
};
const getProductByIdForUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({
        status: 400,
        message: "Thiếu id",
      });
    }
    const product = await Products.findOne({ where: { productCode: id } });
    if (!product) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm! ",
      });
    }
    const material = await Material.findOne({
      where: { materialCode: product.idMaterial },
    });
    const trademark = await Trademark.findOne({
      where: { brandCode: product.idTrademark },
    });
    const origin = await Origin.findOne({
      where: { originCode: product.idOrigin },
    });
    const productDetails = await ProductDetails.findAll({
      where: { idProduct: product.productCode, status: 1 },
      utes: [
        "id",
        "productDetailCode",
        "idImage",
        "price",
        "quantity",
        "color",
        "idSize",
        "status",
      ],
    });

    const sizeIds = [...new Set(productDetails.map((detail) => detail.idSize))];
    const colorIds = [
      ...new Set(productDetails.map((detail) => detail.idColor)),
    ];

    const sizes = await Size.findAll({
      where: { sizeCode: sizeIds },
      attributes: ["sizeCode", "name"],
    });
    const colors = await Color.findAll({
      where: { colorCode: colorIds },
      attributes: ["colorCode", "name"],
    });

    const sizeMap = sizes.reduce((acc, size) => {
      acc[size.sizeCode] = size.name;
      return acc;
    }, {});
    const colorMap = colors.reduce((acc, color) => {
      acc[color.colorCode] = color.name;
      return acc;
    }, {});

    const productDetail = productDetails.map((detail) => {
      return {
        id: detail.id,
        productDetailCode: detail.productDetailCode,
        idImage: detail.idImage,
        price: detail.price,
        quantity: detail.quantity,
        color: detail.idColor,
        status: detail.status,
        size: sizeMap[detail.idSize] || null,
        colorName: colorMap[detail.idColor] || null,
      };
    });

    const data = {
      code: product.productCode,
      name: product.name,
      description: product.description,
      material: material.name,
      trademark: trademark.name,
      origin: origin.name,
      status: product.status,
      productDetail: productDetail,
    };
    return res.json({
      status: 200,
      message: "Thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy thông tin sản phẩm theo id user  : ", e);
    return res.json({
      status: 500,
      message: "Lỗi server ",
    });
  }
};
const getProductByTrademark = async (req, res) => {
  try {
    const { trademark } = req.body;

    if (!trademark) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu thương hiệu",
      });
    }
    const getTrademark = await Trademark.findOne({
      where: { name: trademark },
    });
    if (!getTrademark) {
      return res.json({
        status: 400,
        message: "Không tìm thấy thương hiệu",
      });
    }
    const products = await Products.findAll({
      where: { idTrademark: getTrademark.brandCode, status: 1 },
      attributes: ["productCode", "name"],
      order: [["createdAt", "DESC"]],
    });

    if (products.length === 0) {
      return res.json({
        status: 400,
        message: "Không thấy sản phẩm có thương hiệu này",
      });
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const productDetails = await ProductDetails.findAll({
          where: { idProduct: product.productCode, status: 1 },
          attributes: ["idImage", "price", "idColor", "idProduct"],
        });
        if (productDetails.length === 0) return null;
        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set(productDetails.map((detail) => detail.idColor));

        return {
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark,
          idImage,
          price,
          color: Array.from(allColors),
        };
      })
    );
    const filteredData = data.filter((item) => item !== null);

    return res.json({
      status: 200,
      message: "Thành công",
      data: filteredData,
    });
  } catch (e) {
    console.log("Lỗi lấy sản phẩm theo thương hiệu: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};
const getAllProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      attributes: ["productCode", "name", "idTrademark"],
      where: { status: 1 },
    });
    const data = await Promise.all(
      products.map(async (product) => {
        const productDetails = await ProductDetails.findAll({
          where: { idProduct: product.productCode, status: 1 },
          attributes: ["idImage", "price", "idColor", "idProduct"],
        });

        if (productDetails.length === 0) return null;

        const trademark = await Trademark.findOne({
          where: { brandCode: product.idTrademark },
        });

        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set(productDetails.map((detail) => detail.idColor));

        return {
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark: trademark ? trademark.name : null,
          idImage,
          price,
          color: Array.from(allColors),
        };
      })
    );
    const filteredData = data.filter((item) => item !== null);
    return res.json({
      status: 200,
      message: "Lấy sản phẩm thành công",
      data: filteredData,
    });
  } catch (e) {
    console.log("Lỗi lấy toàn bộ sản phẩm: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

const productActive = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: { status: 1 },
      attributes: ["name", "productCode"],
    });

    if (products.length === 0) {
      return res.json({
        status: 400,
        message: "Không có sản phẩm nào hoạt động !",
      });
    }

    const productIds = products.map((v) => v.productCode);

    const productDetail = await ProductDetails.findAll({
      where: {
        status: 1,
        idProduct: {
          [Op.in]: productIds,
        },
      },
    });

    if (productDetail.length === 0) {
      return res.json({
        status: 400,
        message: "Không có sản phẩm chi tiết nào hoạt động !",
      });
    }

    // 👉 Lấy tất cả màu và size liên quan
    const [colors, sizes] = await Promise.all([
      Color.findAll({ attributes: ["colorCode", "name"] }),
      Size.findAll({ attributes: ["sizeCode", "name"] }),
    ]);

    // 👉 Merge dữ liệu
    const mergedData = productDetail.map((detail) => {
      const product = products.find((p) => p.productCode === detail.idProduct);
      const color = colors.find((c) => c.colorCode === detail.idColor);
      const size = sizes.find((s) => s.sizeCode === detail.idSize);

      return {
        ...detail.toJSON(),
        productName: product ? product.name : null,
        colorName: color ? color.name : null,
        sizeName: size ? size.name : null,
      };
    });

    return res.json({
      status: 200,
      message: "Thành công !",
      data: mergedData,
    });
  } catch (e) {
    console.log("lỗi lấy sản phẩm hoạt động: ", e);
    return res.json({
      status: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  product,
  getProducts,
  statusProduct,
  createProductDetail,
  deleteProduct,
  updateProduct,
  getTenProductUser,
  getProductById,
  getProductByTrademark,
  getAllProduct,
  getProduct,
  updateProductDetail,
  statusProductDetail,
  getProductByIdForUser,
  productActive,
};
