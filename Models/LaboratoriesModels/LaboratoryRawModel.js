const { Sequelize } = require("sequelize");
const sequelize = require('../../Util/database');

const LaboratoryRaw = sequelize.define('laboratories_raws', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = LaboratoryRaw;