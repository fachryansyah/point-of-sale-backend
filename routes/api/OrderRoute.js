const express = require("express")
const Router = express.Router()
const OrderController = require("../../app/Http/Controllers/OrderController")

// middleware auth
const ApiAuth = require("../../app/Http/Middleware/ApiAuth")

Router
    .get("/", ApiAuth, OrderController.getOrder)
    .get("/d/:id", ApiAuth, OrderController.showOrder)
    .post("/", ApiAuth, OrderController.createOrder)
    .get('/income', ApiAuth, OrderController.getIncomeOrder)
    .get('/total', ApiAuth, OrderController.getTotalOrder)
    .get('/chart/weekly', ApiAuth, OrderController.getChartDataWeek)
    .get('/chart/monthly', ApiAuth, OrderController.getChartDataMonth)
    .get('/chart/yearly', ApiAuth, OrderController.getChartDataYear)
    .get('/recent', ApiAuth, OrderController.recentOrder)

module.exports = Router;
