const express = require("express")
const Router = express.Router()
const OrderController = require("../../app/Http/Controllers/OrderController")

// middleware auth
const ApiAuth = require("../../app/Http/Middleware/ApiAuth")

Router
    .get("/", ApiAuth, OrderController.getOrder)
    .get("/:id", ApiAuth, OrderController.showOrder)
    .post("/", ApiAuth, OrderController.createOrder)

module.exports = Router;
