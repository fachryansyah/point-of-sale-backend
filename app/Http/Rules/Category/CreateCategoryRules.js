const { body } = require("express-validator")

const CreateCategoryRules = [
    body("name", "field name can't be null").exists(),
    body("name", "field name maximal 110 character").isLength({max: 110}),
]

module.exports = CreateCategoryRules;
