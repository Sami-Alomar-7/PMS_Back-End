const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const CompanyType = sequelize.define('companies_types', {
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

module.exports = CompanyType;