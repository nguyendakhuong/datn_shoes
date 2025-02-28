module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      defaultAddress: {
        // địa chỉ mặc định
        type: DataTypes.STRING,
        allowNull: false,
      },
      province: {
        // tỉnh
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        // huyện
        type: DataTypes.STRING,
        allowNull: false,
      },
      commune: {
        // xã
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idCustom: {
        // id khách hàng
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      creator: {
        // người cập nhật
        type: DataTypes.STRING,
        allowNull: false,
      },
      updater: {
        // người chỉnh sửa
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "Addresses",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );

  return Address;
};
