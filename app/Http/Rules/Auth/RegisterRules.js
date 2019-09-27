const { body } = require("express-validator")

const RegisterRules = [
    body("firstname", "field firstname can't be null").exists(),
    body("firstname", "field firstname maximal 60 character").isLength({max:60}),
    body("lastname", "field lastname can't be null").exists(),
    body("lastname", "field lastname maximal 60 character").isLength({max:60}),
    body("email", "field email can't be null").exists(),
    body("email", "email not valid").isEmail(),
    body("password", "field password can't be null").exists(),
    body("password", "field password maximal 50 character").isLength({max: 50}),
    body("password", "field password minimum 6 character").isLength({min: 6})
]

module.exports = RegisterRules;
