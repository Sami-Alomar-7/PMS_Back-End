module.exports = (req, res, next) => {
    if(!req.roleId)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authorized'
        });

    if(req.roleId !== 1)
        return res.status(401).json({
            operation: 'Failed',
            message: 'Not Authorized As An Admin'
        });
    
    if(req.roleId === 1)
        next();
};