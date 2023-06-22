const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Product = sequelize.define('products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    barcode: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dosage: {
        type: Sequelize.STRING,
        allowNull: false
    },
    manefactorer_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    image_url: Sequelize.STRING
}, {
    timestamps: false
});

module.exports = Product;