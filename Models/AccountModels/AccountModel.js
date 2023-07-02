const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Account = sequelize.define('accounts', {
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

module.exports = Account;