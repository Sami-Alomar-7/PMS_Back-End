const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const RowCategory = sequelize.define('rows_categories', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = RowCategory;