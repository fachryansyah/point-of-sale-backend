const express = require("express")
const Router = express.Router()
const CategoryController = require("../../app/Http/Controllers/CategoryController")
const CreateCategoryRules = require("../../app/Http/Rules/Category/CreateCategoryRules")

Router
    .get("/", CategoryController.getCategory)
    .post("/create", CreateCategoryRules, CategoryController.createCategory)

module.exports = Router;
