const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Order = sequelize.define('lab_orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
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
    statu: {
        type: Sequelize.ENUM,
        values: ['Waiting', 'Accepted','Rejected', 'Ready'],
        default: 'Waiting'
    },
    order_number: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Order;