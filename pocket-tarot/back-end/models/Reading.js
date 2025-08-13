const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize");
const User = require("./User");

class Reading extends Model {}

Reading.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cardName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardEmoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardMeaning: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardFuture: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    mood: {
      type: DataTypes.ENUM("сайн", "дунд", "муу", "тодорхойгүй"),
      defaultValue: "тодорхойгүй",
    },
    readingDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Reading",
    timestamps: true,
  }
);

Reading.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Reading, { foreignKey: "userId" });

module.exports = Reading;
