const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")
const Product = require("./Product")

Model.knex(knex)

class OrderItems extends Model{
    static get tableName(){
        return "order_items"
    }
    static get relationMappings(){
        return {
            product: {
                relation: Model.HasOneRelation,
                modelClass: Product,
                join: {
                    from: "order_items.product_id",
                    to: "products.id"
                }
            }
        }
    }
}

module.exports = OrderItems;
