const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const ExternalProduct = sequelize.define('external_products', {
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
    manufactorer_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    image_url: Sequelize.STRING,
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

module.exports = ExternalProduct;