const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const LaboratoryProductRaws = sequelize.define('lab_products_raws', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = LaboratoryProductRaws;