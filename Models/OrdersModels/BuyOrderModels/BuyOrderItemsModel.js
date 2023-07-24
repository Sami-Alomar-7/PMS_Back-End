const { Sequelize } = require("sequelize");
const sequelize = require('../../../Util/database');

const BuyOrderItem = sequelize.define('buy_order_items', {
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
    left_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0
    }
});

module.exports = BuyOrderItem;