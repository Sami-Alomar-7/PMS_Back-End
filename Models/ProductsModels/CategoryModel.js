const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Category = sequelize.define('categories', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image_url: Sequelize.STRING
}, {
    timestamps: false
});

module.exports = Category;