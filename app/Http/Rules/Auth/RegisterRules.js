const { body } = require("express-validator")
const User = require("../../../Models/User")

const RegisterRules = [
    body("firstname", "field Firstname can't be null").exists(),
    body("firstname", "field Firstname maximal 60 character").isLength({max:60}),
    body("lastname", "field Lastname can't be null").exists(),
    body("lastname", "field Lastname maximal 60 character").isLength({max:60}),
    body("email", "field Email can't be null").exists(),
    body("email", "Email not valid").isEmail(),
    body("email", "Email already in use").custom(value => {
        const user = User.query().findOne({
            email: value
        })

        return (user instanceof User == false ? true : false)
    }),
    body("password", "field Password can't be null").exists(),
    body("password", "field Password maximal 50 character").isLength({max: 50}),
    body("password", "field Password minimum 6 character").isLength({min: 6})
]

module.exports = RegisterRules;
