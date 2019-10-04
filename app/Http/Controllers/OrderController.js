const Order = require('../../Models/Order')
const OrderItem = require('../../Models/OrderItem')
const Product = require('../../Models/Product')
const Auth = require("../../Helpers/Auth")

module.exports = {
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
    }
}
