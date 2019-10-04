const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")

Model.knex(knex)

class OrderItems extends Model{
    static get tableName(){
        return "order_items"
    }
}

module.exports = OrderItems;
