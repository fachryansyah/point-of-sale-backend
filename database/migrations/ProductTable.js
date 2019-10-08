const knex = require("../connection")

exports.up = (knex) => {
    return knex.schema.createTable("products", (table) => {
        table.increments("id").primary()
        table.string("name")
        table.text("description")
        table.string("image")
        table.integer("price")
        table.integer("qty")
        table.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
        table.dateTime('updated_at').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    })
}
