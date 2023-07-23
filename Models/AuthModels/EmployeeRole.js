const { Sequelize } = require('sequelize');
const sequelize = require('../../Util/database');

const EmployeeRole = sequelize.define('employee_role', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    salary: Sequelize.INTEGER,
    employee_of_the_month: {
        type: Sequelize.BOOLEAN,
        default: false
    }
}, {
    timestamps: false
});

module.exports = EmployeeRole;