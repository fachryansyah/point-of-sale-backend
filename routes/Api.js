const express = require("express")
const Router = express.Router()
const ProductRoute = require("./api/ProductRoute")
const CategoryRoute = require("./api/CategoryRoute")


Router.use("/product", ProductRoute)
Router.use("/category", CategoryRoute)

module.exports = Router;
