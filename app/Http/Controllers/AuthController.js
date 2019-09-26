const Auth = require("../../Helpers/Auth")

module.exports = {
    /*
    Authenticated user based on Email and Password
    @param req.body : Email, password
    @return Json
    */
    login: async (req, res) => {

        // set the credential for authentication
        const credential = {
            email : req.body.email,
            password: req.body.password
        }

        // try to validate email, and password
        const isLoggedIn = await Auth.attempt(credential)

        // check if error when  validate email, and password
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
    /*
    Register user
    @param req.body : firstname, lastname, email, password
    @return Json
    */
    register: async (req, res) => {
        // try to register new user
        const register = await Auth.register(req)

        // check if when register user has error
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
