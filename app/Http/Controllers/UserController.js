const Auth = require("../../Helpers/Auth")

module.exports = {
    getUser: async (req, res) => {
        const user = await Auth.user(req)

        if (user.error) {
            return res.json({
                message: "Api key not valid",
                status: 403,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: user,
            errors: false
        })
    }
};
