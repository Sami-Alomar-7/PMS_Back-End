const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const CompanyRowItem = sequelize.define('company_row_items', {
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

module.exports = CompanyRowItem;