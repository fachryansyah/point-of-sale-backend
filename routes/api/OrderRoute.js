const express = require("express")
const Router = express.Router()
const OrderController = require("../../app/Http/Controllers/OrderController")

// middleware auth
const ApiAuth = require("../../app/Http/Middleware/ApiAuth")

Router
    .get("/", ApiAuth, OrderController.getOrder)
    .get("/d/:id", ApiAuth, OrderController.showOrder)
    .post("/", ApiAuth, OrderController.createOrder)
    .get('/chart', ApiAuth, OrderController.chartOrder)
    .get('/chart/weekly', ApiAuth, OrderController.getChartDataWeek)
    .get('/chart/monthly', ApiAuth, OrderController.getChartDataMonth)
    .get('/chart/yearly', ApiAuth, OrderController.getChartDataYear)
    .get('/recent', ApiAuth, OrderController.recentOrder)

module.exports = Router;
