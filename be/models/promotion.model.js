module.exports = (sequelize, DataTypes) => {
  const Promotion = sequelize.define(
    "Promotion", // Khuyến mãi
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      promotionCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      promotionLevel: {
        // Mức khuyến mãi
        type: DataTypes.STRING,
        allowNull: false,
      },
      promotionType: {
        // Hình thức khuyến mãi
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      conditionsOfApplication: {
        // Điều kiện áp dụng
        type: DataTypes.STRING,
        allowNull: false,
      },
      maximumPromotion: {
        // mức khuyến mãi tối đa
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Promotions",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );

  return Promotion;
};
