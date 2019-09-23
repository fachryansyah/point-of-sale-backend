const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")

Model.knex(knex)

class Product extends Model{
    static get tableName(){
        return "products"
    }
}

module.exports = Product;
