const { body } = require("express-validator")
const User = require("../../../Models/User")

const RegisterRules = [
    body("firstname", "field Firstname can't be null").exists(),
    body("firstname", "field Firstname maximal 60 character").isLength({max:60}),
    body("firstname", "field Firstname minimum 6 character").isLength({min:6}),
    body("lastname", "field Lastname can't be null").exists(),
    body("lastname", "field Lastname maximal 60 character").isLength({max:60}),
    body("lastname", "field Lastname min 6 character").isLength({min:6}),
    body("email", "field Email can't be null").exists(),
    body("email", "Email not valid").isEmail(),
    body("email").custom(async (value) => {
        const user = await User.query().findOne({
            email: value
        })

        console.log(user)
        // check if email is in use
        if (user instanceof User) {
            console.log("email sudah dipakai")
            throw new Error('Email already in use');
        }else{
            console.log("email belum dipakai")
            return true
        }
        
    }),
    body("password", "field Password can't be null").exists(),
    body("password", "field Password maximal 50 character").isLength({max: 50}),
    body("password", "field Password minimum 6 character").isLength({min: 6})
]

module.exports = RegisterRules;
