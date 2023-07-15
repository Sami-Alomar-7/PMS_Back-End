const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Laboratory = sequelize.define('laboratories', {
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
    phone_number: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image_url: Sequelize.STRING,
}, {
    timestamps: false
});

module.exports = Laboratory;