module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      cartCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idCustomer: {
        // id khách hàng
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idProductDetail: {
        // id sản phẩm chi tiết
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { paranoid: true, timestamps: true }
  );

  return Cart;
};
