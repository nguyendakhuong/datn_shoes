module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define(
    "Account",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountType: {
        // loại tài khoản
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
      },
      creator: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updater: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employeeCode: {
        // mã nhân viên
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerCode: {
        // mã khách hàng
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { paranoid: true, timestamps: true }
  );

  return Account;
};
