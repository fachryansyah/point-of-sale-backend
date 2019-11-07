const express = require("express")
const Router = express.Router()
const ProductController = require("../../app/Http/Controllers/ProductController")

// middleware
const ApiAuth = require("../../app/Http/Middleware/ApiAuth")
const {multerUploads} = require("../../app/Http/Middleware/Multer")

// middleware request rules
const CreateProductRules = require("../../app/Http/Rules/Product/CreateProductRules")
const UpdateProductRules = require("../../app/Http/Rules/Product/UpdateProductRules")
const PatchQtyRules = require("../../app/Http/Rules/Product/PatchQtyRules")

Router
    .get("/", ApiAuth, ProductController.getProduct)
    .get("/:id", ApiAuth, ProductController.showProduct)
    .post("/", [multerUploads, CreateProductRules, ApiAuth], ProductController.createProduct)
    .put("/:id", [multerUploads, UpdateProductRules, ApiAuth], ProductController.updateProduct)
    .delete("/:id", ApiAuth, ProductController.deleteProduct)
    .patch("/qty/:id", [PatchQtyRules, ApiAuth], ProductController.patchQtyProduct)

module.exports = Router;
