const {
  Account,
  Products,
  ProductDetails,
  Color,
  Size,
  Image,
  Material,
  Trademark,
  Origin,
} = require("../models");
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
const product = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { name, description, trademark, origin, material, details } =
      req.body;
    const token = req.headers.authorization.split(" ")[1];

    const parsedDetails =
      typeof details === "string" ? JSON.parse(details) : details;

    parsedDetails.forEach((detail, index) => {
      detail.image = req.files[index].path;
    });
    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      res.json({
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
    const idMaterial = await Material.findOne({ where: { name: material } });
    const idTrademark = await Trademark.findOne({ where: { name: trademark } });
    const idOrigin = await Origin.findOne({ where: { name: origin } });

    if (productCode) {
      const newProduct = await Products.create({
        productCode,
        name,
        description,
        status: 2,
        creator: account.name,
        updater: "",
        idMaterial: idMaterial.materialCode,
        idTrademark: idTrademark.brandCode,
        idOrigin: idOrigin.originCode,
      });

      if (newProduct) {
        const colorIds = {};
        const sizeIds = {};
        const imageIds = {};

        for (const detail of parsedDetails) {
          let colorData = await Color.findOne({
            where: { name: detail.color },
          });
          if (!colorData) {
            res.json({
              status: 400,
              message: "Không tìm thấy màu trong database",
            });
          } else {
            colorIds[detail.color] = colorData.colorCode;
          }

          colorIds[detail.color] = detail.colorCode;

          if (!sizeIds[detail.size]) {
            let sizeRecord = await Size.findOne({
              where: { name: detail.size },
            });
            if (!sizeRecord) {
              const sizeCode = await generateUniqueCode(Size, "sizeCode");
              sizeRecord = await Size.create({
                sizeCode,
                name: detail.size,
                status: 1,
                creator: account.name,
                updater: "",
              });
            }
            sizeIds[detail.size] = sizeRecord.sizeCode;
          }

          if (!imageIds[detail.image]) {
            const imageUrl = detail.image;
            const imageName = imageUrl.split("/").pop();

            let imageRecord = await Image.findOne({
              where: { imageCode: imageUrl },
            });
            if (!imageRecord) {
              imageRecord = await Image.create({
                imageCode: imageUrl,
                name: imageName,
                status: 1,
                creator: account.name,
                updater: "",
              });
            }
            imageIds[detail.image] = imageRecord.imageCode;
          }
        }
        const productDetails = await Promise.all(
          parsedDetails.map(async (detail) => {
            const productDetailCode = await generateUniqueCode(
              ProductDetails,
              "productDetailCode"
            );
            return {
              productDetailCode,
              quantity: detail.quantity,
              price: detail.price,
              status: 2,
              idProduct: productCode,
              idColor: colorIds[detail.color] || null,
              idSize: sizeIds[detail.size] || null,
              idImage: imageIds[detail.image] || null,
            };
          })
        );

        await ProductDetails.bulkCreate(productDetails);

        for (const detail of parsedDetails) {
          await Color.update(
            { colorCode: detail.colorCode, updater: account.name },
            { where: { name: detail.color } }
          );
        }
      }
    }

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
    const listProductDetails = await ProductDetails.findAll({
      where: {
        status: { [Op.not]: 3 },
      },
    });

    const productIds = [
      ...new Set(listProductDetails.map((item) => item.idProduct)),
    ];
    const sizeIds = [...new Set(listProductDetails.map((item) => item.idSize))];

    const productList = await Products.findAll({
      where: { productCode: productIds },
      attributes: ["name", "productCode"],
      raw: true,
    });

    const sizeList = await Size.findAll({
      where: { sizeCode: sizeIds },
      attributes: ["name", "sizeCode"],
      raw: true,
    });
    const productMap = {};
    productList.forEach((product) => {
      productMap[product.productCode] = product.name;
    });

    const sizeMap = {};
    sizeList.forEach((size) => {
      sizeMap[size.sizeCode] = size.name;
    });
    const listProduct = listProductDetails.map((item) => {
      return {
        ...item,
        productName: productMap[item.idProduct] || null,
        sizeName: sizeMap[item.idSize] || null,
      };
    });

    return res.json({
      status: 200,
      message: "Thành công",
      data: listProduct,
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
    const product = await ProductDetails.findOne({ where: { id } });
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
    const product = await ProductDetails.findOne({ where: { id } });
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
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productDetail = await ProductDetails.findOne({
      where: { id },
      raw: true,
    });

    if (!productDetail) {
      return res.json({ status: 404, message: "Không tìm thấy sản phẩm" });
    }
    const product = await Products.findOne({
      where: { productCode: productDetail.idProduct },
      attributes: [
        "name",
        "description",
        "creator",
        "updater",
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
    console.log(productDetail.idSize);
    const size = await Size.findOne({
      where: { sizeCode: productDetail.idSize },
      attributes: ["name"],
      raw: true,
    });
    const data = {
      id: productDetail.id,
      productDetailCode: productDetail.productDetailCode,
      quantity: productDetail.quantity,
      price: productDetail.price,
      status: productDetail.status,
      idProduct: productDetail.idProduct,
      idColor: productDetail.idColor,
      idSize: size ? size.name : null,
      idImage: productDetail.idImage,
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
    const {
      idProduct,
      productDetailCode,
      trademark,
      origin,
      material,
      color,
      idColor,
      idSize,
      quantity,
      price,
      imageUrl,
    } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    let imagePath = imageUrl;
    if (req.file) imagePath = req.file.path;

    const decoded = jwt.verify(token, signPrivate);
    const account = await Account.findOne({ where: { id: decoded.id } });
    if (!account) {
      res.json({
        status: 400,
        message: "Không tìm thấy tài khoản",
      });
    }
    const filterImage = await Image.findOne({
      where: { imageCode: imagePath },
    });
    if (!filterImage) {
      const imageName = imagePath.split("/").pop();
      await Image.create({
        imageCode: imagePath,
        name: imageName,
        status: 1,
        creator: account.name,
        updater: "",
      });
    }
    const size = await Size.findOne({ where: { name: idSize } });
    if (!size) {
      let sizeCode = generateUniqueCode(Size, "sizeCode");
      await Size.create({
        sizeCode,
        name: idSize,
        status: 1,
        creator: account.name,
        updater: "",
      });
    }
    const filterColor = await Color.findOne({ where: { name: color } });
    if (filterColor) {
      filterColor.colorCode = idColor;
      filterColor.updater = account.name;
      await filterColor.save();
    } else {
      return res.json({
        status: 400,
        message: "Không tìm thấy màu",
      });
    }
    const product = await Products.findOne({
      where: { productCode: idProduct },
    });
    if (!product) {
      return res.json({
        status: 400,
        message: "Không tìm thấy sản phẩm",
      });
    }
    product.idMaterial = material;
    product.idTrademark = trademark;
    product.idOrigin = origin;
    (product.updater = account.name), await product.save();

    const productDetail = await ProductDetails.findOne({
      where: { productDetailCode },
    });
    productDetail.quantity = quantity;
    productDetail.price = price;
    productDetail.idColor = filterColor.colorCode;
    productDetail.idSize = idSize;
    productDetail.idImage = imagePath;
    await productDetail.save();

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
const getTenProductUser = async (req, res) => {
  try {
    const products = await Products.findAll({
      attributes: ["productCode", "name", "idTrademark"],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    let data = [];

    for (const product of products) {
      const productDetails = await ProductDetails.findAll({
        where: { idProduct: product.productCode, status: 1 },
        attributes: ["idImage", "price", "idColor", "idProduct"],
      });
      if (!productDetails || productDetails.length === 0) {
        return res.json({
          status: 400,
          message: "Không có sản phẩm hoạt động",
        });
      }
      const trademark = await Trademark.findOne({
        where: { brandCode: product.idTrademark },
      });
      if (productDetails.length > 0) {
        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set();
        productDetails.forEach((detail) => {
          allColors.add(detail.idColor);
        });
        data.push({
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark: trademark.name,
          idImage,
          price,
          color: Array.from(allColors),
        });
      }
    }

    return res.json({
      status: 200,
      message: "Lấy sản phẩm thành công",
      data,
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
      where: { idProduct: product.productCode, status: 1 },
      utes: [
        "id",
        "productDetailCode",
        "idImage",
        "price",
        "quantity",
        "color",
        "idSize",
      ],
    });

    const sizeIds = [...new Set(productDetails.map((detail) => detail.idSize))];

    const sizes = await Size.findAll({
      where: { sizeCode: sizeIds },
      attributes: ["sizeCode", "name"],
    });

    const sizeMap = sizes.reduce((acc, size) => {
      acc[size.sizeCode] = size.name;
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
        size: sizeMap[detail.idSize] || null,
      };
    });

    const data = {
      code: product.productCode,
      name: product.name,
      description: product.description,
      material: material.name,
      trademark: trademark.name,
      origin: origin.name,
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
      where: { idTrademark: getTrademark.brandCode },
      attributes: ["productCode", "name"],
      order: [["createdAt", "DESC"]],
    });

    if (products.length === 0) {
      return res.json({
        status: 400,
        message: "Không thấy sản phẩm có thương hiệu này",
      });
    }
    let data = [];

    for (const product of products) {
      const productDetails = await ProductDetails.findAll({
        where: { idProduct: product.productCode, status: 1 },
        attributes: ["idImage", "price", "idColor", "idProduct"],
      });
      if (!productDetails || productDetails.length === 0) {
        return res.json({
          status: 400,
          message: "Không có sản phẩm hoạt động",
        });
      }

      if (productDetails.length > 0) {
        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set();
        productDetails.forEach((detail) => {
          allColors.add(detail.idColor);
        });
        data.push({
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark,
          idImage,
          price,
          color: Array.from(allColors),
        });
      }
    }
    return res.json({
      status: 200,
      message: "Thành công",
      data,
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
    });

    let data = [];

    for (const product of products) {
      const productDetails = await ProductDetails.findAll({
        where: { idProduct: product.productCode, status: 1 },
        attributes: ["idImage", "price", "idColor", "idProduct"],
      });
      if (!productDetails || productDetails.length === 0) {
        return res.json({
          status: 400,
          message: "Không có sản phẩm hoạt động",
        });
      }
      const trademark = await Trademark.findOne({
        where: { brandCode: product.idTrademark },
      });
      if (productDetails.length > 0) {
        const { idImage, price, idProduct } = productDetails[0];
        let allColors = new Set();
        productDetails.forEach((detail) => {
          allColors.add(detail.idColor);
        });
        data.push({
          id: idProduct,
          productCode: product.productCode,
          name: product.name,
          trademark: trademark.name,
          idImage,
          price,
          color: Array.from(allColors),
        });
      }
    }
    return res.json({
      status: 200,
      message: "Lấy sản phẩm thành công",
      data,
    });
  } catch (e) {
    console.log("Lỗi lấy toàn bộ sản phẩm: ", e);
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
  getProduct,
  deleteProduct,
  updateProduct,
  getTenProductUser,
  getProductById,
  getProductByTrademark,
  getAllProduct,
};
