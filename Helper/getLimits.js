// Models
const Laboratory = require('../Models/LaboratoriesModels/LaboratoryModel');

let expiration_limit, run_out_limit;

module.exports = async () => {
    try {
    // get the specified limits
    const laboratory = await Laboratory.findOne({where: {id: 1}})
        run_out_limit = laboratory.run_out_limit;
        expiration_limit = Date.now() + (laboratory.expiration_limit * 24 * 60 * 60 * 1000);
        return {
            run_out_limit: run_out_limit, 
            expiration_limit: expiration_limit
        };
    } catch(err) {
        throw new Error(err.message)
    }
}