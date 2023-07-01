const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const CompanyProductItem = sequelize.define('company_product_items', {
    company_product_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    expiration_date:{
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = CompanyProductItem;