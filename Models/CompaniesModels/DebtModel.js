const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Debt = sequelize.define('debts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    debt: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    credit: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
});

module.exports = Debt;