const { validationResult } = require("express-validator")
const Category = require("../../Models/Category")

module.exports = {
    getCategory: async (req, res) => {
        const categories = await Category.query()
        res.json({
            message: "OKE",
            status: 200,
            data: categories,
            error: false
        })
    },
    createCategory: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.json({
                message: "Validation error",
                status: 304,
                data: {},
                errors: true
            })
        }

        const category = await Category.query().insert({
            name: req.body.name
        })

        if (category instanceof Category == false) {
            return res.json({
                message: "Can't add category to db",
                status: 500,
                data: {},
                erorrs: true
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: {},
            erorrs: false
        })
    }
};
