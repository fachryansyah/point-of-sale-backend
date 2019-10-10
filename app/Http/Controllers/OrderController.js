const { raw } = require('objection')
const moment = require('moment-timezone');
const Order = require('../../Models/Order')
const OrderItem = require('../../Models/OrderItem')
const Product = require('../../Models/Product')
const Auth = require("../../Helpers/Auth")

const OrderController = {
    getOrder: async(req, res) => {
        const user = await Auth.user(req)
        const orders = await Order.query()
        .where("user_id", user.id)

        return res.json({
            message: "OKE!",
            status: 200,
            data: orders,
            errors: false
        })
    },
    showOrder: async (req, res) => {
        const user = await Auth.user(req)
        let order = await Order.query()
        .findOne({
            user_id: user.id,
            id: req.params.id
        })

        if (!order) {
            return res.json({
                message: "Order not found",
                status: 404,
                data: {},
                errors: true
            })
        }

        order = order.toJSON()

        let orderItems = await OrderItem.query()
        .eager("product")
        .where("order_id", order.id)

        let totalOrderPrice = 0
        orderItems.forEach((val, key) => {
            let totalPrice = val.toJSON().total_price
            totalOrderPrice += totalPrice
        })

        order.total_price_order = totalOrderPrice
        order.items = orderItems

        if (!order) {
            return res.json({
                message: "Order not found",
                status: 404,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE!",
            status: 200,
            data: order,
            errors: false
        })
    },
    createOrder: async (req, res) => {
        const { items } = req.body

        const now = new Date()

        const user = await Auth.user(req)

        const order = await Order.query().insert({
            user_id: user.id,
            receipt_no: now.getTime()
        })

        if (order instanceof Order == false) {
            return res.json({
                message: "Can't create this order",
                status: 500,
                data: {},
                erorrs: true
            })
        }


        items.forEach( async (val, key) => {

            await OrderItem.query().insert({
                order_id: order.id,
                product_id: val.id,
                qty: val.qty,
                total_price: val.price
            })

            let product = await Product.query().findById(val.id)

            let quantity = product.qty - val.qty

            await Product.query().findById(val.id)
            .patch({
                qty : quantity
            })

        })

        const orderItem = await OrderItem.query()
        .eager("product")
        .where("order_id", order.id)

        let totalPrice = 0
        orderItem.forEach((val, key) => {
            totalPrice += val.total_price
        })

        return res.json({
            message: "OKE!",
            status: 200,
            data: {
                receipt_no: order.receipt_no,
                total_price_order: totalPrice,
                order_items: orderItem
            },
            errors: false
        })
    },
    chartOrder: async (req, res) => {

        const mode = req.query.mode ? req.query.mode : 'week'
        
        let currentOrderDate = []
        let lastOrderDate = []

        // check mode
        switch (mode) {
            case 'week':
                currentOrderDate = [
                    moment().subtract(7, 'days').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                lastOrderDate = [
                    moment().subtract(14, 'days').format('Y-M-D'),
                    moment().subtract(7, 'days').format('Y-M-D')
                ]
                break;
            case 'month':
                currentOrderDate = [
                    moment().subtract(30, 'days').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                lastOrderDate = [
                    moment().subtract(60, 'days').format('Y-M-D'),
                    moment().subtract(30, 'days').format('Y-M-D')
                ]
                break;
            case 'year':
                currentOrderDate = [
                    moment().subtract(365, 'days').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                lastOrderDate = [
                    moment().subtract(730, 'days').format('Y-M-D'),
                    moment().subtract(365, 'days').format('Y-M-D')
                ]
                break;
            default:
                break;
        }

        // ===[get current order]===
        let currentOrder = await OrderController.getOrderForChart(currentOrderDate, mode)

        // ===[get last order]===
        let lastOrder = await OrderController.getOrderForChart(lastOrderDate, mode)


        return res.json({
            message: "OKE!",
            status: 200,
            data: {
                current: currentOrder,
                last: lastOrder
            },
            errors: false
        })
    },
    getOrderForChart: async (date = [], mode = 'week') => {
        
        // find data from db by date
        const order = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(total_price) as amount'))
        .distinct(raw('DATE(created_at)'))
        .eager('order_item')
        .groupBy(raw('MONTH(created_at)'))
        .whereBetween(raw('DATE(created_at)'), date)

        console.log(order)

        let orderData = []

        // convert to json
        order.forEach(val => {
            orderData.push(val.toJSON())
        })

        orderData.forEach(val => {
            let totalPrice = 0

            // get total price of order_item
            val.order_item.forEach(valOrderItem => {
                totalPrice += valOrderItem.total_price
            })

            val.total_order_price = totalPrice
        })

        let data = []
        let label = []
        orderData.forEach(val => {
            data.push(val.total_order_price)
        })
        orderData.forEach(val => {
            switch (mode) {
                case 'week':
                    label.push(moment.tz(val.label, 'Asia/Jakarta').format('dddd'))
                    break;
                case 'month':
                    label.push(moment.tz(val.label, 'Asia/Jakarta').format('dddd'))
                    break;
                case 'year':
                    label.push(moment.tz(val.label, 'Asia/Jakarta').format('MMMM'))
                    break
                default:
                    break;
            }
        })

        return {
            data,
            label
        }
    },
    getChartDataWeek: async (req, res) => {

        let currentOrderDate = [
            moment().subtract(7, 'days').format('Y-M-D'),
            moment().format('Y-M-D')
        ]

        let lastOrderDate = [
            moment().subtract(14, 'days').format('Y-M-D'),
            moment().subtract(7, 'days').format('Y-M-D'),
        ]

        // find data from db by date
        const currentOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('DATE(created_at) as distinct_result'))
        .groupBy(raw('DATE(created_at)'))
        .whereBetween(raw('DATE(created_at)'), currentOrderDate)

        const lastOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('DATE(created_at) as distinct_result'))
        .groupBy(raw('DATE(created_at)'))
        .whereBetween(raw('DATE(created_at)'), lastOrderDate)


        currentOrder.map(val => {
            val.label = moment.tz(val.toJSON().label, 'Asia/Jakarta').format('dddd')
        })

        lastOrder.map(val => {
            val.label = moment.tz(val.toJSON().label, 'Asia/Jakarta').format('dddd')
        })

        return res.json({
            message: "OKE",
            status: 200,
            data: {
                current: currentOrder,
                last: lastOrder

            },
            errors: false
        })

    },
    getChartDataMonth: async (req, res) => {

        let currentOrderDate = [
            moment().subtract(30, 'days').format('Y-M-D'),
            moment().format('Y-M-D')
        ]

        let lastOrderDate = [
            moment().subtract(60, 'days').format('Y-M-D'),
            moment().subtract(30, 'days').format('Y-M-D'),
        ]

        // find data from db by date
        const currentOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('WEEK(created_at) as distinct_result'))
        .groupBy(raw('WEEK(created_at)'))
        .whereBetween(raw('DATE(created_at)'), currentOrderDate)

        const lastOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('WEEK(created_at) as distinct_result'))
        .groupBy(raw('WEEK(created_at)'))
        .whereBetween(raw('DATE(created_at)'), lastOrderDate)


        currentOrder.map((val, key) => {
            val.label = `Week ${key+1}`
        })

        lastOrder.map((val, key) => {
            val.label = `Week ${key+1}`
        })

        return res.json({
            message: "OKE",
            status: 200,
            data: {
                current: currentOrder,
                last: lastOrder

            },
            errors: false
        })

    },
    getChartDataYear: async (req, res) => {

        let currentOrderDate = [
            moment().subtract(365, 'days').format('Y-M-D'),
            moment().format('Y-M-D')
        ]

        let lastOrderDate = [
            moment().subtract(720, 'days').format('Y-M-D'),
            moment().subtract(365, 'days').format('Y-M-D'),
        ]

        // find data from db by date
        const currentOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('MONTH(created_at) as distinct_result'))
        .groupBy(raw('MONTH(created_at)'))
        .whereBetween(raw('DATE(created_at)'), currentOrderDate)

        const lastOrder = await Order.query()
        .select(raw('DATE(created_at) AS label, COUNT(id) AS data, SUM(amount) as amount'))
        .distinct(raw('MONTH(created_at) as distinct_result'))
        .groupBy(raw('MONTH(created_at)'))
        .whereBetween(raw('DATE(created_at)'), lastOrderDate)


        currentOrder.map((val, key) => {
            val.label = moment.tz(val.toJSON().label, 'Asia/Jakarta').format('MMMM')
        })

        lastOrder.map((val, key) => {
            val.label = moment.tz(val.toJSON().label, 'Asia/Jakarta').format('MMMM')
        })

        return res.json({
            message: "OKE",
            status: 200,
            data: {
                current: currentOrder,
                last: lastOrder

            },
            errors: false
        })

    },
    recentOrder: async (req, res) => {
        const mode = req.query.mode ? req.query.mode : 'day'

        let date = []

        switch (mode) {
            case 'day':
                date = [
                    moment().subtract(1, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            case 'week':
                date = [
                    moment().subtract(7, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            case 'month':
                date = [
                    moment().subtract(30, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
            default:
                break;
        }

        let orders = await Order.query()
        .eager('[order_item.[product], user]')
        .whereBetween(raw('DATE(created_at)'), date)

        let orderData = []

        // convert result orm to json
        orders.forEach(val => {
            orderData.push(val.toJSON())
        })

        orderData.forEach(val => {

            let totalPrice = 0

            // get total price of order_item
            val.order_item.forEach(valOrderItem => {
                totalPrice += valOrderItem.total_price
            })

            val.total_order_price = totalPrice
        })

        return res.send({
            message: "OKE!",
            status: 200,
            data: orderData,
            errors: false
        })
    }
}

module.exports = OrderController