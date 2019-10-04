const express = require("express")
const Router = express.Router()
const UserRoute = require("./api/UserRoute")
const AuthRoute = require("./api/AuthRoute")
const ProductRoute = require("./api/ProductRoute")
const CategoryRoute = require("./api/CategoryRoute")
const OrderRoute = require("./api/OrderRoute")


Router.use("/product", ProductRoute)
Router.use("/category", CategoryRoute)
Router.use("/auth", AuthRoute)
Router.use("/user", UserRoute)
Router.use("/order", OrderRoute)

module.exports = Router;
