const { Model } = require("objection")
const objection = require("objection")
const knex = require("../../database/connection")
const Category = require("./Category")

Model.knex(knex)

class Product extends Model{
    static get tableName(){
        return "products"
    }
    static get relationMappings(){
        return {
            category: {
                relation: Model.HasOneRelation,
                modelClass: Category,
                join: {
                    from: "products.category_id",
                    to: "categories.id"
                }
            }
        }
    }
}

module.exports = Product;
