const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Company = sequelize.define('companies', {
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
    location: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM,
        values: ['products','drugs','rows','productsAndDrugs','productsAndrows','drugsAndRows','all'],
        allowNull: false
    },
    image_url: Sequelize.STRING
}, {
    timestamps: false
});

module.exports = Company;