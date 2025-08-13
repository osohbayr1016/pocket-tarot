const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: process.env.DATABASE_URL.includes("sslmode=require")
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
});

module.exports = sequelize;
