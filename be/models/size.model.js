module.exports = (sequelize, DataTypes) => {
  const Size = sequelize.define(
    "Size",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sizeCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      creator: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updater: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "Sizes",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      paranoid: true,
      timestamps: true,
    }
  );

  return Size;
};
