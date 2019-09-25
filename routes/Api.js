const express = require("express")
const Router = express.Router()
const UserRoute = require("./api/UserRoute")
const AuthRoute = require("./api/AuthRoute")
const ProductRoute = require("./api/ProductRoute")
const CategoryRoute = require("./api/CategoryRoute")


Router.use("/product", ProductRoute)
Router.use("/category", CategoryRoute)
Router.use("/auth", AuthRoute)
Router.use("/user", UserRoute)

module.exports = Router;
