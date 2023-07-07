const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Bill = sequelize.define('bills', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    total_price: {
        type: Sequelize.FLOAT,
        default: 0.0,
        allowNull: false
    },
    order_number: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports = Bill;