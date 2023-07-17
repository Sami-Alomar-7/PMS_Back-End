module.exports = (req, res, next) => {
    if(!req.roleId)
        return next({
            status: 401,
            message: 'Not Authorized'
        })

    if(req.roleId !== 1 && req.roleId !== 3)
        return next({
            status: 401,
            message: 'Not Authorized As An Admin Or A Laboratory Worker'
        })

    if(req.roleId === 1 || req.roleId === 3)
        next();
};