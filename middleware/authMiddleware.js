const jwt = require('jsonwebtoken')
const sessionStorage = require('sessionstorage-for-nodejs')
const SECRET_KEY = process.env['SECRET_KEY']

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }

    try {
        const token = sessionStorage.getItem('token')
        // const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
        const decodedData = jwt.verify(token, SECRET_KEY)
        req.user = decodedData
        console.log(`logged as ${decodedData.username}. iat ${decodedData.iat}, exp ${decodedData.exp}`)
        next()
    } catch (e) {
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
};
