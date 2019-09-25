require('dotenv').config()
const jwt = require("jsonwebtoken")

const ApiAuth = async (req, res, next) => {
    let apiKey = req.headers.authorization;
    if (!apiKey) {
        return res.json({
            message: "No api key has been set",
            status: 403,
            data: {},
            errors: true
        })
    }

    apiKey = apiKey.split(' ')[1]


    try {
        const verify = jwt.verify(apiKey, process.env.JWT_SECRET)
    } catch (e) {
        return res.json({
            message: err.message,
            status: 403,
            data: {},
            errors: true
        })
    }

}

module.exports = ApiAuth;
