const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const LaboratoryProduct = sequelize.define('lab_products', {
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
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    usage: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    image_url: Sequelize.STRING,
    expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = LaboratoryProduct;