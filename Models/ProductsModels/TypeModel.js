const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Type = sequelize.define('types', {
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
    image_url: Sequelize.STRING
}, {
    timestamps: false
});

module.exports = Type;