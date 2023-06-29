const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const Raw = sequelize.define('raws', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    barcode: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dosage: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image_url: Sequelize.STRING,
    manufactorer_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
}, {
    timestamps: false
});

module.exports = Raw;