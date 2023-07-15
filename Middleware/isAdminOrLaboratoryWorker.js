module.exports = (req, res, next) => {
    if(!req.roleId)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authorized'
        });

    if(req.roleId !== 1 && req.roleId !== 3)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authorized As An Admin Or A Laboratory Worker'
        });
    
    if(req.roleId === 1 || req.roleId === 3)
        next();
};