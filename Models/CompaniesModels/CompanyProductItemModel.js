const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const CompanyProductItem = sequelize.define('company_product_items', {
    company_product_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = CompanyProductItem;