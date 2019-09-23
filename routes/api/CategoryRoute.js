const express = require("express")
const Router = express.Router()
const CategoryController = require("../../app/Http/Controllers/CategoryController")

Router
    .get("/", CategoryController.getCategory)

module.exports = Router;
