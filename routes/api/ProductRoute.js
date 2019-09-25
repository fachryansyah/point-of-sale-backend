const express = require("express")
const Router = express.Router()
const ProductController = require("../../app/Http/Controllers/ProductController")

// middleware auth
const ApiAuth = require("../../app/Http/Middleware/ApiAuth")

// middleware request rules
const CreateProductRules = require("../../app/Http/Rules/Product/CreateProductRules")
const UpdateProductRules = require("../../app/Http/Rules/Product/UpdateProductRules")
const PatchQtyRules = require("../../app/Http/Rules/Product/PatchQtyRules")

Router
    .get("/", ProductController.getProduct)
    .post("/", CreateProductRules, ProductController.createProduct)
    .put("/:id", UpdateProductRules, ProductController.updateProduct)
    .delete("/:id", ProductController.deleteProduct)
    .patch("/qty/:id", PatchQtyRules, ProductController.patchQtyProduct)

module.exports = Router;
