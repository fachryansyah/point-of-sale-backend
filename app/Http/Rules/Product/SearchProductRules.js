const { body } = require("express-validator")

const SearchProductRules = [
    body("keyword", "field keyword can't be null").exists(),
    body("keyword", "field keyword maximal 100 character").isLength({max: 100})
]

module.exports = SearchProductRules;
