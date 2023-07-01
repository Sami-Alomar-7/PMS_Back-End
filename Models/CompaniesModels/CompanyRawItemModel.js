const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const CompanyRowItem = sequelize.define('company_raw_items', {
    company_raw_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = CompanyRowItem;