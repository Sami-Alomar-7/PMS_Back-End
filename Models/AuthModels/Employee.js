const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Employee = sequelize.define('employee', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image_url: Sequelize.STRING,
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    gender: {
        type: Sequelize.ENUM,
        values: ['male','female'],
        allowNull: false
    },
    statu: {
        type: Sequelize.ENUM,
        default: false,
        values: ['online','offline'],
        defaultValue: 'offline',
        allowNull: false
    },
    token: Sequelize.STRING,
    token_expiration: Sequelize.DATE
}, {
    timestamps: false
});

module.exports = Employee;