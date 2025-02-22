const nodemailer = require("nodemailer");
require("dotenv").config();
const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    await transporter.sendMail({
      from: "ShoeStore@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email đã được gửi thành công");
  } catch (error) {
    console.log("email chưa được gửi" + error);
  }
};
module.exports = sendEmail;
