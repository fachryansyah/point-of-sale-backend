const { raw } = require('objection')
const moment = require('moment-timezone');
const Order = require('../../Models/Order')
const OrderItem = require('../../Models/OrderItem')
const Product = require('../../Models/Product')
const Auth = require("../../Helpers/Auth")

const OrderController = {
    getOrder: async(req, res) => {
        const page = req.query.page ? req.query.page-1 : 1
        const limit = req.query.limit ? req.query.limit : 8
        const receipt = req.query.receipt ? req.query.receipt : ''

        const user = await Auth.user(req)
        let orders = await Order.query()
        .where('user_id', user.id)
        .where('receipt_no', 'LIKE', '%' + receipt + '%')
        .orderBy('created_at', 'desc')
        .page(page, limit)

        const totalOrder = await Order.query()
        .where('user_id', user.id)
        .resultSize()

        const totalPage = Math.round(totalOrder / limit)
        const currentPage = req.query.page ? parseInt(req.query.page) : 1

        orders.totalPage = totalPage
        orders.currentPage = currentPage

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
        const { amount, items } = req.body

        const now = new Date()

        const user = await Auth.user(req)

        const order = await Order.query().insert({
            user_id: user.id,
            receipt_no: now.getTime(),
            amount: amount
        })

        console.log(items)

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
                product_id: valRP.id,
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

        return res.json({
            message: "OKE!",
            status: 200,
            data: {
                receipt_no: order.receipt_no,
                order_items: orderItem,
                amount: order.amount,
            },
            errors: false
        })
    },
    getIncomeOrder: async (req, res) => {
        
        const mode = req.query.mode ? req.query.mode : 'today'

        let data = {}

        switch (mode) {
            case 'today':
                data = await OrderController.getIncomeToday()
                break;
            case 'yearly':
                data = await OrderController.getIncomeYear()
                break;
            default:
                break;
        }
        
        return res.json({
            message: "OKE!",
            status: 200,
            data: data,
            errors: false
        })
    },
    getIncomeToday: async() => {
        const now = moment().format('Y-M-D')

        const currentIncome = await Order.query()
        .select(raw('SUM(amount) as income'))
        .where(raw('DATE(created_at)'), now)

        const lastIncome = await Order.query()
        .select(raw('SUM(amount) as income'))
        .where(raw('DATE(created_at)'), moment().subtract(1, 'day').format('Y-M-D'))

        if (currentIncome[0].income == null) {
            currentIncome[0].income = 0
        }

        let substractIncome = currentIncome[0].income - lastIncome[0].income

        let calculate = (substractIncome / lastIncome[0].income) * 100

        console.log(currentIncome)

        return {
            income: currentIncome[0].income,
            precentage: parseFloat(calculate.toFixed(2))
        }
    },
    getIncomeYear: async () => {

        const currentDate = [
            moment().subtract(1, 'year').format('Y-M-D'),
            moment().format('Y-M-D')
        ]

        const lastDate = [
            moment().subtract(2, 'year').format('Y-M-D'),
            moment().subtract(1, 'year').format('Y-M-D')
        ]

        const currentIncome = await Order.query()
        .select(raw('SUM(amount) as income'))
        .whereBetween(raw('DATE(created_at)'), currentDate)

        const lastIncome = await Order.query()
        .select(raw('SUM(amount) as income'))
        .whereBetween(raw('DATE(created_at)'), lastDate)


        let subtractIncome = currentIncome[0].income - lastIncome[0].income

        let calculate = (subtractIncome / lastIncome[0].income) * 100

        if (calculate == Number.POSITIVE_INFINITY || calculate == Number.NEGATIVE_INFINITY) {
            calculate = 0
        }

        let precentage = parseFloat(calculate.toFixed(2))

        return {
            income: currentIncome[0].income,
            precentage: precentage
        }
    },
    getTotalOrder: async (req, res) => {

        const currentDate = [
            moment().subtract(1, 'week').format('Y-M-D'),
            moment().format('Y-M-D')
        ]

        const lastDate = [
            moment().subtract(2, 'week').format('Y-M-D'),
            moment().subtract(1, 'week').format('Y-M-D'),
        ]
        
        const currentOrder = await Order.query()
        .select(raw('COUNT(id) as total'))
        .whereBetween(raw('DATE(created_at)'), currentDate)

        const lastOrder = await Order.query()
        .select(raw('COUNT(id) as total'))
        .whereBetween(raw('DATE(created_at)'), lastDate)

        let subtractOrder = currentOrder[0].total - lastOrder[0].total

        let calculate = (subtractOrder / lastOrder[0].total) * 100

        return res.json({
            message: 'OKE!',
            status: 200,
            data: {
                total: currentOrder[0].total,
                precentage: calculate.toFixed(2)
            },
            errors: false
        })

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
            moment().subtract(1, 'year').format('Y-M-D'),
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
        const mode = req.query.mode ? req.query.mode : 'daily'

        let date = []

        switch (mode) {
            case 'daily':
                date = [
                    moment().subtract(1, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            case 'weekly':
                date = [
                    moment().subtract(7, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            case 'monthly':
                date = [
                    moment().subtract(1, 'month').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            case 'yearly' :
                date = [
                    moment().subtract(365, 'day').format('Y-M-D'),
                    moment().format('Y-M-D')
                ]
                break;
            default:
                break;
        }

        let orders = await Order.query()
        .eager('[order_item.[product], user]')
        .whereBetween(raw('DATE(created_at)'), date)
        .orderBy("created_at", "desc")
        .limit(25)
        .offset(0)

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
    },
}

module.exports = OrderController