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
    }
};
