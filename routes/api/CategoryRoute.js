const express = require("express")
const Router = express.Router()
const CategoryController = require("../../app/Http/Controllers/CategoryController")
const CreateCategoryRules = require("../../app/Http/Rules/Category/CreateCategoryRules")
const UpdateCategoryRules = require("../../app/Http/Rules/Category/UpdateCategoryRules")

Router
    .get("/", CategoryController.getCategory)
    .post("/create", CreateCategoryRules, CategoryController.createCategory)
    .put("/update/:id", UpdateCategoryRules, CategoryController.updateCategory)
    .delete("/delete/:id", CategoryController.deleteCategory)

module.exports = Router;
