const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")
const OrderItem = require("./OrderItem")

Model.knex(knex)

class Order extends Model{
    static get tableName(){
        return "orders"
    }
    static get relationMappings(){
        return {
            order_item: {
                relation: Model.HasManyRelation,
                modelClass: OrderItem,
                join: {
                    from: "orders.id",
                    to: "order_items.order_id"
                }
            }
        }
    }
}

module.exports = Order;
