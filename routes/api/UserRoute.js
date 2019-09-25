const express = require("express")
const Router = express.Router()
const UserController = require("../../app/Http/Controllers/UserController")

Router
    .get("/", UserController.getUser)

module.exports = Router;
