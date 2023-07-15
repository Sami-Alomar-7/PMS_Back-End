const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Order = sequelize.define('laboratory_orders', {
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
        values: ['Accepted', 'Rejected', 'Waiting'],
        default: 'Waiting'
    }
}, {
    timestamps: false
});

module.exports = Order;