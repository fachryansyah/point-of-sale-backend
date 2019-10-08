const { query } = require("express-validator")

const SearchProductRules = [
    query("action", "param action can't be null").exists()
]

module.exports = SearchProductRules;
