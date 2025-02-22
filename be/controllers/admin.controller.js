const { Token, Admin } = require("../models");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const sendEmail = require("../untils/email");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config;

const getAdminId = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, signPrivate);
    const admin = await Admin.findOne({ where: { id: decoded.id } });

    if (!admin) {
      return res.json({
        status: 404,
        message: "Người dùng không tồn tại",
      });
    }
    return res.status(200).json({
      status: 200,
      data: admin,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Lỗi server" });
  }
};

const register = async (req, res) => {
  const signPrivate = process.env.SIGN_PRIVATE;
  try {
    const { email, password, name } = req.body;
    if ((!email, !password, !name)) {
      return res.json({
        status: 400,
        message: "Thiếu dữ liệu(email || password || name)",
      });
    }
    // const token = req.headers.authorization.split("")[1];
    // if (token) {
    //   return res.json({
    //     status: 400,
    //     message: "Thiết token",
    //   });
    // }
    // const decoded = jwt.verify(token, signPrivate);
    // const checkAdmin = await Admin.findOne({ where: { id: decoded.id } });
    // if (!checkAdmin) {
    //   return res.json({
    //     status: 400,
    //     message:
    //       "Tài khoản không tồn tại vui lòng đăng nhập để sử dụng tính năng",
    //   });
    // }
    // if (checkAdmin.dataValues.role != 0) {
    //   return res.json({
    //     status: 400,
    //     message: "Chỉ tài khoản superAdmin mới được phép tạo tài khoản mới",
    //   });
    // }
    const existingAccountAdmin = await Admin.findOne({ where: { email } });

    if (existingAccountAdmin) {
      if (existingAccountAdmin.verified) {
        return res.json({
          status: 400,
          message: "Email đã tồn tại và được xác minh.",
        });
      } else {
        const salt = await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Admin.update(
          { password: hashedPassword, name },
          { where: { id: existingAccountAdmin.id } }
        );

        const newVerificationToken = await Token.create({
          email: existingAccountAdmin.email,
          token: crypto.randomBytes(32).toString("hex"),
        });

        const verificationLink = `${process.env.LOCALHOST}/verify/${existingAccountAdmin.id}/${newVerificationToken.token}`;

        await sendEmail(
          existingAccountAdmin.email,
          "Reverify Email",
          verificationLink
        );

        return res.json({
          status: 200,
          message:
            "Email đã tồn tại nhưng chưa được xác minh. Một email xác minh đã được gửi lại.",
        });
      }
    }
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = await Admin.create({
      email,
      password: hashedPassword,
      name,
      role: 0,
    });

    const newToken = await Token.create({
      email: newAccount.email,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const verificationLink = `${process.env.LOCALHOST}/verify/${newAccount.id}/${newToken.token}`;
    await sendEmail(newAccount.email, "Verify Email", verificationLink);
    return res.json({
      status: 201,
      data: newAccount,
      message:
        "Một email đã được gửi đến tài khoản của bạn. Vui lòng xác minh email của bạn.",
    });
  } catch (error) {
    console.error("Lỗi đăng kí: ", error);
    return res.json({ status: 500, message: "Lỗi server register" });
  }
};
const verifyEmail = async (req, res) => {
  try {
    const user = await Admin.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "link không hợp lệ" });
    }

    const account = await Admin.findOne({ where: { id: req.params.id } });
    const token = await Token.findOne({
      where: {
        email: account.email,
        token: req.params.token,
      },
    });

    if (!token) return res.json({ status: 400, message: "link không hợp lệ" });

    await Admin.update(
      { verified: true },
      {
        where: {
          id: user.id,
        },
      }
    );
    await Token.destroy({ where: { id: token.id } });

    return res.json({
      status: 200,
      message: "Email đã được xác thực",
    });
  } catch (error) {
    console.log("Lỗi xác thực email: ", error);
    return res.json({ status: 500, message: "Lỗi server " });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const signPrivate = process.env.SIGN_PRIVATE;
    if (!email || !password) {
      return res.json({
        status: 401,
        message: "Thiếu dữ liệu(email || password)",
      });
    }

    const result = await Admin.findOne({
      where: { email },
    });

    if (!result) {
      return res.json({ status: 401, message: "Email không tồn tại" });
    }

    const isPasswordMatch = await bcrypt.compare(password, result.password);

    if (!isPasswordMatch) {
      return res.json({ status: 401, message: "Mật khẩu không đúng" });
    }

    // Kiểm tra xem email đã được xác minh chưa
    if (!result.verified) {
      return res.json({ status: 401, message: "Email is not verified" });
    }

    // Tạo và lưu token cho người dùng
    const token = jwt.sign(
      { id: result.id, email: result.email },
      signPrivate,
      { expiresIn: "1y" }
    );
    return res.json({
      status: 200,
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        token: token,
      },
      message: "Login thành công!",
    });
  } catch (error) {
    console.log("Lỗi đăng nhập: ", error);
    return res.json({ status: 500, message: "Lỗi server" });
  }
};
const logout = async (req, res) => {
  try {
    await Token.destroy({
      where: {
        email: req.data.email,
      },
    });
    return res.json({ status: 200, message: "Logout thành công!" });
  } catch (error) {
    console.error("Đăng xuất: ", error);
    return res.json({ message: error.message });
  }
};

module.exports = {
  getAdminId,
  register,
  verifyEmail,
  login,
  logout,
};
