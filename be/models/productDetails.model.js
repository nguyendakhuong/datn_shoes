module.exports = (sequelize, DataTypes) => {
  const ProductDetails = sequelize.define(
    "ProductDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      productDetailCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idProduct: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idColor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { paranoid: true, timestamps: true }
  );

  return ProductDetails;
};
