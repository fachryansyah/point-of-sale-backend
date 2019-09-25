require('dotenv').config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../Models/User")

module.exports = {
    user: async (req) => {
        let apiKey = req.headers.authorization, decoded;
        if (!apiKey) {
            return {
                message: "No api key has been set",
                error: true
            }
        }

        apiKey = apiKey.split(' ')[1]

        try {
            decoded = await jwt.verify(apiKey, process.env.JWT_SECRET);
        } catch (e) {
            return false
        }

        const user = await User.query().findById(decoded.id)

        delete user["id"]
        delete user["password"]

        return user
    },
    check: async (req) => {

    },
    attempt: async (credential) => {

        const user = await User.query()
        .findOne({ email: credential.email })

        if (user instanceof User == false) {
            return {
                message: "Can't find that user",
                error: true
            }
        }

        const isPasswordMatch = await bcrypt.compare(credential.password, user.password)

        if (!isPasswordMatch) {
            return {
                message: "Wrong password",
                error: true
            }
        }

        const token = await jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET)
        console.log(token)
        const updatedUser = await User.query().patchAndFetchById(user.id, {
            api_key : token
        })

        delete updatedUser["id"]
        delete updatedUser["password"]

        return updatedUser
    },
    register: async (req) => {
        const { firstname, lastname, email, password } = req.body
        const fullname = firstname + " " + lastname
        const hashPassword = await bcrypt.hash(password, 14)

        const user = await User.query().insert({
            avatar: "https://ui-avatars.com/api/?size=256&name=" + fullname,
            firstname,
            lastname,
            email,
            password: hashPassword
        })

        if (user instanceof User == false) {
            return false;
        }

        return true
    },
};
