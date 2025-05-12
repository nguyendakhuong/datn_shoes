module.exports = (sequelize, DataTypes) => {
  const Riview = sequelize.define(
    "Riviews",
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
      customerCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productDetailCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sart: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "Riviews",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );
  return Riview;
};
