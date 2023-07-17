module.exports = (err, req, res, next) => {
    if(err.status === 400)
        return res.status(400).json({
            operation: 'Failed',
            message: err.message
        })
    else if(err.status == 401)
        return res.status(401).json({
            operation: 'Failed',
            message: err.message
        })
    else
        return res.status(500).json({
            operation: 'Failed',
            message: err.message
        })
}