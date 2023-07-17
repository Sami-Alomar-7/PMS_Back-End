module.exports = (req, res, next) => {
    if(!req.roleId)
        return next({
            status: 401,
            message: 'Not Authorized'
        })

    if(req.roleId !== 1)
        return next({
            status: 401,
            message: 'Not Authorized As An Admin'
        })
    
    if(req.roleId === 1)
        next();
};