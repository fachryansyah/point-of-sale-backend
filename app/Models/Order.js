const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")
const OrderItem = require("./OrderItem")
const User = require("./User")

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
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: "orders.user_id",
                    to: "users.id"
                } 
            }
        }
    }
}

module.exports = Order;
