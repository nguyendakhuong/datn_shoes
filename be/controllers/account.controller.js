const bcrypt = require("bcrypt");
const { Account, Admin, Client, Cart, Address } = require("../models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const generateUniqueCode = async (model, columnName) => {
  let code;
  let exists;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    exists = await model.findOne({ where: { [columnName]: code } });
  } while (exists);
  return code;
};

const register = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu(username || password || name)",
      });
    }
    const tokenUp = req.headers.authorization;
    let adminCreate = "";
    if (tokenUp) {
      const token = tokenUp.split(" ")[1];
      const decoded = jwt.verify(token, signPrivate);
      adminCreate = await Account.findOne({ where: { id: decoded.id } });
      if (!adminCreate) {
        return res.json({
          status: 400,
          message: "Tài khoản không tồn tại!",
        });
      }
    }

    const existingAccount = await Account.findOne({
      where: { username },
    });

    if (existingAccount) {
      return res.json({
        status: 400,
        message: "Tài khoản đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    let employeeCode = "";
    let customerCode = "";
    let clientId = "";

    if (adminCreate) {
      employeeCode = await generateUniqueCode(Admin, "employeeCode");
      await Admin.create({
        employeeCode,
        name,
        sex: "",
        address: "",
        phoneNumber: "",
        email: "",
        position: "",
        dob: "",
        status: 1,
        creator: adminCreate.name,
        updater: "",
      });
    } else {
      customerCode = await generateUniqueCode(Client, "customerCode");
      const newClient = await Client.create({
        customerCode,
        name,
        sex: "",
        phoneNumber: "",
        email: "",
        dob: "",
        status: 1,
        creator: name,
        updater: "",
      });
      clientId = newClient.id;
      const cartCode = await generateUniqueCode(Cart, "cartCode");
      await Cart.create({
        cartCode,
        idCustomer: clientId,
        idProductDetail: "",
      });
    }

    await Account.create({
      username,
      name,
      password: hashedPassword,
      accountType: adminCreate.name ? "admin" : "user",
      status: 1,
      creator: adminCreate.name || "",
      updater: "",
      employeeCode,
      customerCode,
    });

    return res.json({
      status: 201,
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    console.error("Lỗi đăng kí: ", error);
    return res.json({ status: 500, message: "Lỗi server register" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const signPrivate = process.env.SIGN_PRIVATE;
    if (!username || !password) {
      return res.json({
        status: 401,
        message: "Thiếu dữ liệu(username || password)",
      });
    }

    const result = await Account.findOne({
      where: { username },
    });

    if (!result) {
      return res.json({ status: 401, message: "Tài khoản không tồn tại" });
    }
    if (result.status === 2) {
      return res.json({
        status: 400,
        message: "Tài khoản của bạn đã bị khóa",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, result.password);

    if (!isPasswordMatch) {
      return res.json({ status: 401, message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: result.id, username: result.username },
      signPrivate,
      { expiresIn: "1y" }
    );
    return res.json({
      status: 200,
      data: {
        result: result,
        token: token,
      },
      message: "Login thành công!",
    });
  } catch (error) {
    console.error("Lỗi đăng nhập: ", error);
    return res.json({ status: 500, message: "Lỗi server login" });
  }
};

const logout = async (req, res) => {
  try {
    await Token.destroy({
      where: {
        username: req.data.username,
      },
    });
    return res.json({ status: 200, message: "Logout thành công!" });
  } catch (error) {
    console.error("Lỗi đăng xuất: ", error);
    return res.json({ status: 500, message: "Lỗi server" });
  }
};

module.exports = {
  register,
  login,
  logout,
};
