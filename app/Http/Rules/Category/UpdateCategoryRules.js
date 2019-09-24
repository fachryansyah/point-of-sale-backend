const { body } = require("express-validator")

const UpdateCategoryRules = [
    body("name", "field name can't be null").exists(),
    body("name", "field name maximal 110 character").isLength({max: 110}),
]

module.exports = UpdateCategoryRules;
