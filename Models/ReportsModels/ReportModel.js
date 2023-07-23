const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Report = sequelize.define('reports', {
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
    type: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
    }
});

module.exports = Report;