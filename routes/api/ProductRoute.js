const express = require("express")
const Router = express.Router()
const ProductController = require("../../app/Http/Controllers/ProductController")

// middleware request rules
const CreateProductRules = require("../../app/Http/Rules/Product/CreateProductRules")
const UpdateProductRules = require("../../app/Http/Rules/Product/UpdateProductRules")
const SearchProductRules = require("../../app/Http/Rules/Product/SearchProductRules")

Router
    .get("/", ProductController.getProduct)
    .post("/create", CreateProductRules, ProductController.createProduct)
    .put("/update/:id", UpdateProductRules, ProductController.updateProduct)
    .delete("/delete/:id", ProductController.deleteProduct)
    .post("/search", SearchProductRules, ProductController.searchProduct)

module.exports = Router;
