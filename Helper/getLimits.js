// Models
const EmployeeRole = require('../Models/AuthModels/EmployeeRole');

let expiration_limit, run_out_limit;

module.exports = async () => {
    try {
    // get the specified limits
    const employeeRole = await EmployeeRole.findOne({where: {id: 1}})
        run_out_limit = employeeRole.run_out_limit;
        expiration_limit = Date.now() + (employeeRole.expiration_limit * 24 * 60 * 60 * 1000);
        return {
            run_out_limit: run_out_limit, 
            expiration_limit: expiration_limit
        };
    } catch(err) {
        throw new Error(err.message)
    }
}