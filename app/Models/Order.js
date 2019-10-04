const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")

Model.knex(knex)

class Order extends Model{
    static get tableName(){
        return "orders"
    }
}

module.exports = Order;
