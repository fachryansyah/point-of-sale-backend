const Auth = require("../../Helpers/Auth")

module.exports = {
    getUser: async (req, res) => {
        const user = await Auth.user(req)

        return res.json({
            message: "OKE",
            status: 200,
            data: user,
            errors: false
        })
    }
};
