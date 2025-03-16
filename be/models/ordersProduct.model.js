module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define(
    "OrderDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      orderCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderDetailCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameProduct: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productDetailCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "OrderDetail",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );
  return OrderDetail;
};
