const Auth = require("../../Helpers/Auth")

module.exports = {
    login: async (req, res) => {

        const credential = {
            email : req.body.email,
            password: req.body.password
        }

        const isLoggedIn = await Auth.attempt(credential)
        
        if (isLoggedIn.error) {
            return res.json({
                message: isLoggedIn.message,
                status: 500,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE logged in",
            status: 200,
            data: isLoggedIn,
            errors: false
        })
    },
    register: async (req, res) => {
        const register = await Auth.register(req)

        if (!register) {
            return res.json({
                message: "Can't register this user",
                status: 500,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: {},
            errors: false
        })
    }
};
